import type { Creator } from '@/types/creator';
import { fetchCreators, fetchCreatorsByUsernames, type SearchParams, type SearchResult } from './supabase';
import { getScopeRule, type ScopeId } from '@/config/sponsor-placements';
import { getSponsorOverride, type SponsorOverride } from '@/config/sponsor-overrides';

export interface ScopedFetchParams extends Omit<SearchParams, 'excludeUsernames' | 'offsetOverride' | 'fallbackToPopularIfEmpty'> {
  scope: ScopeId;
}

export type ScopedFetchResult = SearchResult;

/**
 * The paid-placement fetch orchestrator. Given a scope ('home', `category:<slug>`,
 * `state:<slug>`, `city:<slug>`, `region:<slug>`, 'search'):
 *
 *   1. Reads that scope's pin/exclude rule from src/config/sponsor-placements.ts.
 *   2. Fetches the organic list with pinned+excluded usernames excluded at the DB level, at
 *      exactly the right offset to leave room for however many pins land on THIS page.
 *   3. Fetches any pinned creators landing on this page by exact username.
 *   4. Slots pinned creators into their exact 1-based global position and fills every other
 *      slot with organic results, in order.
 *   5. Applies src/config/sponsor-overrides.ts (link/image/click-tracking) to EVERY creator in
 *      the result — pinned or not — since an override should follow a creator wherever their
 *      card renders, not just their pinned slot.
 *
 * Pagination note: `position` in sponsor-placements.ts is 1-based against THIS scope's real
 * pageSize (20 on home, 24 elsewhere). Callers must pass the same pageSize on every page of a
 * given scope (SSR and load-more alike) or pins will land on the wrong page.
 */
export async function fetchScopedCreators(params: ScopedFetchParams): Promise<ScopedFetchResult> {
  const { scope, ...rest } = params;
  const rule = getScopeRule(scope);
  const page = rest.page ?? 1;
  const pageSize = rest.pageSize ?? 20;

  const pageStart = (page - 1) * pageSize + 1;
  const pageEnd = page * pageSize;
  const pinnedInRange = rule.pinned.filter((p) => p.position >= pageStart && p.position <= pageEnd);

  // Fast path: nothing pinned or excluded anywhere in this scope — skip all the bookkeeping.
  if (rule.pinned.length === 0 && rule.excluded.length === 0) {
    const result = await fetchCreators({ ...rest, page, pageSize, fallbackToPopularIfEmpty: true });
    return { ...result, creators: applyOverrides(result.creators, EMPTY_SET, scope) };
  }

  const excludeUsernames = [...rule.excluded, ...rule.pinned.map((p) => p.username)];

  // Every pin at or before this page removes one row from earlier in the organic sequence, so
  // the organic offset must shift left by that count to avoid skipping/duplicating rows.
  const pinsBeforeThisPage = rule.pinned.filter((p) => p.position < pageStart).length;
  const organicOffset = (page - 1) * pageSize - pinsBeforeThisPage;
  const organicNeeded = pageSize - pinnedInRange.length;

  const [organicResult, pinnedCreators] = await Promise.all([
    organicNeeded > 0
      ? fetchCreators({
          ...rest,
          excludeUsernames,
          page: undefined,
          pageSize: organicNeeded,
          offsetOverride: Math.max(0, organicOffset),
          fallbackToPopularIfEmpty: true,
        })
      : Promise.resolve<SearchResult>({ creators: [], total: 0, hasMore: false }),
    pinnedInRange.length > 0
      ? fetchCreatorsByUsernames(pinnedInRange.map((p) => p.username), rest.revalidate)
      : Promise.resolve<Creator[]>([]),
  ]);

  const pinnedMap = new Map(pinnedCreators.map((c) => [c.username.toLowerCase(), c]));
  const sponsoredUsernames = new Set(rule.pinned.map((p) => p.username.toLowerCase()));

  const slots: (Creator | null)[] = new Array(pageSize).fill(null);
  for (const p of pinnedInRange) {
    const creator = pinnedMap.get(p.username.toLowerCase());
    if (!creator) continue; // pinned username isn't in the data source yet — skip the slot, don't break the page
    slots[p.position - pageStart] = creator;
  }

  const organicCreators = organicResult.creators;
  let organicIdx = 0;
  for (let i = 0; i < pageSize; i++) {
    if (slots[i] === null) {
      slots[i] = organicCreators[organicIdx] ?? null;
      organicIdx++;
    }
  }

  const finalCreators = applyOverrides(
    slots.filter((c): c is Creator => c !== null),
    sponsoredUsernames,
    scope
  );

  // Total visible records = organic total (already net of exclusions) + pinned count, but never
  // less than the furthest-out pinned position — otherwise a pin placed past the natural end of
  // the list would be unreachable/wouldn't paginate to.
  const highestPinPosition = rule.pinned.reduce((max, p) => Math.max(max, p.position), 0);
  const total = Math.max(organicResult.total + rule.pinned.length, highestPinPosition);
  const hasMore = pageEnd < total;

  return { creators: finalCreators, total, hasMore };
}

const EMPTY_SET = new Set<string>();

/** Small, stable string hash (djb2) — only used to spread scopes across a sponsor's image set. */
function scopeHash(scope: string): number {
  let h = 5381;
  for (let i = 0; i < scope.length; i++) h = ((h << 5) + h + scope.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Per-scope image rotation for sponsored creators (owner's request, 2026-08-27): a visitor who
 * browses from the homepage to a state page to a city page should see a DIFFERENT lead image on
 * the same sponsored card each time, instead of the same one everywhere.
 *
 * The rotation is deterministic per scope — a hash of the scope string picks where in the
 * sponsor's image set (imageOverride + galleryImages, in configured order) that page starts, and
 * the carousel continues cyclically from there. It must be deterministic, not random: the
 * state/city/category pages are pre-built and frozen (see AGENTS.md), and even on the live pages
 * a random pick would make the server-rendered HTML disagree with the client on hydration and
 * fire a second image request on every load. Deterministic also keeps a scope's SSR page and its
 * "Load More" (/api/search?scope=...) responses in step, since both pass the same scope here.
 *
 * 'home' is deliberately pinned to the configured lead image — that's the one the client
 * designated as their #1 and the highest-traffic surface — and every other scope is biased AWAY
 * from it (offset 1..n-1), so leaving the homepage for any state/city/category page is
 * guaranteed to show a different image, not just probably. Creators without an imageOverride
 * (emilylopz: synced avatar first, by her order) are left alone entirely.
 */
function rotateSponsorImages(
  override: SponsorOverride,
  scope: ScopeId,
): Pick<SponsorOverride, 'imageOverride' | 'galleryImages'> {
  const { imageOverride, galleryImages } = override;
  if (!imageOverride || !galleryImages?.length || scope === 'home') return { imageOverride, galleryImages };
  const pool = [imageOverride, ...galleryImages];
  const offset = 1 + (scopeHash(scope) % (pool.length - 1));
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
  return { imageOverride: rotated[0], galleryImages: rotated.slice(1) };
}

function applyOverrides(creators: Creator[], sponsoredUsernames: Set<string>, scope: ScopeId): Creator[] {
  return creators.map((c) => {
    const override = getSponsorOverride(c.username);
    const images = override ? rotateSponsorImages(override, scope) : undefined;
    return {
      ...c,
      ...(override?.linkOverride ? { linkOverride: override.linkOverride } : {}),
      ...(images?.imageOverride ? { imageOverride: images.imageOverride } : {}),
      ...(images?.galleryImages?.length ? { sponsorGalleryImages: images.galleryImages } : {}),
      ...(override?.tags?.length ? { sponsorTags: override.tags } : {}),
      ...(override?.additionalTagCount
        ? { sponsorAdditionalTagCount: override.additionalTagCount }
        : {}),
      sponsorTracked: !!override,
      sponsored: sponsoredUsernames.has(c.username.toLowerCase()) || undefined,
    };
  });
}

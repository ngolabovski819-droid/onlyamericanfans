import type { Creator } from '@/types/creator';
import { fetchCreators, fetchCreatorsByUsernames, type SearchParams, type SearchResult } from './supabase';
import { getScopeRule, type ScopeId } from '@/config/sponsor-placements';
import { getSponsorOverride } from '@/config/sponsor-overrides';

export interface ScopedFetchParams extends Omit<SearchParams, 'excludeUsernames' | 'offsetOverride' | 'fallbackToPopularIfEmpty'> {
  scope: ScopeId;
  /**
   * Keep the historical resilience fallback by default. Indexable location pages disable it so
   * an empty or timed-out local query can never be mislabeled as local inventory.
   */
  fallbackToPopularIfEmpty?: boolean;
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
  const { scope, fallbackToPopularIfEmpty = true, ...rest } = params;
  const rule = getScopeRule(scope);
  const page = rest.page ?? 1;
  const pageSize = rest.pageSize ?? 20;

  const pageStart = (page - 1) * pageSize + 1;
  const pageEnd = page * pageSize;
  const pinnedInRange = rule.pinned.filter((p) => p.position >= pageStart && p.position <= pageEnd);

  // Fast path: nothing pinned or excluded anywhere in this scope — skip all the bookkeeping.
  if (rule.pinned.length === 0 && rule.excluded.length === 0) {
    const result = await fetchCreators({ ...rest, page, pageSize, fallbackToPopularIfEmpty });
    return { ...result, creators: applyOverrides(result.creators, EMPTY_SET) };
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
          fallbackToPopularIfEmpty,
        })
      : Promise.resolve<SearchResult>({ creators: [], total: 0, hasMore: false, nextCursor: rest.cursor ?? null }),
    pinnedInRange.length > 0
      ? fetchCreatorsByUsernames(pinnedInRange.map((p) => p.username))
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
    sponsoredUsernames
  );

  // Total visible records = organic total (already net of exclusions) + pinned count, but never
  // less than the furthest-out pinned position — otherwise a pin placed past the natural end of
  // the list would be unreachable/wouldn't paginate to.
  const highestPinPosition = rule.pinned.reduce((max, p) => Math.max(max, p.position), 0);
  const total = Math.max(organicResult.total + rule.pinned.length, highestPinPosition);
  // Deliberately NOT `pageEnd < total`: `total` is an estimate that gets capped to 96 whenever
  // fetchCreators' resilience fallback fires (see fallbackToPopularIfEmpty in supabase.ts) — a
  // filtered query timing out deep in pagination looks identical to it genuinely running out of
  // rows, and comparing against that capped number would freeze `hasMore` at false forever even
  // though organicResult.hasMore (the fetch's own real "did we get a full page" signal) says
  // there's more. The only thing `total` should still gate is a pin placed further out than any
  // organic match — hence the highestPinPosition fallback.
  const hasMore = organicResult.hasMore || pageEnd < highestPinPosition;

  return { creators: finalCreators, total, hasMore, nextCursor: organicResult.nextCursor ?? null };
}

const EMPTY_SET = new Set<string>();

function applyOverrides(creators: Creator[], sponsoredUsernames: Set<string>): Creator[] {
  return creators.map((c) => {
    const override = getSponsorOverride(c.username);
    return {
      ...c,
      ...(override?.linkOverride ? { linkOverride: override.linkOverride } : {}),
      ...(override?.imageOverride ? { imageOverride: override.imageOverride } : {}),
      ...(override?.galleryImages?.length ? { sponsorGalleryImages: override.galleryImages } : {}),
      ...(override?.tags?.length ? { sponsorTags: override.tags } : {}),
      ...(override?.additionalTagCount
        ? { sponsorAdditionalTagCount: override.additionalTagCount }
        : {}),
      sponsorTracked: !!override,
      sponsored: sponsoredUsernames.has(c.username.toLowerCase()) || undefined,
    };
  });
}

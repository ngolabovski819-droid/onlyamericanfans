import type { Creator } from '@/types/creator';

export interface SearchParams {
  q?: string;
  verified?: boolean;
  price?: 'free' | 'under5' | 'under10' | 'any';
  sort?: 'popular' | 'newest';
  page?: number;
  pageSize?: number;
  /** State/city specific terms — replaces the broad AU filter */
  locationTerms?: string[];
  /** Category terms searched across username, name, about */
  categoryTerms?: string[];
  /** Per-filter-group terms: { groupId: selectedTerms[] }. Each group is ANDed; within a group terms are ORed. */
  filterGroups?: Record<string, string[]>;
  /** Skip the AU location filter entirely (e.g. category pages that search globally) */
  skipLocationFilter?: boolean;
  /** Revalidate tag for Next.js fetch caching */
  revalidate?: number;
  /** Usernames to exclude at the DB level (case-sensitive exact match) — used by fetchScopedCreators
   *  to keep pinned/excluded sponsor placements out of the organic result set so pagination offsets
   *  stay aligned and nothing shows twice. */
  excludeUsernames?: string[];
  /** Explicit offset into the result set, overriding the page/pageSize-derived offset. Used by
   *  fetchScopedCreators to fetch organic rows around exact pinned positions. */
  offsetOverride?: number;
  /** If the filtered query (location/category/filter-group terms) comes back with zero rows,
   *  retry once with all of those filters stripped (a general "popular" list) so the page never
   *  renders empty just because a search term matched nothing or a filtered query timed out and
   *  was swallowed. The fallback result's `total` is capped so an unfiltered site-wide count never
   *  displays under a specific category/location heading. */
  fallbackToPopularIfEmpty?: boolean;
}

/** Cap applied to `total` when fetchCreators falls back to an unfiltered "popular" list — keeps
 *  "N results found" from showing an absurd unfiltered site-wide total under a specific
 *  category/location heading. */
const FALLBACK_TOTAL_CAP = 96;

export interface SearchResult {
  creators: Creator[];
  total: number;
  hasMore: boolean;
}

const CARD_COLS = [
  'id', 'username', 'name', 'about', 'location', 'avatar', 'avatar_c144',
  'isverified', 'subscribeprice', 'photoscount', 'videoscount', 'postscount',
  'subscriberscount', 'favoritedcount',
  'bundle1_price', 'bundle1_duration', 'bundle1_discount',
  'bundle2_price', 'bundle2_duration', 'bundle2_discount',
  'bundle3_price', 'bundle3_duration', 'bundle3_discount',
  'promotion1_price', 'promotion1_discount',
].join(',');

function mapCreator(raw: Record<string, unknown>): Creator {
  return {
    id: raw.id as number,
    username: raw.username as string,
    name: (raw.name as string) ?? null,
    about: (raw.about as string) ?? null,
    location: (raw.location as string) ?? null,
    avatar: (raw.avatar as string) ?? null,
    avatarC144: (raw.avatar_c144 as string) ?? null,
    isVerified: Boolean(raw.isverified),
    subscribePrice: raw.subscribeprice != null ? Number(raw.subscribeprice) : null,
    favoritedCount: Number(raw.favoritedcount ?? 0),
    subscribersCount: raw.subscriberscount != null ? Number(raw.subscriberscount) : null,
    postsCount: raw.postscount != null ? Number(raw.postscount) : null,
    photosCount: raw.photoscount != null ? Number(raw.photoscount) : null,
    videosCount: raw.videoscount != null ? Number(raw.videoscount) : null,
    bundle1Price: raw.bundle1_price != null ? Number(raw.bundle1_price) : null,
    bundle1Duration: raw.bundle1_duration != null ? Number(raw.bundle1_duration) : null,
    bundle1Discount: raw.bundle1_discount != null ? Number(raw.bundle1_discount) : null,
    bundle2Price: raw.bundle2_price != null ? Number(raw.bundle2_price) : null,
    bundle2Duration: raw.bundle2_duration != null ? Number(raw.bundle2_duration) : null,
    bundle2Discount: raw.bundle2_discount != null ? Number(raw.bundle2_discount) : null,
    bundle3Price: raw.bundle3_price != null ? Number(raw.bundle3_price) : null,
    bundle3Duration: raw.bundle3_duration != null ? Number(raw.bundle3_duration) : null,
    bundle3Discount: raw.bundle3_discount != null ? Number(raw.bundle3_discount) : null,
    promotion1Price: raw.promotion1_price != null ? Number(raw.promotion1_price) : null,
    promotion1Discount: raw.promotion1_discount != null ? Number(raw.promotion1_discount) : null,
  };
}

/**
 * Fetches creators plus a resilience fallback: when `fallbackToPopularIfEmpty` is set and the
 * filtered query comes back with zero rows (a genuine zero-match term, or a filtered query that
 * timed out and got swallowed as empty — indistinguishable from here, and the product answer is
 * the same either way per the spec: never render an empty scope), retry once with all filter
 * terms stripped so the page shows a reasonable amount of content instead of nothing.
 */
export async function fetchCreators(params: SearchParams): Promise<SearchResult> {
  const result = await fetchCreatorsInner(params);

  // Deliberately excludes `q` — a free-text search that genuinely matches nothing should show
  // "no results," not paper over it with unrelated popular creators. This fallback is for
  // curated, config-driven term lists (category/location/filter-group) that can time out or
  // legitimately return zero under a narrow combination, where showing *something* is the
  // better product answer per the spec.
  const hadFilters =
    !!params.fallbackToPopularIfEmpty &&
    (!!(params.locationTerms && params.locationTerms.length) ||
      !!(params.categoryTerms && params.categoryTerms.length) ||
      !!(params.filterGroups && Object.keys(params.filterGroups).length));

  if (hadFilters && result.creators.length === 0) {
    const fallback = await fetchCreatorsInner({
      sort: params.sort,
      page: params.page,
      pageSize: params.pageSize,
      offsetOverride: params.offsetOverride,
      excludeUsernames: params.excludeUsernames,
      revalidate: 60,
    });
    return { ...fallback, total: Math.min(fallback.total, FALLBACK_TOTAL_CAP) };
  }

  return result;
}

/** Fetch a fixed, small set of creators by exact username — used by fetchScopedCreators to pull
 *  pinned placements regardless of whether they'd naturally rank. Order is NOT guaranteed to
 *  match `usernames`; callers must re-sort. */
export async function fetchCreatorsByUsernames(usernames: string[]): Promise<Creator[]> {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const supabaseKey = process.env.SUPABASE_KEY;
  const safe = usernames.map(sanitizeUsername).filter(Boolean);
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || safe.length === 0) {
    return [];
  }

  const qp = new URLSearchParams();
  qp.set('select', CARD_COLS);
  qp.set('username', `in.(${safe.join(',')})`);

  let res: Response;
  try {
    res = await fetch(`${supabaseUrl}/rest/v1/onlyfans_profiles?${qp.toString()}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Accept-Profile': 'public',
      },
      next: { revalidate: 300 },
    });
  } catch {
    return [];
  }
  if (!res.ok) return [];
  const data: Record<string, unknown>[] = await res.json();
  return data.map(mapCreator);
}

/** Usernames only ever come from our own config or the DB itself, but sanitize defensively
 *  before splicing into a raw (non-percent-encoded) PostgREST filter expression. */
function sanitizeUsername(u: string): string {
  return u.replace(/[^A-Za-z0-9_.-]/g, '');
}

async function fetchCreatorsInner(params: SearchParams): Promise<SearchResult> {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    return { creators: [], total: 0, hasMore: false };
  }

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const offset = params.offsetOverride ?? (page - 1) * pageSize;

  // Use a plain params object — we'll build the final URL manually so PostgREST
  // filter expressions (or/and) are NOT percent-encoded (PostgREST requires raw parens/commas)
  const qp = new URLSearchParams();
  qp.set('select', CARD_COLS);
  qp.set('isperformer', 'eq.true');

  // Build AND clauses — each is a parenthesized OR expression
  const andClauses: string[] = [];

  // 1. Location scope — filters on the `location` column only.
  //    Using location (not search_text) gives smaller, accurate result sets:
  //    search_text includes the about/bio field where popular city names appear
  //    as false positives (e.g. "I love Miami"), inflating result sets to 10k+
  //    rows that time out on the ORDER BY for states like FL, NY, IL, PA.
  //    Migration 002_location_gin_index.sql adds a GIN trigram index on location
  //    for fast cold-cache OR-chains. Until that index is applied, a fallback to
  //    the first (state-name) term is triggered on HTTP 500 (statement timeout).
  // NOTE: buildAuOrExpression() fallback removed — 37-term OR took ~8-9s.
  if (params.locationTerms && params.locationTerms.length > 0) {
    const parts = params.locationTerms.map((t) => `location.ilike.*${t.toLowerCase()}*`);
    andClauses.push(`(${parts.join(',')})`);
  }

  // 2. Text query — across username, name, about only
  if (params.q && params.q.trim()) {
    const terms = params.q.split(/[|,]/).map((t) => t.trim()).filter(Boolean);
    const cols = ['username', 'name', 'about'];
    const exprs = terms.flatMap((t) => cols.map((c) => `${c}.ilike.*${t}*`));
    andClauses.push(`(${exprs.join(',')})`);
  }

  // 3. Category terms — across username, name, about
  if (params.categoryTerms && params.categoryTerms.length > 0) {
    const cols = ['username', 'name', 'about'];
    const exprs = params.categoryTerms.flatMap((t) => cols.map((c) => `${c}.ilike.*${t}*`));
    andClauses.push(`(${exprs.join(',')})`);
  }

  // 4. Filter groups
  if (params.filterGroups) {
    for (const terms of Object.values(params.filterGroups)) {
      if (terms.length > 0) {
        const exprs = terms.map((t) => `about.ilike.*${t}*`);
        andClauses.push(`(${exprs.join(',')})`);
      }
    }
  }

  // Build raw filter string — must NOT be percent-encoded
  let rawFilter = '';
  if (andClauses.length === 1) {
    rawFilter = `&or=${andClauses[0]}`;
  } else if (andClauses.length > 1) {
    const parts = andClauses.map((c) => `or${c}`);
    rawFilter = `&and=(${parts.join(',')})`;
  }

  // 5. Sponsor-placement exclusion — pinned/excluded usernames dropped at the DB level (not
  //    filtered client-side after the fact) so LIMIT/OFFSET pagination never double-counts or
  //    skips a row because a pinned/excluded creator was sitting in the organic result set.
  //    This is a top-level AND'd condition, independent of the or=/and= group above.
  if (params.excludeUsernames && params.excludeUsernames.length > 0) {
    const safe = params.excludeUsernames.map(sanitizeUsername).filter(Boolean);
    if (safe.length > 0) {
      rawFilter += `&username=not.in.(${safe.join(',')})`;
    }
  }

  // Verified filter
  if (params.verified) {
    qp.set('isverified', 'eq.true');
  }

  // Price filter
  if (params.price === 'free') {
    qp.set('subscribeprice', 'eq.0');
  } else if (params.price === 'under5') {
    qp.set('subscribeprice', 'lte.5');
  } else if (params.price === 'under10') {
    qp.set('subscribeprice', 'lte.10');
  }

  // Sort
  if (params.sort === 'newest') {
    qp.set('order', 'first_seen_at.desc.nullslast,favoritedcount.desc');
  } else {
    qp.set('order', 'favoritedcount.desc,subscribeprice.asc.nullslast');
  }

  qp.set('limit', String(pageSize));
  qp.set('offset', String(offset));

  // Final URL: standard params (safely encoded) + raw filter appended manually
  const finalUrl = `${supabaseUrl}/rest/v1/onlyfans_profiles?${qp.toString()}${rawFilter}`;

  // Fallback URL: if the full OR-chain hits a statement timeout (HTTP 500 on cold
  // Supabase cache before migration 002 index is applied), retry with just the
  // first term (state name) so the page renders something instead of being blank.
  // Only active when locationTerms is the sole filter (state landing pages).
  const excludeSuffix = (() => {
    if (!params.excludeUsernames || params.excludeUsernames.length === 0) return '';
    const safe = params.excludeUsernames.map(sanitizeUsername).filter(Boolean);
    return safe.length > 0 ? `&username=not.in.(${safe.join(',')})` : '';
  })();
  const fallbackUrl =
    andClauses.length === 1 && params.locationTerms && params.locationTerms.length > 1
      ? `${supabaseUrl}/rest/v1/onlyfans_profiles?${qp.toString()}&or=(location.ilike.*${params.locationTerms[0].toLowerCase()}*)${excludeSuffix}`
      : null;

  let res: Response;
  try {
    res = await fetch(finalUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Accept-Profile': 'public',
        // count=estimated uses PostgreSQL query-planner stats (~instant).
        // count=exact forces a full COUNT(*) scan (4+ seconds on 70k rows).
        Prefer: 'count=estimated',
      },
      next: { revalidate: params.revalidate ?? 300 },
    });
  } catch {
    return { creators: [], total: 0, hasMore: false };
  }

  // On statement timeout, retry with just the state-name term.
  if (!res.ok && res.status === 500 && fallbackUrl) {
    try {
      res = await fetch(fallbackUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Accept-Profile': 'public',
          Prefer: 'count=estimated',
        },
        next: { revalidate: 60 }, // shorter cache so next visitor gets full results
      });
    } catch {
      return { creators: [], total: 0, hasMore: false };
    }
  }

  if (!res.ok) {
    return { creators: [], total: 0, hasMore: false };
  }

  const contentRange = res.headers.get('content-range') ?? '';
  const total = parseInt(contentRange.split('/')[1] ?? '0', 10) || 0;
  const data: Record<string, unknown>[] = await res.json();
  const creators = data.map(mapCreator);

  return { creators, total, hasMore: offset + creators.length < total };
}

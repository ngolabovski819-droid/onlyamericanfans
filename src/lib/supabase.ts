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
  'id', 'username', 'name', 'about', 'location', 'avatar', 'avatar_c144', 'header',
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
    header: (raw.header as string) ?? null,
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

/** Ranking candidate pool cap for search_creators_capped() (migration 013) — see that migration
 *  and fetchCreatorsCappedInner()'s comment for why this exists and what it trades off. */
const SEARCH_CANDIDATE_LIMIT = 1000;

/**
 * Fetches creators plus a resilience fallback: when `fallbackToPopularIfEmpty` is set and the
 * filtered query comes back with zero rows (a genuine zero-match term, or a filtered query that
 * timed out and got swallowed as empty — indistinguishable from here, and the product answer is
 * the same either way per the spec: never render an empty scope), retry once with all filter
 * terms stripped so the page shows a reasonable amount of content instead of nothing.
 */
export async function fetchCreators(params: SearchParams): Promise<SearchResult> {
  // Free-text (q), category, and filter-group searches can match an unbounded number of rows
  // (a broad term can hit tens of thousands out of ~2M) — ranking every match by popularity is
  // what made these slow even with migration 012's indexes in place. Location-only/unfiltered
  // browsing never has this problem (bounded by the location index, or not filtered at all), so
  // it keeps using the plain query below unchanged.
  const usesCappedSearch = !!(
    (params.q && params.q.trim()) ||
    (params.categoryTerms && params.categoryTerms.length) ||
    (params.filterGroups && Object.keys(params.filterGroups).length)
  );
  const result = await (usesCappedSearch ? fetchCreatorsCappedInner(params) : fetchCreatorsInner(params));

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

interface ScopeClauseParams {
  locationTerms?: string[];
  q?: string;
  categoryTerms?: string[];
  filterGroups?: Record<string, string[]>;
}

/** Builds the same location/text/category/filter-group AND-of-ORs clauses used by both the main
 *  card search and the stat-leaders query below, so the two stay in sync by construction. */
function buildScopeAndClauses(params: ScopeClauseParams): string[] {
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

  return andClauses;
}

/** Combines buildScopeAndClauses() output into the raw (non-percent-encoded) PostgREST
 *  or=/and= query fragment. */
function andClausesToRawFilter(andClauses: string[]): string {
  if (andClauses.length === 1) return `&or=${andClauses[0]}`;
  if (andClauses.length > 1) return `&and=(${andClauses.map((c) => `or${c}`).join(',')})`;
  return '';
}

/** Reduced candidate pool for the retry attempt in fetchCreatorsCappedInner — smaller pool means
 *  less work, giving a retry a real chance of completing even if the first attempt was caught in
 *  a moment of contention on the shared database rather than a structurally slow query. */
const SEARCH_CANDIDATE_LIMIT_RETRY = 300;

async function callSearchCreatorsCapped(
  supabaseUrl: string,
  supabaseKey: string,
  params: SearchParams,
  candidateLimit: number,
  offset: number,
  pageSize: number,
): Promise<Response> {
  const textTerms =
    params.q && params.q.trim()
      ? params.q.split(/[|,]/).map((t) => t.trim()).filter(Boolean)
      : null;
  const categoryTerms = params.categoryTerms && params.categoryTerms.length ? params.categoryTerms : null;
  const locationTerms = params.locationTerms && params.locationTerms.length ? params.locationTerms : null;
  const filterGroups =
    params.filterGroups && Object.keys(params.filterGroups).length ? params.filterGroups : null;
  const excludeUsernames =
    params.excludeUsernames && params.excludeUsernames.length
      ? params.excludeUsernames.map(sanitizeUsername).filter(Boolean)
      : null;

  return fetch(`${supabaseUrl}/rest/v1/rpc/search_creators_capped`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Accept-Profile': 'public',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_text_terms: textTerms,
      p_category_terms: categoryTerms,
      p_location_terms: locationTerms,
      p_filter_groups: filterGroups,
      p_verified: params.verified ?? null,
      p_price_filter: params.price ?? null,
      p_sort: params.sort === 'newest' ? 'newest' : 'popular',
      p_exclude_usernames: excludeUsernames,
      p_candidate_limit: candidateLimit,
      p_page_size: pageSize,
      p_offset: offset,
    }),
  });
}

/**
 * Routes through the search_creators_capped() Postgres function (migration 013) instead of a
 * plain filtered table query — same {creators, total, hasMore} contract as fetchCreatorsInner,
 * so fetchCreators() can swap between the two transparently. Ranks within a candidate pool capped
 * at SEARCH_CANDIDATE_LIMIT rather than every matching row, so a broad/generic term (thousands of
 * matches) costs about the same as a narrow one (a handful of matches) instead of scaling with how
 * common the term is.
 *
 * hasMore intentionally goes false once the capped pool is exhausted (offset + pageSize reaches
 * whichever candidate limit was actually used), even if more matches technically exist beyond
 * that boundary — see the migration's comment for why that's an accepted, deliberate trade-off
 * (nothing past the cap is reachable via Load More) rather than a bug. total is likewise an
 * approximation, not an exact count: capped while more pages remain, exact once hasMore is false.
 *
 * Resilience: confirmed via EXPLAIN ANALYZE against production that this query is genuinely fast
 * (~400ms) and correctly index-accelerated under normal conditions — but on a database shared
 * across multiple projects, a rare request can still land during a moment of real contention and
 * hit Postgres's own statement_timeout. Previously that surfaced to the visitor as a false "no
 * results found" (a timeout was being treated identically to a genuine zero-match search, which
 * it isn't). Now it retries once with a smaller candidate pool (less work, better odds of
 * finishing even mid-contention), and only if that also fails does it fall back to an unfiltered
 * popular list — same total-capping convention as fetchCreators()'s existing empty-result
 * fallback — so a rare infrastructure blip degrades to "here's something" instead of "nothing
 * matched your search," which would be actively misleading.
 *
 * Uses POST (not GET) for the RPC call despite this function being STABLE (which would allow
 * GET) — reliable JSON encoding of array/jsonb parameters matters more here than Next.js's
 * fetch-level Data Cache, which only applies to GET requests anyway; the outer /api/search
 * route's own Cache-Control still covers repeat-request caching regardless.
 */
async function fetchCreatorsCappedInner(params: SearchParams): Promise<SearchResult> {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    return { creators: [], total: 0, hasMore: false };
  }

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const offset = params.offsetOverride ?? (page - 1) * pageSize;

  for (const candidateLimit of [SEARCH_CANDIDATE_LIMIT, SEARCH_CANDIDATE_LIMIT_RETRY]) {
    let res: Response;
    try {
      res = await callSearchCreatorsCapped(supabaseUrl, supabaseKey, params, candidateLimit, offset, pageSize);
    } catch {
      continue; // network-level failure — try the smaller candidate pool before giving up
    }

    if (!res.ok) continue; // e.g. statement timeout under contention — same, try smaller pool

    const data: Record<string, unknown>[] = await res.json();
    const creators = data.map(mapCreator);
    const hasMore = creators.length === pageSize && offset + pageSize < candidateLimit;
    const total = hasMore ? candidateLimit : offset + creators.length;
    return { creators, total, hasMore };
  }

  // Both attempts failed (timeout/error, not a genuine zero-match search) — fall back to a plain
  // popular list rather than showing a false "no results found" for what was actually an
  // infrastructure hiccup.
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
  // No isperformer filter here — the lean table only ever contains isperformer=true rows by
  // construction (see scripts/sync-lean-creators.mjs), and doesn't have the column at all.

  const andClauses = buildScopeAndClauses(params);
  let rawFilter = andClausesToRawFilter(andClauses);

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

/** The onlyfans_profiles numeric columns the programmatic "About" SEO section (see
 *  CreatorStatsSection) ranks creators by. */
export type StatMetric =
  | 'favoritedcount'
  | 'subscriberscount'
  | 'finishedstreamscount'
  | 'photoscount'
  | 'postscount'
  | 'videoscount'
  | 'audioscount'
  | 'archivedpostscount';

export interface StatLeader {
  username: string;
  name: string | null;
  value: number;
}

export interface StatLeaderParams {
  locationTerms?: string[];
  categoryTerms?: string[];
  filterGroups?: Record<string, string[]>;
  /** Matches SearchParams.price — needed for price-only categories (e.g. 'free') where terms
   *  alone wouldn't scope the leaderboard to the right creators. */
  price?: 'free' | 'under5' | 'under10' | 'any';
}

/** Stat leaderboards change slowly (a creator's post/photo/video count doesn't meaningfully
 *  shift hour to hour) and this SEO copy doesn't need to be fresher than that, so it's cached far
 *  longer than the creator grid itself — cuts background Supabase query volume across all
 *  state/city/category pages without any visible staleness. */
const STAT_LEADER_REVALIDATE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Top N creators for a single numeric column, scoped by the same location/category/filter-group
 * terms a page's CreatorGrid uses — powers the programmatic "About" SEO copy. This is a plain
 * organic ranking: independent of src/config/sponsor-placements.ts pins, since the point is to
 * report who actually holds the top spot for that stat, not who paid for a slot.
 */
export async function fetchCreatorStatLeaders(
  metric: StatMetric,
  params: StatLeaderParams,
  limit = 5,
): Promise<StatLeader[]> {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) return [];

  const andClauses = buildScopeAndClauses(params);
  const rawFilter = andClausesToRawFilter(andClauses);

  const qp = new URLSearchParams();
  qp.set('select', `username,name,${metric}`);
  // No isperformer filter — see the comment in fetchCreatorsInner.
  qp.set(metric, 'gt.0');
  // Subscriber count is a creator-controlled visibility setting on OnlyFans — some creators hide
  // it from public view entirely. Even though we may have a scraped value on file, it would be
  // wrong to surface it here as if it were public; this ranks only creators who've chosen to show it.
  if (metric === 'subscriberscount') {
    qp.set('showsubscriberscount', 'eq.true');
  }
  if (params.price === 'free') {
    qp.set('subscribeprice', 'eq.0');
  } else if (params.price === 'under5') {
    qp.set('subscribeprice', 'lte.5');
  } else if (params.price === 'under10') {
    qp.set('subscribeprice', 'lte.10');
  }
  qp.set('order', `${metric}.desc.nullslast`);
  qp.set('limit', String(limit));

  let res: Response;
  try {
    res = await fetch(`${supabaseUrl}/rest/v1/onlyfans_profiles?${qp.toString()}${rawFilter}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Accept-Profile': 'public',
      },
      next: { revalidate: STAT_LEADER_REVALIDATE_SECONDS },
    });
  } catch {
    return [];
  }
  if (!res.ok) return [];

  const data: Record<string, unknown>[] = await res.json();
  return data.map((row) => ({
    username: row.username as string,
    name: (row.name as string) ?? null,
    value: Number(row[metric] ?? 0),
  }));
}

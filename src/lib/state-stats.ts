import type {
  LocationStats,
  LocationStatsMethodology,
  LocationStatsScopeType,
  StateStatsBundle,
} from '@/types/location-stats';

export const LOCATION_STATS_FRESHNESS_WINDOW_DAYS = 30;

/**
 * Public, versioned definitions used by the UI and the snapshot migration.
 * Keep these statements aligned with migration 005 when the methodology is
 * intentionally revised; change the version whenever the SQL changes.
 */
export const LOCATION_STATS_METHODOLOGY: LocationStatsMethodology = Object.freeze({
  version: 'location-stats-v1',
  activeInventory:
    "Profiles whose current directory row has isperformer=true and status='active', with a nonblank location matching the scope.",
  locationMatch:
    'A case-insensitive match between the profile location text and at least one curated term configured for the state, city, or region. This is a directory match, not proof of residence.',
  nationalInventory:
    'Distinct active profiles matching at least one configured US state term; global database rows are not counted.',
  verified: 'Active inventory whose current directory row has isverified=true.',
  effectivePrice:
    'The current advertised subscription price is currentsubscribeprice when present, otherwise subscribeprice. Null or negative values are unknown.',
  freeAccounts:
    'Active, price-known inventory whose effective advertised subscription price is exactly $0.',
  medianPaidPrice:
    'The median effective advertised price among active profiles priced above $0. Free and unknown prices are excluded; the 25th and 75th percentiles use the same sample.',
  snapshotCutoff:
    'The cutoff is captured once when a refresh starts. Every time window uses that cutoff, and the snapshot becomes visible only after every scope finishes successfully.',
  checkedRecently:
    'A profile is checked recently when last_checked_at falls within the stated window; successful checks additionally require an HTTP status from 200 through 299.',
  refreshedRecently:
    'A profile is refreshed recently when last_refreshed_at falls within the stated window.',
  recentlySeen:
    'A profile is recently seen when coalesce(last_seen_at, lastseen) falls within the stated window.',
  contentCounters:
    'Reported content totals sum nonnegative current source counters across matched active profiles. Coverage is the number of profiles with at least one known content counter; these counters can overlap and are not files hosted by this directory.',
  thirtyDayChange:
    'Active inventory minus the latest fully published snapshot whose cutoff is at least 30 days older. It remains unavailable until that comparison exists.',
});

const CURRENT_STATS_COLUMNS = [
  'snapshot_id',
  'cutoff_at',
  'completed_at',
  'content_changed_at',
  'methodology_version',
  'freshness_window_days',
  'source_profile_count',
  'scope_type',
  'scope_slug',
  'label',
  'url_slug',
  'parent_state_slug',
  'abbreviation',
  'sort_order',
  'active_count',
  'verified_count',
  'free_count',
  'paid_count',
  'price_known_count',
  'median_paid_price',
  'paid_price_p25',
  'paid_price_p75',
  'new_7d_count',
  'new_30d_count',
  'refreshed_7d_count',
  'refreshed_30d_count',
  'checked_30d_count',
  'successful_checked_30d_count',
  'recently_seen_30d_count',
  'content_known_count',
  'total_posts',
  'total_photos',
  'total_videos',
  'total_media',
  'source_latest_refresh_at',
  'previous_cutoff_at',
  'change_30d_count',
  'change_30d_percent',
].join(',');

type RawLocationStats = Record<string, unknown>;

function finiteNumber(value: unknown, fallback = 0): number {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function ratio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

function isScopeType(value: unknown): value is LocationStatsScopeType {
  return value === 'national' || value === 'region' || value === 'state' || value === 'city';
}

function mapLocationStats(raw: RawLocationStats): LocationStats | null {
  if (
    !isScopeType(raw.scope_type) ||
    typeof raw.scope_slug !== 'string' ||
    typeof raw.label !== 'string' ||
    typeof raw.cutoff_at !== 'string' ||
    typeof raw.completed_at !== 'string' ||
    typeof raw.content_changed_at !== 'string'
  ) {
    return null;
  }

  const activeCount = finiteNumber(raw.active_count);
  const verifiedCount = finiteNumber(raw.verified_count);
  const freeCount = finiteNumber(raw.free_count);
  const priceKnownCount = finiteNumber(raw.price_known_count);
  const checked30dCount = finiteNumber(raw.checked_30d_count);
  const successfulChecked30dCount = finiteNumber(raw.successful_checked_30d_count);
  const recentlySeen30dCount = finiteNumber(raw.recently_seen_30d_count);
  const contentKnownCount = finiteNumber(raw.content_known_count);

  return {
    snapshotId: finiteNumber(raw.snapshot_id),
    cutoffAt: raw.cutoff_at,
    completedAt: raw.completed_at,
    contentChangedAt: raw.content_changed_at,
    methodologyVersion:
      typeof raw.methodology_version === 'string'
        ? raw.methodology_version
        : LOCATION_STATS_METHODOLOGY.version,
    freshnessWindowDays: finiteNumber(
      raw.freshness_window_days,
      LOCATION_STATS_FRESHNESS_WINDOW_DAYS,
    ),
    sourceProfileCount: nullableNumber(raw.source_profile_count),

    scopeType: raw.scope_type,
    scopeSlug: raw.scope_slug,
    label: raw.label,
    urlSlug: nullableString(raw.url_slug),
    parentStateSlug: nullableString(raw.parent_state_slug),
    abbreviation: nullableString(raw.abbreviation),
    sortOrder: finiteNumber(raw.sort_order),

    activeCount,
    verifiedCount,
    verifiedShare: ratio(verifiedCount, activeCount),
    freeCount,
    freeShare: ratio(freeCount, priceKnownCount),
    paidCount: finiteNumber(raw.paid_count),
    priceKnownCount,
    priceKnownShare: ratio(priceKnownCount, activeCount),
    medianPaidPrice: nullableNumber(raw.median_paid_price),
    paidPriceP25: nullableNumber(raw.paid_price_p25),
    paidPriceP75: nullableNumber(raw.paid_price_p75),

    new7dCount: finiteNumber(raw.new_7d_count),
    new30dCount: finiteNumber(raw.new_30d_count),
    refreshed7dCount: finiteNumber(raw.refreshed_7d_count),
    refreshed30dCount: finiteNumber(raw.refreshed_30d_count),
    checked30dCount,
    checked30dShare: ratio(checked30dCount, activeCount),
    successfulChecked30dCount,
    successfulChecked30dShare: ratio(successfulChecked30dCount, activeCount),
    recentlySeen30dCount,
    recentlySeen30dShare: ratio(recentlySeen30dCount, activeCount),
    contentKnownCount,
    contentKnownShare: ratio(contentKnownCount, activeCount),

    totalPosts: finiteNumber(raw.total_posts),
    totalPhotos: finiteNumber(raw.total_photos),
    totalVideos: finiteNumber(raw.total_videos),
    totalMedia: finiteNumber(raw.total_media),
    sourceLatestRefreshAt: nullableString(raw.source_latest_refresh_at),

    previousCutoffAt: nullableString(raw.previous_cutoff_at),
    change30dCount: nullableNumber(raw.change_30d_count),
    change30dPercent: nullableNumber(raw.change_30d_percent),
  };
}

function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.SUPABASE_KEY;

  if (!url || !key || url.includes('your-project')) return null;
  return { url, key };
}

async function fetchCurrentStats(query: URLSearchParams): Promise<LocationStats[]> {
  const config = getSupabaseConfig();
  if (!config) return [];

  query.set('select', CURRENT_STATS_COLUMNS);

  let response: Response;
  try {
    response = await fetch(
      `${config.url}/rest/v1/directory_location_stats_current?${query.toString()}`,
      {
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          'Accept-Profile': 'public',
        },
        next: {
          revalidate: 3600,
          tags: ['directory-location-stats'],
        },
      },
    );
  } catch {
    return [];
  }

  // A missing migration, a transient database error, or an absent published
  // snapshot is data unavailability. Never replace it with live estimates or
  // unrelated creator results, because that would make the page's methodology
  // and timestamp untrue.
  if (!response.ok) return [];

  let rows: RawLocationStats[];
  try {
    rows = (await response.json()) as RawLocationStats[];
  } catch {
    return [];
  }

  return rows.map(mapLocationStats).filter((row): row is LocationStats => row !== null);
}

function safeSlug(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized) ? normalized : null;
}

export async function getLocationStats(
  scopeType: LocationStatsScopeType,
  scopeSlug: string,
): Promise<LocationStats | null> {
  const slug = safeSlug(scopeSlug);
  if (!slug) return null;

  const query = new URLSearchParams({
    scope_type: `eq.${scopeType}`,
    scope_slug: `eq.${slug}`,
    limit: '1',
  });
  const [stats] = await fetchCurrentStats(query);
  return stats ?? null;
}

export async function getNationalLocationStats(): Promise<LocationStats | null> {
  return getLocationStats('national', 'united-states');
}

export async function getAllStateLocationStats(): Promise<LocationStats[]> {
  return fetchCurrentStats(
    new URLSearchParams({
      scope_type: 'eq.state',
      order: 'sort_order.asc,label.asc',
    }),
  );
}

export async function getAllRegionLocationStats(): Promise<LocationStats[]> {
  return fetchCurrentStats(
    new URLSearchParams({
      scope_type: 'eq.region',
      order: 'sort_order.asc,label.asc',
    }),
  );
}

export async function getAllCityLocationStats(): Promise<LocationStats[]> {
  return fetchCurrentStats(
    new URLSearchParams({
      scope_type: 'eq.city',
      order: 'sort_order.asc,label.asc',
    }),
  );
}

export async function getCityStatsForState(stateSlug: string): Promise<LocationStats[]> {
  const slug = safeSlug(stateSlug);
  if (!slug) return [];

  return fetchCurrentStats(
    new URLSearchParams({
      scope_type: 'eq.city',
      parent_state_slug: `eq.${slug}`,
      order: 'active_count.desc,label.asc',
    }),
  );
}

export async function getStateStatsBundle(stateSlug: string): Promise<StateStatsBundle> {
  const [state, national, cities] = await Promise.all([
    getLocationStats('state', stateSlug),
    getNationalLocationStats(),
    getCityStatsForState(stateSlug),
  ]);

  return { state, national, cities };
}

/**
 * Backward-compatible sitemap helper: returns the last time displayed national
 * metrics changed, not the latest no-op refresh completion.
 */
export async function getLocationStatsCompletedAt(): Promise<string | null> {
  const national = await getNationalLocationStats();
  return national?.contentChangedAt ?? null;
}

/** National data last-modified time that advances only when a displayed metric changes. */
export async function getLocationStatsChangedAt(): Promise<string | null> {
  return getLocationStatsCompletedAt();
}

/** Actual completion time of the most recent successful refresh, including no-op refreshes. */
export async function getLocationStatsRefreshCompletedAt(): Promise<string | null> {
  const national = await getNationalLocationStats();
  return national?.completedAt ?? null;
}

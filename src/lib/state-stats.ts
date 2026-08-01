import type {
  LocationStats,
  LocationStatsHistoryPoint,
  LocationHighlight,
  LocationHighlightType,
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
  version: 'location-stats-v2',
  activeInventory:
    "Profiles whose current directory row has isperformer=true and status='active', with a successful source check during the 30-day freshness window and a nonblank location matching the scope.",
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
  'paid_under_5_count',
  'paid_5_to_10_count',
  'paid_10_to_20_count',
  'paid_20_plus_count',
  'promoted_count',
  'discounted_count',
  'new_7d_count',
  'new_30d_count',
  'refreshed_7d_count',
  'refreshed_30d_count',
  'checked_30d_count',
  'successful_checked_30d_count',
  'successful_checked_7d_count',
  'recently_seen_30d_count',
  'content_known_count',
  'complete_profile_count',
  'total_posts',
  'total_photos',
  'total_videos',
  'total_media',
  'median_posts',
  'median_photos',
  'median_videos',
  'source_latest_refresh_at',
  'inventory_rank',
  'inventory_percentile',
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

function isHighlightType(value: unknown): value is LocationHighlightType {
  return value === 'popular' || value === 'newly-discovered' || value === 'recently-confirmed';
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
  const completeProfileCount = finiteNumber(raw.complete_profile_count);

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
    paidUnder5Count: finiteNumber(raw.paid_under_5_count),
    paid5To10Count: finiteNumber(raw.paid_5_to_10_count),
    paid10To20Count: finiteNumber(raw.paid_10_to_20_count),
    paid20PlusCount: finiteNumber(raw.paid_20_plus_count),
    promotedCount: finiteNumber(raw.promoted_count),
    discountedCount: finiteNumber(raw.discounted_count),

    new7dCount: finiteNumber(raw.new_7d_count),
    new30dCount: finiteNumber(raw.new_30d_count),
    refreshed7dCount: finiteNumber(raw.refreshed_7d_count),
    refreshed30dCount: finiteNumber(raw.refreshed_30d_count),
    checked30dCount,
    checked30dShare: ratio(checked30dCount, activeCount),
    successfulChecked30dCount,
    successfulChecked30dShare: ratio(successfulChecked30dCount, activeCount),
    successfulChecked7dCount: finiteNumber(raw.successful_checked_7d_count),
    successfulChecked7dShare: ratio(finiteNumber(raw.successful_checked_7d_count), activeCount),
    recentlySeen30dCount,
    recentlySeen30dShare: ratio(recentlySeen30dCount, activeCount),
    contentKnownCount,
    contentKnownShare: ratio(contentKnownCount, activeCount),
    completeProfileCount,
    completeProfileShare: ratio(completeProfileCount, activeCount),

    totalPosts: finiteNumber(raw.total_posts),
    totalPhotos: finiteNumber(raw.total_photos),
    totalVideos: finiteNumber(raw.total_videos),
    totalMedia: finiteNumber(raw.total_media),
    medianPosts: nullableNumber(raw.median_posts),
    medianPhotos: nullableNumber(raw.median_photos),
    medianVideos: nullableNumber(raw.median_videos),
    sourceLatestRefreshAt: nullableString(raw.source_latest_refresh_at),
    inventoryRank: nullableNumber(raw.inventory_rank),
    inventoryPercentile: nullableNumber(raw.inventory_percentile),

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

export async function getLocationStatsHistory(
  scopeType: LocationStatsScopeType,
  scopeSlug: string,
  limit = 100,
): Promise<LocationStatsHistoryPoint[]> {
  const config = getSupabaseConfig();
  const slug = safeSlug(scopeSlug);
  if (!config || !slug) return [];

  const query = new URLSearchParams({
    select: [
      'snapshot_id',
      'cutoff_at',
      'completed_at',
      'content_changed_at',
      'active_count',
      'verified_count',
      'free_count',
      'price_known_count',
      'median_paid_price',
      'successful_checked_7d_count',
    ].join(','),
    scope_type: `eq.${scopeType}`,
    scope_slug: `eq.${slug}`,
    order: 'cutoff_at.desc',
    limit: String(Math.min(Math.max(Math.trunc(limit), 2), 100)),
  });

  let response: Response;
  try {
    response = await fetch(
      `${config.url}/rest/v1/directory_location_stats_history?${query.toString()}`,
      {
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          'Accept-Profile': 'public',
        },
        next: { revalidate: 3600, tags: ['directory-location-stats'] },
      },
    );
  } catch {
    return [];
  }
  if (!response.ok) return [];

  try {
    const rows = await response.json() as RawLocationStats[];
    return rows.flatMap((row) => {
      if (
        typeof row.cutoff_at !== 'string' ||
        typeof row.completed_at !== 'string' ||
        typeof row.content_changed_at !== 'string'
      ) return [];
      return [{
        snapshotId: finiteNumber(row.snapshot_id),
        cutoffAt: row.cutoff_at,
        completedAt: row.completed_at,
        contentChangedAt: row.content_changed_at,
        activeCount: finiteNumber(row.active_count),
        verifiedCount: finiteNumber(row.verified_count),
        freeCount: finiteNumber(row.free_count),
        priceKnownCount: finiteNumber(row.price_known_count),
        medianPaidPrice: nullableNumber(row.median_paid_price),
        successfulChecked7dCount: finiteNumber(row.successful_checked_7d_count),
      }];
    });
  } catch {
    return [];
  }
}

export async function getLocationHighlights(
  scopeType: LocationStatsScopeType,
  scopeSlug: string,
): Promise<LocationHighlight[]> {
  const config = getSupabaseConfig();
  const slug = safeSlug(scopeSlug);
  if (!config || !slug) return [];

  const query = new URLSearchParams({
    select: '*',
    scope_type: `eq.${scopeType}`,
    scope_slug: `eq.${slug}`,
    order: 'highlight_type.asc,rank.asc',
  });
  let response: Response;
  try {
    response = await fetch(
      `${config.url}/rest/v1/directory_location_highlights_current?${query.toString()}`,
      {
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          'Accept-Profile': 'public',
        },
        next: { revalidate: 3600, tags: ['directory-location-stats'] },
      },
    );
  } catch {
    return [];
  }
  if (!response.ok) return [];

  try {
    const rows = await response.json() as RawLocationStats[];
    return rows.flatMap((row) => {
      if (
        !isScopeType(row.scope_type) ||
        !isHighlightType(row.highlight_type) ||
        typeof row.scope_slug !== 'string' ||
        typeof row.username !== 'string' ||
        typeof row.cutoff_at !== 'string'
      ) return [];
      return [{
        snapshotId: finiteNumber(row.snapshot_id),
        cutoffAt: row.cutoff_at,
        scopeType: row.scope_type,
        scopeSlug: row.scope_slug,
        highlightType: row.highlight_type,
        rank: finiteNumber(row.rank),
        creatorId: finiteNumber(row.creator_id),
        username: row.username,
        displayName: nullableString(row.display_name),
        metricValue: nullableNumber(row.metric_value),
        metricAt: nullableString(row.metric_at),
      }];
    });
  } catch {
    return [];
  }
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

export type LocationStatsScopeType = 'national' | 'region' | 'state' | 'city';

/**
 * One scope's metrics from a single, fully published directory snapshot.
 *
 * Shares are ratios in the inclusive range 0..1, not percentages. Nullable
 * values mean the required denominator or historical comparison is not
 * available; callers must not turn those into zeroes.
 */
export interface LocationStats {
  snapshotId: number;
  cutoffAt: string;
  completedAt: string;
  /** Last snapshot completion at which a displayed metric for this scope changed. */
  contentChangedAt: string;
  methodologyVersion: string;
  freshnessWindowDays: number;
  sourceProfileCount: number | null;

  scopeType: LocationStatsScopeType;
  scopeSlug: string;
  label: string;
  urlSlug: string | null;
  parentStateSlug: string | null;
  abbreviation: string | null;
  sortOrder: number;

  activeCount: number;
  verifiedCount: number;
  verifiedShare: number | null;
  freeCount: number;
  freeShare: number | null;
  paidCount: number;
  priceKnownCount: number;
  priceKnownShare: number | null;
  medianPaidPrice: number | null;
  paidPriceP25: number | null;
  paidPriceP75: number | null;

  new7dCount: number;
  new30dCount: number;
  refreshed7dCount: number;
  refreshed30dCount: number;
  checked30dCount: number;
  checked30dShare: number | null;
  successfulChecked30dCount: number;
  successfulChecked30dShare: number | null;
  recentlySeen30dCount: number;
  recentlySeen30dShare: number | null;
  contentKnownCount: number;
  contentKnownShare: number | null;

  totalPosts: number;
  totalPhotos: number;
  totalVideos: number;
  totalMedia: number;
  sourceLatestRefreshAt: string | null;

  /** The comparison snapshot nearest to, but not newer than, 30 days ago. */
  previousCutoffAt: string | null;
  change30dCount: number | null;
  change30dPercent: number | null;
}

export interface StateStatsBundle {
  state: LocationStats | null;
  national: LocationStats | null;
  cities: LocationStats[];
}

export interface LocationStatsMethodology {
  readonly version: string;
  readonly activeInventory: string;
  readonly locationMatch: string;
  readonly nationalInventory: string;
  readonly verified: string;
  readonly effectivePrice: string;
  readonly freeAccounts: string;
  readonly medianPaidPrice: string;
  readonly snapshotCutoff: string;
  readonly checkedRecently: string;
  readonly refreshedRecently: string;
  readonly recentlySeen: string;
  readonly contentCounters: string;
  readonly thirtyDayChange: string;
}

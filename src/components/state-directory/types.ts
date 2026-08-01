export interface DirectorySnapshotStats {
  activeInventory?: number | null;
  verifiedCount?: number | null;
  freeAccountCount?: number | null;
  medianPaidPrice?: number | null;
  priceKnownCount?: number | null;
  refreshedIn7Days?: number | null;
  successfulCheckedIn7Days?: number | null;
  newlyDiscovered30Days?: number | null;
  contentKnownCount?: number | null;
  totalMedia?: number | null;
  change30dCount?: number | null;
  change30dPercent?: number | null;
  inventoryRank?: number | null;
  inventoryPercentile?: number | null;
  snapshotAt?: string | null;
  snapshotId?: string | number | null;
}

export interface DirectoryLocationRow extends DirectorySnapshotStats {
  label: string;
  href: string;
  abbr?: string;
  region?: string;
}

export interface DirectoryMethodologyCopy {
  source: string;
  active: string;
  verified: string;
  freeAccounts: string;
  medianPrice: string;
  freshness: string;
  contentCounters: string;
  limitations: string[];
}

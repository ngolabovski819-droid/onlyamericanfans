import type { LocationStats } from '@/types/location-stats';
import type { DirectoryLocationRow, DirectorySnapshotStats } from './types';

export function toDirectorySnapshotStats(stats: LocationStats): DirectorySnapshotStats {
  return {
    activeInventory: stats.activeCount,
    verifiedCount: stats.verifiedCount,
    freeAccountCount: stats.freeCount,
    medianPaidPrice: stats.medianPaidPrice,
    priceKnownCount: stats.priceKnownCount,
    refreshedIn7Days: stats.refreshed7dCount,
    successfulCheckedIn7Days: stats.successfulChecked7dCount,
    newlyDiscovered30Days: stats.new30dCount,
    contentKnownCount: stats.contentKnownCount,
    totalMedia: stats.totalMedia,
    change30dCount: stats.change30dCount,
    change30dPercent: stats.change30dPercent,
    inventoryRank: stats.inventoryRank,
    inventoryPercentile: stats.inventoryPercentile,
    snapshotAt: stats.completedAt,
    snapshotId: stats.snapshotId,
  };
}

export function toDirectoryLocationRow(
  identity: Pick<DirectoryLocationRow, 'label' | 'href' | 'abbr' | 'region'>,
  stats?: LocationStats | null,
): DirectoryLocationRow {
  return {
    ...identity,
    ...(stats ? toDirectorySnapshotStats(stats) : {}),
  };
}

import { LOCATION_STATS_METHODOLOGY } from '@/lib/state-stats';
import type { DirectoryMethodologyCopy } from './types';

export const DIRECTORY_METHODOLOGY: DirectoryMethodologyCopy = {
  source:
    `Statistics come from the latest fully published snapshot of public creator-directory records. ${LOCATION_STATS_METHODOLOGY.snapshotCutoff}`,
  active:
    `${LOCATION_STATS_METHODOLOGY.activeInventory} ${LOCATION_STATS_METHODOLOGY.locationMatch}`,
  verified:
    `${LOCATION_STATS_METHODOLOGY.verified} No verified status is inferred from a name, photo, biography or social link.`,
  freeAccounts:
    `${LOCATION_STATS_METHODOLOGY.effectivePrice} ${LOCATION_STATS_METHODOLOGY.freeAccounts}`,
  medianPrice:
    LOCATION_STATS_METHODOLOGY.medianPaidPrice,
  freshness:
    `${LOCATION_STATS_METHODOLOGY.snapshotCutoff} ${LOCATION_STATS_METHODOLOGY.refreshedRecently}`,
  contentCounters: LOCATION_STATS_METHODOLOGY.contentCounters,
  limitations: [
    'Location matching currently uses curated public-profile location terms rather than verified residency, so ambiguous, missing or outdated location text can affect totals.',
    'Prices and profile status can change after the displayed snapshot cutoff.',
    'Counts describe records in this directory, not every creator who may live in the location.',
    'Sponsored placement does not change these statistics or the editorial ordering of data tables.',
  ],
};

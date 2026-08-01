export type DirectoryMonitoringGroup = 'priority' | 'comparison' | 'unassigned';

export interface DirectoryGscBaseline {
  slug: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/**
 * Frozen measurement cohorts selected from the six-month GSC export ending
 * 2026-07-31. Every state receives the same product change, so these are
 * monitoring cohorts, not an A/B test and not evidence of causality.
 */
export const DIRECTORY_PRIORITY_COHORT: readonly DirectoryGscBaseline[] = Object.freeze([
  { slug: 'hawaii', clicks: 90, impressions: 2368, ctr: 0.0380, position: 6.60 },
  { slug: 'louisiana', clicks: 57, impressions: 1210, ctr: 0.0471, position: 8.37 },
  { slug: 'arkansas', clicks: 58, impressions: 968, ctr: 0.0599, position: 7.36 },
  { slug: 'idaho', clicks: 56, impressions: 946, ctr: 0.0592, position: 8.00 },
  { slug: 'alabama', clicks: 47, impressions: 945, ctr: 0.0497, position: 10.23 },
  { slug: 'illinois', clicks: 13, impressions: 517, ctr: 0.0251, position: 11.42 },
  { slug: 'indiana', clicks: 9, impressions: 325, ctr: 0.0277, position: 11.34 },
  { slug: 'texas', clicks: 5, impressions: 214, ctr: 0.0234, position: 9.26 },
  { slug: 'michigan', clicks: 5, impressions: 152, ctr: 0.0329, position: 8.97 },
  { slug: 'arizona', clicks: 7, impressions: 140, ctr: 0.0500, position: 11.16 },
  { slug: 'colorado', clicks: 4, impressions: 128, ctr: 0.0312, position: 16.98 },
  { slug: 'connecticut', clicks: 6, impressions: 122, ctr: 0.0492, position: 10.09 },
]);

export const DIRECTORY_COMPARISON_COHORT: readonly DirectoryGscBaseline[] = Object.freeze([
  { slug: 'kentucky', clicks: 42, impressions: 760, ctr: 0.0553, position: 8.60 },
  { slug: 'alaska', clicks: 18, impressions: 256, ctr: 0.0703, position: 7.70 },
  { slug: 'massachusetts', clicks: 15, impressions: 226, ctr: 0.0664, position: 8.15 },
  { slug: 'pennsylvania', clicks: 6, impressions: 154, ctr: 0.0390, position: 8.47 },
  { slug: 'delaware', clicks: 11, impressions: 140, ctr: 0.0786, position: 9.09 },
  { slug: 'ohio', clicks: 6, impressions: 135, ctr: 0.0444, position: 8.24 },
  { slug: 'maryland', clicks: 12, impressions: 129, ctr: 0.0930, position: 13.14 },
  { slug: 'new-mexico', clicks: 6, impressions: 98, ctr: 0.0612, position: 7.06 },
  { slug: 'south-carolina', clicks: 8, impressions: 91, ctr: 0.0879, position: 4.69 },
  { slug: 'nebraska', clicks: 10, impressions: 87, ctr: 0.1149, position: 8.11 },
  { slug: 'minnesota', clicks: 5, impressions: 74, ctr: 0.0676, position: 9.59 },
  { slug: 'oklahoma', clicks: 6, impressions: 58, ctr: 0.1034, position: 10.74 },
]);

const PRIORITY_SLUGS = new Set(DIRECTORY_PRIORITY_COHORT.map((row) => row.slug));
const COMPARISON_SLUGS = new Set(DIRECTORY_COMPARISON_COHORT.map((row) => row.slug));

export function getDirectoryMonitoringGroup(stateSlug: string): DirectoryMonitoringGroup {
  if (PRIORITY_SLUGS.has(stateSlug)) return 'priority';
  if (COMPARISON_SLUGS.has(stateSlug)) return 'comparison';
  return 'unassigned';
}

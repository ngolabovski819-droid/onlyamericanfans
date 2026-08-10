/**
 * Shared cap for statically-paginated browse pages (location/category), mirroring the same
 * "nobody scrolls that deep anyway" reasoning already applied to search_creators_capped()
 * (migration 013) — bounds how many pages get pre-built per scope instead of pre-building
 * potentially thousands of pages for a large state. A visitor hitting this ceiling just sees no
 * further "Next" link, same product trade-off as search's candidate-pool cap.
 */
export const MAX_PAGINATED_RESULTS = 1000;

export function cappedPageCount(total: number, pageSize: number): number {
  const cappedTotal = Math.min(total, MAX_PAGINATED_RESULTS);
  return Math.max(1, Math.ceil(cappedTotal / pageSize));
}

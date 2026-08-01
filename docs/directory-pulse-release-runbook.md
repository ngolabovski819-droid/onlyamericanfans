# Directory Pulse release runbook

This file turns the location-page SEO plan into a measurable release. It is operational documentation, not public page copy.

## Frozen baseline

- Source: `onlyamericanfans.com-Performance-on-Search-2026-07-31.xlsx`
- GSC date range present in the export: 2026-05-04 through 2026-07-29.
- The export shows a sitewide cliff beginning 2026-07-20. Daily impressions fell from 1,461 on July 19 to 251 on July 20 and stayed below 120 through July 29.
- Manual Actions, Security Issues, Temporary Removals and SafeSearch were checked separately and were clean. This release must still be evaluated as a recovery change, not assumed to be the cause of any later movement.
- Frozen state-page cohorts and their clicks, impressions, CTR and average position are in `src/config/directory-rollout.ts`.

Because the product modules ship to every state page, the priority and comparison lists are monitoring cohorts, not a randomized A/B test. Use them to detect whether high-opportunity pages recover differently; do not present the difference as causal proof.

## Deployment order

1. Apply `supabase-migrations/005_directory_location_stats.sql` in the Supabase SQL Editor.
2. Confirm the refresh function and read views exist: `refresh_directory_location_stats`, `directory_location_stats_current`, `directory_location_stats_history`, `directory_location_highlights_current`, and `directory_location_classification_audit`.
3. Run the first snapshot manually with `npm run stats:refresh` from a trusted environment containing `SUPABASE_URL` and the service-role `SUPABASE_KEY`.
4. Check that the current view contains exactly 310 rows: one national, 50 states, six regions and 253 cities. Confirm `directory_creator_locations` is populated and inspect ambiguous state/city classifications before release.
5. Inspect at least Alaska, Illinois, New York State, New York City, Texas and California for plausible counts and timestamps.
6. Confirm weak city pages are `noindex,follow` and absent from the sitemap; a city enters only after its complete snapshot passes every quality threshold.
7. Set the GitHub repository variable `DIRECTORY_STATS_ENABLED=true`. Until this is set, the scheduled workflow is intentionally inert; manual dispatch remains available.
8. Deploy the application only after the snapshot exists. This prevents production from showing the honest-but-limited sample fallback as the permanent experience.

## Release-day quality gate

- No scope row has an active count below any component count.
- Price bands sum exactly to `price_known_count`.
- State inventory ranks cover all 50 state rows.
- All rows in one published snapshot share one cutoff and methodology version.
- `content_changed_at` does not advance on an unchanged refresh.
- State and city cards remain the first primary content; analytics follow the card grid and pagination.
- Canonicals are self-referential and parameter-free, pagination is crawlable, and low-quality cities remain followable.
- Test one failed refresh and verify the previous snapshot remains published.

## GSC measurement

Record the priority and comparison cohorts at 3, 7, 14 and 28 days after deployment. Use page filters for the exact canonical state URLs and compare equivalent weekdays where possible.

For each cohort capture:

- clicks and impressions;
- CTR and average position;
- count of pages receiving impressions;
- queries in positions 4-10 and 11-20;
- branded versus non-branded query share;
- indexed canonical count and crawl anomalies.

Primary success signal: recovery in impressions without index bloat. Secondary signals: more non-branded queries in positions 4-20, improving CTR at stable position, and more priority pages receiving impressions. A rise caused only by adding weak indexed city URLs is a failure.

## What remains intentionally gated

- Profile leaderboards are now snapshot-backed. Keep their ranking rules transparent and never replace them with the visible 24-card sample.
- The normalized creator-location ledger is built by the first snapshot. Its first real-data ambiguity report still requires human review before the migration is enabled on a schedule.
- Seven-, 30- and 90-day trends become populated only as immutable daily history accrues. The interface displays “Building history” until a valid comparison exists.

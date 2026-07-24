/**
 * Sponsor OVERRIDE config — controls what a creator's card LINKS TO and SHOWS once it's
 * placed. Separate from src/config/sponsor-placements.ts, which controls WHERE it appears.
 *
 * Applies WHEREVER this creator's card renders anywhere on the site — organic search results,
 * their pinned slot (if any), any future "similar creators" surface — not just a pinned scope.
 * That's why this is keyed purely by username, with no scope dimension: any exposure should
 * credit the campaign.
 *
 * - linkOverride: replaces the default `https://onlyfans.com/<username>` outbound link. When
 *   set (or when clickTable is set), the card links through `/go/<username>` instead of
 *   linking straight out, so the redirect route can log the click and apply this override.
 * - imageOverride: replaces the default scraped/synced avatar. Deliberately NOT written into
 *   the `onlyfans_profiles` table — keeping it here means it survives the next scrape/sync and
 *   is a one-line removal when the campaign ends.
 * - clickTable: name of the per-sponsor Supabase table that logs clicks (see
 *   supabase-migrations/003_sponsor_clicks_template.sql). Only set this once that table has
 *   actually been created — the redirect route will silently no-op (and still redirect
 *   correctly) if the table doesn't exist yet, but you won't be collecting any data.
 *
 * Lookups are case-insensitive — always key entries in lowercase here regardless of the
 * creator's display casing on OnlyFans.
 */

export interface SponsorOverride {
  linkOverride?: string;
  imageOverride?: string;
  clickTable?: string;
}

// Keyed by lowercase username. Example (inactive):
// exampleuser: {
//   linkOverride: 'https://onlyfans.com/exampleuser?ref=oaf-campaign1',
//   imageOverride: 'https://cdn.example.com/exampleuser-hero.jpg',
//   clickTable: 'sponsor_clicks_exampleuser',
// },
const overrides: Record<string, SponsorOverride> = {
  emilylopz: {
    // Real tracking link — goes straight to OnlyFans (with its own campaign code), NOT through
    // fanspedia.net. fanspedia.net has its own separate /go/emilylopz + sponsor_clicks_emilylopz
    // table for its own traffic; this campaign is independent of that.
    linkOverride: 'https://onlyfans.com/emilylopz/c545',
    // imageOverride intentionally omitted — keep the existing synced avatar as-is.
    // Isolated table, not the live one fanspedia.net already writes to. Run
    // supabase-migrations/004_sponsor_clicks_emilylopz_oaf.sql once before this goes live;
    // until then, logging here is a silent no-op (the redirect itself still works).
    clickTable: 'sponsor_clicks_emilylopz_oaf',
  },
};

export function getSponsorOverride(username: string): SponsorOverride | undefined {
  return overrides[username.toLowerCase()];
}

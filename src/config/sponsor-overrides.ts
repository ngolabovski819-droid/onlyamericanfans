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
 * - imageOverride: leads the card carousel ahead of the synced avatar/header. Deliberately NOT
 *   written into the `onlyfans_profiles` table — keeping it here means it survives the next
 *   scrape/sync and is a one-line removal when the campaign ends. NOTE: this is the lead image
 *   on the homepage and in the search-bar dropdown; on every other scope (state/city/category/
 *   search results/nearby strip) src/lib/sponsorship.ts rotates the imageOverride+galleryImages
 *   set by a per-scope hash so each page leads with a different image — see
 *   rotateSponsorImages() there.
 * - clickTable: name of the per-sponsor Supabase table that logs clicks (see
 *   supabase-migrations/003_sponsor_clicks_template.sql). Only set this once that table has
 *   actually been created — the redirect route will silently no-op (and still redirect
 *   correctly) if the table doesn't exist yet, but you won't be collecting any data.
 * - galleryImages: extra carousel images, appended after imageOverride, avatar, and header.
 * - tags/additionalTagCount: compact content labels shown on paid placements.
 *
 * Lookups are case-insensitive — always key entries in lowercase here regardless of the
 * creator's display casing on OnlyFans.
 */

export interface SponsorOverride {
  linkOverride?: string;
  imageOverride?: string;
  galleryImages?: string[];
  tags?: string[];
  additionalTagCount?: number;
  clickTable?: string;
}

// Keyed by lowercase username. Example (inactive):
// exampleuser: {
//   linkOverride: 'https://onlyfans.com/exampleuser?ref=oaf-campaign1',
//   imageOverride: 'https://cdn.example.com/exampleuser-hero.jpg',
//   clickTable: 'sponsor_clicks_exampleuser',
// },
const overrides: Record<string, SponsorOverride> = {
  rinayanami: {
    linkOverride: 'https://onlyfans.com/rinayanami/c31',
    // Campaign images from the client, in their supplied numeric order (1, 3, 4, ... 16); the
    // original 15 was a byte-identical duplicate of 9 and was dropped. rina-01 leads the card.
    imageOverride: '/sponsors/rinayanami/rina-01.jpg',
    tags: ['Petite', 'Asian', 'Nerdy', 'GFE'],
    additionalTagCount: 5,
    galleryImages: [
      '/sponsors/rinayanami/rina-02.jpg',
      '/sponsors/rinayanami/rina-03.jpg',
      '/sponsors/rinayanami/rina-04.jpg',
      '/sponsors/rinayanami/rina-05.jpg',
      '/sponsors/rinayanami/rina-06.jpg',
      '/sponsors/rinayanami/rina-07.jpg',
      '/sponsors/rinayanami/rina-08.jpg',
      '/sponsors/rinayanami/rina-09.jpg',
      '/sponsors/rinayanami/rina-10.jpg',
      '/sponsors/rinayanami/rina-11.jpg',
    ],
    // Isolated _oaf table, same pattern as the other campaigns. Created by
    // supabase-migrations/015_sponsor_clicks_rinayanami_oaf.sql — must exist before deploy.
    clickTable: 'sponsor_clicks_rinayanami_oaf',
  },
  cosplaytsumiko: {
    linkOverride: 'https://onlyfans.com/cosplaytsumiko/c58',
    // Client's numbered picks first (1.jfif, 2.jfif, 3.jfif, 4.jfif, 5.jpg), then the rest of the
    // folder in natural filename order. Two byte-identical duplicates and one near-identical
    // re-encode of the same photo were dropped. tsumiko-01 leads the card.
    imageOverride: '/sponsors/cosplaytsumiko/tsumiko-01.jpg',
    tags: ['Cosplay', 'Big tits', 'Blonde'],
    additionalTagCount: 8,
    galleryImages: [
      '/sponsors/cosplaytsumiko/tsumiko-02.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-03.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-04.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-05.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-06.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-07.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-08.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-09.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-10.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-11.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-12.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-13.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-14.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-15.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-16.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-17.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-18.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-19.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-20.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-21.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-22.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-23.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-24.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-25.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-26.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-27.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-28.jpg',
      '/sponsors/cosplaytsumiko/tsumiko-29.jpg',
    ],
    // Isolated _oaf table. sponsor_clicks_cosplaytsumiko (no suffix) ALREADY EXISTS and is another
    // property's live table — never point this at it. Created by
    // supabase-migrations/016_sponsor_clicks_cosplaytsumiko_oaf.sql — must exist before deploy.
    clickTable: 'sponsor_clicks_cosplaytsumiko_oaf',
  },
  emilylopz: {
    // Real tracking link — goes straight to OnlyFans (with its own campaign code), NOT through
    // fanspedia.net. fanspedia.net has its own separate /go/emilylopz + sponsor_clicks_emilylopz
    // table for its own traffic; this campaign is independent of that.
    linkOverride: 'https://onlyfans.com/emilylopz/c545',
    // imageOverride intentionally omitted — keep the existing synced avatar as-is.
    tags: ['GFE', 'Feet fetish', 'Squirting'],
    additionalTagCount: 9,
    galleryImages: [
      '/sponsors/emilylopz/gallery-01.jpg',
      '/sponsors/emilylopz/gallery-02.jpg',
      '/sponsors/emilylopz/gallery-03.jpg',
      '/sponsors/emilylopz/gallery-04.jpg',
      '/sponsors/emilylopz/gallery-05.jpg',
      '/sponsors/emilylopz/gallery-06.jpg',
      '/sponsors/emilylopz/gallery-07.jpg',
      '/sponsors/emilylopz/gallery-08.jpg',
      '/sponsors/emilylopz/gallery-09.jpg',
      '/sponsors/emilylopz/gallery-10.jpg',
      '/sponsors/emilylopz/gallery-11.jpg',
      '/sponsors/emilylopz/gallery-12.jpg',
      '/sponsors/emilylopz/gallery-13.jpg',
      '/sponsors/emilylopz/gallery-14.jpg',
      '/sponsors/emilylopz/gallery-15.jpg',
      '/sponsors/emilylopz/gallery-16.jpg',
      '/sponsors/emilylopz/gallery-17.jpg',
      '/sponsors/emilylopz/gallery-18.jpg',
      '/sponsors/emilylopz/gallery-19.jpg',
      '/sponsors/emilylopz/gallery-20.jpg',
      '/sponsors/emilylopz/gallery-21.jpg',
      '/sponsors/emilylopz/gallery-22.jpg',
      '/sponsors/emilylopz/gallery-23.jpg',
      '/sponsors/emilylopz/gallery-24.jpg',
    ],
    // Isolated table, not the live one fanspedia.net already writes to. Run
    // supabase-migrations/004_sponsor_clicks_emilylopz_oaf.sql once before this goes live;
    // until then, logging here is a silent no-op (the redirect itself still works).
    clickTable: 'sponsor_clicks_emilylopz_oaf',
  },
  rocketreynaxo: {
    linkOverride: 'https://onlyfans.com/rocketreynaxo/c58',
    imageOverride: '/sponsors/rocketreynaxo/rocket-01.jpg',
    tags: ['Asian MILF', 'Busty', 'Curvy'],
    galleryImages: [
      '/sponsors/rocketreynaxo/rocket-02.jpg',
      '/sponsors/rocketreynaxo/rocket-03.jpg',
      '/sponsors/rocketreynaxo/rocket-04.jpg',
      '/sponsors/rocketreynaxo/rocket-05.jpg',
      '/sponsors/rocketreynaxo/rocket-06.jpg',
      '/sponsors/rocketreynaxo/rocket-07.jpg',
      '/sponsors/rocketreynaxo/rocket-08.jpg',
      '/sponsors/rocketreynaxo/rocket-09.jpg',
      '/sponsors/rocketreynaxo/rocket-10.jpg',
    ],
    clickTable: 'sponsor_clicks_rocketreynaxo_oaf',
  },
  hannazuki: {
    linkOverride: 'https://onlyfans.com/hannazuki/c1043',
    imageOverride: '/sponsors/hannazuki/hanna-01.jpg',
    tags: ['asian', 'cosplay', 'egirl', 'GFE'],
    galleryImages: [
      '/sponsors/hannazuki/hanna-02.jpg',
      '/sponsors/hannazuki/hanna-03.jpg',
      '/sponsors/hannazuki/hanna-04.jpg',
      '/sponsors/hannazuki/hanna-05.jpg',
      '/sponsors/hannazuki/hanna-06.jpg',
      '/sponsors/hannazuki/hanna-07.jpg',
    ],
    clickTable: 'sponsor_clicks_hannazuki_oaf',
  },
};

export function getSponsorOverride(username: string): SponsorOverride | undefined {
  return overrides[username.toLowerCase()];
}

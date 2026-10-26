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
 *   supabase-migrations/015_sponsor_clicks_rinayanami_oaf.sql). Only set this once that table has
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
  lucierain: {
    linkOverride: 'https://onlyfans.com/lucierain/c49',
    imageOverride: '/sponsors/lucierain/lucierain-01.jpg',
    tags: ['Fetish friendly', '18 y/o', 'Big tits'],
    additionalTagCount: 8,
    galleryImages: [
      '/sponsors/lucierain/lucierain-02.jpg',
      '/sponsors/lucierain/lucierain-03.jpg',
      '/sponsors/lucierain/lucierain-04.jpg',
      '/sponsors/lucierain/lucierain-05.jpg',
    ],
    clickTable: 'sponsor_clicks_lucierain_oaf',
  },
  eviecarrol: {
    linkOverride: 'https://onlyfans.com/eviecarrol/c141',
    imageOverride: '/sponsors/eviecarrol/eviecarrol-01.jpg',
    tags: ['18 y/o', 'Petite', 'Blonde'],
    additionalTagCount: 6,
    galleryImages: [
      '/sponsors/eviecarrol/eviecarrol-02.jpg',
    ],
    clickTable: 'sponsor_clicks_eviecarrol_oaf',
  },
  amymyohmy: {
    linkOverride: 'https://onlyfans.com/amymyohmy/c206',
    imageOverride: '/sponsors/amymyohmy/amymyohmy-01.jpg',
    tags: ['18 y/o', 'Student'],
    additionalTagCount: 7,
    galleryImages: [
      '/sponsors/amymyohmy/amymyohmy-02.jpg',
    ],
    clickTable: 'sponsor_clicks_amymyohmy_oaf',
  },
  lillyylou: {
    linkOverride: 'https://onlyfans.com/lillyylou/c385',
    imageOverride: '/sponsors/lillyylou/lillyylou-01.jpg',
    tags: ['Fetish friendly', '18 y/o', 'New to OF'],
    additionalTagCount: 8,
    galleryImages: [
      '/sponsors/lillyylou/lillyylou-02.jpg',
      '/sponsors/lillyylou/lillyylou-03.jpg',
      '/sponsors/lillyylou/lillyylou-04.jpg',
      '/sponsors/lillyylou/lillyylou-05.jpg',
      '/sponsors/lillyylou/lillyylou-06.jpg',
      '/sponsors/lillyylou/lillyylou-07.jpg',
    ],
    clickTable: 'sponsor_clicks_lillyylou_oaf',
  },
  aprilcollinsss: {
    linkOverride: 'https://onlyfans.com/aprilcollinsss/c75',
    imageOverride: '/sponsors/aprilcollinsss/aprilcollinsss-01.jpg',
    tags: ['Goon', 'Blonde', '19 y/o'],
    additionalTagCount: 4,
    galleryImages: [
      '/sponsors/aprilcollinsss/aprilcollinsss-02.jpg',
      '/sponsors/aprilcollinsss/aprilcollinsss-03.jpg',
      '/sponsors/aprilcollinsss/aprilcollinsss-04.jpg',
    ],
    clickTable: 'sponsor_clicks_aprilcollinsss_oaf',
  },
  itsgiastar: {
    linkOverride: 'https://onlyfans.com/itsgiastar/c1',
    imageOverride: '/sponsors/itsgiastar/itsgiastar-01.jpg',
    tags: ['Femdom', 'Fetish-friendly'],
    additionalTagCount: 9,
    galleryImages: [
      '/sponsors/itsgiastar/itsgiastar-02.jpg',
      '/sponsors/itsgiastar/itsgiastar-03.jpg',
      '/sponsors/itsgiastar/itsgiastar-04.jpg',
      '/sponsors/itsgiastar/itsgiastar-05.jpg',
      '/sponsors/itsgiastar/itsgiastar-06.jpg',
      '/sponsors/itsgiastar/itsgiastar-07.jpg',
      '/sponsors/itsgiastar/itsgiastar-08.jpg',
      '/sponsors/itsgiastar/itsgiastar-09.jpg',
      '/sponsors/itsgiastar/itsgiastar-10.jpg',
      '/sponsors/itsgiastar/itsgiastar-11.jpg',
      '/sponsors/itsgiastar/itsgiastar-12.jpg',
    ],
    clickTable: 'sponsor_clicks_itsgiastar_oaf',
  },
  gracieharper: {
    linkOverride: 'https://onlyfans.com/gracieharper/c415',
    imageOverride: '/sponsors/gracieharper/gracieharper-01.jpg',
    tags: ['Culinary student', 'Big tits', 'Blonde'],
    additionalTagCount: 5,
    galleryImages: [
      '/sponsors/gracieharper/gracieharper-02.jpg',
      '/sponsors/gracieharper/gracieharper-03.jpg',
      '/sponsors/gracieharper/gracieharper-04.jpg',
      '/sponsors/gracieharper/gracieharper-05.jpg',
      '/sponsors/gracieharper/gracieharper-06.jpg',
    ],
    clickTable: 'sponsor_clicks_gracieharper_oaf',
  },
  ellaajanee: {
    linkOverride: 'https://onlyfans.com/ellaajanee/c320',
    imageOverride: '/sponsors/ellaajanee/ellaajanee-01.jpg',
    tags: ['Platinum blonde', 'Big tits', '18 y/o'],
    additionalTagCount: 5,
    galleryImages: [
      '/sponsors/ellaajanee/ellaajanee-02.jpg',
      '/sponsors/ellaajanee/ellaajanee-03.jpg',
      '/sponsors/ellaajanee/ellaajanee-04.jpg',
    ],
    clickTable: 'sponsor_clicks_ellaajanee_oaf',
  },
  emillyybrown: {
    linkOverride: 'https://onlyfans.com/emillyybrown/c510',
    imageOverride: '/sponsors/emillyybrown/emillyybrown-01.jpg',
    tags: ['18 y/o', 'Art student', 'New to OF'],
    additionalTagCount: 4,
    galleryImages: [
      '/sponsors/emillyybrown/emillyybrown-02.jpg',
      '/sponsors/emillyybrown/emillyybrown-03.jpg',
      '/sponsors/emillyybrown/emillyybrown-04.jpg',
      '/sponsors/emillyybrown/emillyybrown-05.jpg',
      '/sponsors/emillyybrown/emillyybrown-06.jpg',
      '/sponsors/emillyybrown/emillyybrown-07.jpg',
      '/sponsors/emillyybrown/emillyybrown-08.jpg',
      '/sponsors/emillyybrown/emillyybrown-09.jpg',
      '/sponsors/emillyybrown/emillyybrown-10.jpg',
      '/sponsors/emillyybrown/emillyybrown-11.jpg',
    ],
    clickTable: 'sponsor_clicks_emillyybrown_oaf',
  },
};

export function getSponsorOverride(username: string): SponsorOverride | undefined {
  return overrides[username.toLowerCase()];
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { states } from '@/config/states';
import { cities } from '@/config/cities';
import { fetchCachedCreatorCount } from '@/lib/count-cache';
import { US_TERMS } from '@/config/us-terms';
import UsMap from '@/components/UsMap';
import NearbyCreatorsStrip from '@/components/NearbyCreatorsStrip';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com';

export const metadata: Metadata = {
  title: 'Browse OnlyFans Creators by State — All 50 US States | OnlyAmericanFans',
  description: 'Browse OnlyFans creators in every US state. Find top American creators from California, Texas, Florida, New York and all 50 states. Updated daily.',
  alternates: { canonical: `${SITE_URL}/browse-by-state/` },
  openGraph: {
    title: 'Browse OnlyFans Creators by State — All 50 US States',
    description: 'Find top American OnlyFans creators in every US state.',
    url: `${SITE_URL}/browse-by-state/`,
  },
};

// This page has no dynamic params, so Next prerenders it once at `next build` and serves that
// static HTML instantly to every visitor; after this window it revalidates in the BACKGROUND on
// the next request (stale-while-revalidate) while still serving the old cached page — a live
// visitor never waits on the fetches below, in production. That's specifically why the window is
// long (7 days, matching the existing 7-day "About" stat-leaderboard cache in src/lib/supabase.ts
// — STAT_LEADER_REVALIDATE_SECONDS): city/state creator counts don't need to be fresher than
// that, and a longer window means the expensive regeneration (304 Supabase count queries, several
// of which are individually slow `location ILIKE` OR-chains — see AGENTS.md) runs as rarely as
// possible.
//
// IMPORTANT — `next dev` does NOT behave this way: dev mode has no build-time prerender and no
// background stale-while-revalidate, so every request recomputes synchronously and this page will
// feel slow locally under `npm run dev`. That slowness is a dev-only artifact; verify real
// behavior with `next build && next start`, where only the build itself (and rare background
// revalidations) pay this cost — confirmed by testing that exact cycle.
// This exact value must be a static literal, not a reference — this Next.js version's build
// validates `export const revalidate` at the AST level and rejects anything else (e.g. `60 * 10`
// is explicitly called out as invalid in the docs), so it can't share the constant below even
// though they're meant to stay in sync. 604800 seconds = 7 days.
export const revalidate = 604800;
const COUNT_REVALIDATE_SECONDS = 604800; // keep in sync with the literal above

const citiesAlphabetical = [...cities].sort((a, b) => a.label.localeCompare(b.label));

const COUNT_CACHE_TTL_MS = COUNT_REVALIDATE_SECONDS * 1000;

export default async function BrowseByStatePage() {
  const [totalCreators, stateCounts, cityCounts] = await Promise.all([
    // Same US_TERMS scope the homepage uses for its "American creators" figure — an unfiltered
    // count here would include every performer in the underlying dataset, not just the
    // US-tagged ones this site is specifically about.
    fetchCachedCreatorCount(US_TERMS, COUNT_CACHE_TTL_MS),
    Promise.all(states.map((s) => fetchCachedCreatorCount(s.terms, COUNT_CACHE_TTL_MS))),
    Promise.all(citiesAlphabetical.map((c) => fetchCachedCreatorCount(c.terms, COUNT_CACHE_TTL_MS))),
  ]);
  const countByStateSlug = new Map(states.map((s, i) => [s.slug, stateCounts[i]]));
  const countByCitySlug = new Map(citiesAlphabetical.map((c, i) => [c.slug, cityCounts[i]]));
  const stateAbbrBySlug = new Map(states.map((s) => [s.slug, s.abbr]));

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Browse by State', item: `${SITE_URL}/browse-by-state/` },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'OnlyFans Creators by US State',
    itemListElement: states.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.label,
      url: `${SITE_URL}/${s.urlSlug}/`,
    })),
  };

  return (
    <div className="browse-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <section className="browse-map-section">
        <UsMap />
      </section>

      <NearbyCreatorsStrip />

      <div className="browse-hero">
        <div className="browse-hero-inner">
          <p className="browse-eyebrow">Coast to Coast</p>
          <h1 className="browse-h1">
            Browse USA <span className="browse-h1-accent">OnlyFans</span> Creators by State
          </h1>
          <p className="browse-sub">
            From sunny California to the rocky coast of Maine — discover top American OnlyFans creators
            in every one of the 50 United States. Pick your state to see verified, free and premium creators
            updated daily.
          </p>
          <div className="browse-stats">
            <div className="browse-stat">
              <span className="browse-stat-num">50</span>
              <span className="browse-stat-label">States</span>
            </div>
            <div className="browse-stat">
              <span className="browse-stat-num">350+</span>
              <span className="browse-stat-label">Cities</span>
            </div>
            <div className="browse-stat">
              <span className="browse-stat-num">{Math.floor(totalCreators / 1000)}K+</span>
              <span className="browse-stat-label">Creators</span>
            </div>
            <div className="browse-stat">
              <span className="browse-stat-num browse-stat-num--emoji" aria-hidden="true">🗺️</span>
              <span className="browse-stat-label">Interactive Map</span>
            </div>
          </div>
        </div>
      </div>

      <section className="browse-region">
        <h2 className="browse-region-title">
          <span className="browse-region-emoji" aria-hidden="true">🇺🇸</span>
          <span>All 50 States</span>
          <span className="browse-region-count">A–Z</span>
        </h2>
        <div className="browse-grid">
          {states.map((s) => {
            const count = countByStateSlug.get(s.slug) ?? 0;
            return (
              <Link key={s.slug} href={`/${s.urlSlug}/`} className="browse-card">
                <span className="browse-card-abbr">{s.abbr}</span>
                <span className="browse-card-text">
                  <span className="browse-card-name">{s.label}</span>
                  <span className="browse-card-count">{count.toLocaleString()} creators</span>
                </span>
                <span className="browse-card-arrow" aria-hidden="true">→</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="browse-region">
        <h2 className="browse-region-title">
          <span className="browse-region-emoji" aria-hidden="true">🏙️</span>
          <span>Browse by City</span>
          <span className="browse-region-count">{citiesAlphabetical.length} cities</span>
        </h2>
        <div className="browse-grid">
          {citiesAlphabetical.map((c) => {
            const count = countByCitySlug.get(c.slug) ?? 0;
            const stateAbbr = stateAbbrBySlug.get(c.parentState) ?? '';
            return (
              <Link key={c.slug} href={`/${c.urlSlug}/`} className="browse-card">
                <span className="browse-card-abbr">{stateAbbr}</span>
                <span className="browse-card-text">
                  <span className="browse-card-name">{c.label}</span>
                  <span className="browse-card-count">{count.toLocaleString()} creators</span>
                </span>
                <span className="browse-card-arrow" aria-hidden="true">→</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="browse-footer-cta">
        <h2>Can&apos;t find your state?</h2>
        <p>
          We index creators across all 50 US states. If you&apos;re searching for a specific city, try our{' '}
          <Link href="/onlyfans-search">creator search</Link> with a city or zip filter, or browse our{' '}
          <Link href="/categories/">categories</Link> page to discover creators by niche.
        </p>
      </section>
    </div>
  );
}

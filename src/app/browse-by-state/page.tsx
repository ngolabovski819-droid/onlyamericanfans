import type { Metadata } from 'next';
import Link from 'next/link';
import { states } from '@/config/states';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://onlyamericanfans.com';

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

// US Census Bureau 4-region grouping
const REGION_GROUPS: { label: string; emoji: string; slugs: string[] }[] = [
  {
    label: 'Northeast',
    emoji: '🗽',
    slugs: [
      'connecticut', 'maine', 'massachusetts', 'new-hampshire', 'new-jersey',
      'new-york', 'pennsylvania', 'rhode-island', 'vermont',
    ],
  },
  {
    label: 'Midwest',
    emoji: '🌾',
    slugs: [
      'illinois', 'indiana', 'iowa', 'kansas', 'michigan', 'minnesota',
      'missouri', 'nebraska', 'north-dakota', 'ohio', 'south-dakota', 'wisconsin',
    ],
  },
  {
    label: 'South',
    emoji: '🌴',
    slugs: [
      'alabama', 'arkansas', 'delaware', 'florida', 'georgia', 'kentucky',
      'louisiana', 'maryland', 'mississippi', 'north-carolina', 'oklahoma',
      'south-carolina', 'tennessee', 'texas', 'virginia', 'west-virginia',
    ],
  },
  {
    label: 'West',
    emoji: '🏔️',
    slugs: [
      'alaska', 'arizona', 'california', 'colorado', 'hawaii', 'idaho',
      'montana', 'nevada', 'new-mexico', 'oregon', 'utah', 'washington', 'wyoming',
    ],
  },
];

export default function BrowseByStatePage() {
  const stateBySlug = new Map(states.map((s) => [s.slug, s]));

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

      <div className="browse-hero">
        <div className="browse-hero-inner">
          <p className="browse-eyebrow">Coast to Coast</p>
          <h1 className="browse-h1">
            Browse Creators by <span className="browse-h1-accent">State</span>
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
              <span className="browse-stat-num">200+</span>
              <span className="browse-stat-label">Cities</span>
            </div>
            <div className="browse-stat">
              <span className="browse-stat-num">Daily</span>
              <span className="browse-stat-label">Updates</span>
            </div>
          </div>
        </div>
      </div>

      {REGION_GROUPS.map((region) => (
        <section key={region.label} className="browse-region">
          <h2 className="browse-region-title">
            <span className="browse-region-emoji" aria-hidden="true">{region.emoji}</span>
            <span>{region.label}</span>
            <span className="browse-region-count">{region.slugs.length} states</span>
          </h2>
          <div className="browse-grid">
            {region.slugs.map((slug) => {
              const s = stateBySlug.get(slug);
              if (!s) return null;
              return (
                <Link key={slug} href={`/${s.urlSlug}/`} className="browse-card">
                  <span className="browse-card-abbr">{s.abbr}</span>
                  <span className="browse-card-name">{s.label}</span>
                  <span className="browse-card-arrow" aria-hidden="true">→</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

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

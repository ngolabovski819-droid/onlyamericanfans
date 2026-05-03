import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRegionByUrlSlug, regions } from '@/config/regions';
import { getCityByUrlSlug, getCitiesByRegion, cities } from '@/config/cities';
import { fetchCreators } from '@/lib/supabase';
import CreatorGrid from '@/components/CreatorGrid';
import RelatedLocations from '@/components/RelatedLocations';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://onlybritishfans.com';

interface Props {
  params: Promise<{ locationSlug: string }>;
}

export async function generateStaticParams() {
  return [
    ...regions.map(r => ({ locationSlug: r.urlSlug })),
    ...cities.map(c => ({ locationSlug: c.urlSlug })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locationSlug } = await params;
  const region = getRegionByUrlSlug(locationSlug);
  const city   = !region ? getCityByUrlSlug(locationSlug) : null;
  const loc    = region ?? city;
  if (!loc) return {};
  const url = `${SITE_URL}/${locationSlug}/`;
  return {
    title: loc.metaTitle,
    description: loc.metaDesc,
    alternates: { canonical: url },
    openGraph: {
      title: loc.metaTitle,
      description: loc.metaDesc,
      url,
      images: [{ url: `${SITE_URL}/${locationSlug}/opengraph-image` }],
    },
  };
}

export default async function LocationPage({ params }: Props) {
  const { locationSlug } = await params;
  const region = getRegionByUrlSlug(locationSlug);
  const city   = !region ? getCityByUrlSlug(locationSlug) : null;

  if (!region && !city) notFound();

  const loc      = (region ?? city)!;
  const isRegion = !!region;

  const { creators, total, hasMore } = await fetchCreators({
    locationTerms: loc.terms,
    pageSize: 24,
    sort: 'popular',
    revalidate: 3600,
  });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: loc.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      ...(city
        ? [{ '@type': 'ListItem', position: 2, name: 'UK', item: SITE_URL }]
        : []),
      { '@type': 'ListItem', position: isRegion ? 2 : 3, name: loc.label, item: `${SITE_URL}/${locationSlug}/` },
    ],
  };

  const itemListSchema = creators.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${loc.h1} — Top Creators`,
    numberOfItems: total,
    itemListElement: creators.slice(0, 10).map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://onlyfans.com/${c.username}`,
      name: c.name ?? c.username,
    })),
  } : null;

  // Find parent region for city pages
  const parentRegion = city ? regions.find(r => r.slug === city.parentRegion) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}

      <div className="location-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          {city && parentRegion && (
            <>
              <Link href={`/${parentRegion.urlSlug}/`}>{parentRegion.label}</Link>
              <span className="breadcrumb-sep">›</span>
            </>
          )}
          {isRegion && (
            <>
              <Link href="/search">UK</Link>
              <span className="breadcrumb-sep">›</span>
            </>
          )}
          <span className="breadcrumb-current">{loc.label}</span>
        </nav>

        <div className="location-page-header">
          <h1>{loc.h1}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {total.toLocaleString()} creators found in {loc.label}
          </p>
          <p className="location-intro">{loc.intro}</p>
        </div>

        {/* Creator grid */}
        <CreatorGrid
          initialCreators={creators}
          initialTotal={total}
          initialHasMore={hasMore}
          locationTerms={loc.terms}
        />

        {/* Related locations */}
        {isRegion && region && (
          <RelatedLocations
            mode="state-to-cities"
            stateSlug={region.slug}
            stateLabel={region.label}
          />
        )}
        {city && (
          <RelatedLocations
            mode="city-to-siblings"
            citySlug={city.slug}
            parentStateLabel={parentRegion?.label}
            parentStateUrlSlug={parentRegion?.urlSlug}
          />
        )}
        {isRegion && (
          <RelatedLocations mode="state-chips" currentSlug={region?.slug} />
        )}

        {/* FAQ */}
        <section className="faq-section">
          <h2 className="faq-heading">Frequently Asked Questions about {loc.label} OnlyFans</h2>
          <dl className="faq-list">
            {loc.faqs.map((faq, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">{faq.q}</summary>
                <dd className="faq-answer">{faq.a}</dd>
              </details>
            ))}
          </dl>
        </section>

        {/* Region directory links for city pages */}
        {city && parentRegion && (
          <section style={{ padding: '2rem 0' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              More Cities in {parentRegion.label}
            </h2>
            <div className="chips-row chips-row--wrap">
              {getCitiesByRegion(city.parentRegion)
                .filter(c => c.slug !== city.slug)
                .map(c => (
                  <Link key={c.slug} href={`/${c.urlSlug}/`} className="location-chip">{c.label} OnlyFans</Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStateByUrlSlug, states } from '@/config/states';
import { getCityByUrlSlug, getCitiesByState, cities } from '@/config/cities';
import { getRegionByUrlSlug, regions } from '@/config/regions';

import { fetchScopedCreators } from '@/lib/sponsorship';
import CreatorGrid from '@/components/CreatorGrid';
import CreatorStatsSection from '@/components/CreatorStatsSection';
import RelatedLocations from '@/components/RelatedLocations';
import { expandLocationFaqs } from '@/lib/faqs';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com';

interface Props {
  params: Promise<{ locationSlug: string }>;
}

export async function generateStaticParams() {
  const locationRoutes = [
    ...states.map((state) => ({ locationSlug: state.urlSlug, source: `state:${state.slug}` })),
    ...cities.map((city) => ({ locationSlug: city.urlSlug, source: `city:${city.slug}` })),
    ...regions.map((region) => ({ locationSlug: region.urlSlug, source: `region:${region.slug}` })),
  ];

  const owners = new Map<string, string>();
  for (const route of locationRoutes) {
    const existingOwner = owners.get(route.locationSlug);
    if (existingOwner) {
      throw new Error(
        `Duplicate location URL slug "${route.locationSlug}" is owned by both ${existingOwner} and ${route.source}`,
      );
    }
    owners.set(route.locationSlug, route.source);
  }

  return locationRoutes.map(({ locationSlug }) => ({ locationSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locationSlug } = await params;
  const state  = getStateByUrlSlug(locationSlug);
  const city   = !state ? getCityByUrlSlug(locationSlug) : null;
  const region = !state && !city ? getRegionByUrlSlug(locationSlug) : null;
  const loc    = state ?? city ?? region;
  if (!loc) return {};
  const url = `${SITE_URL}/${locationSlug}`;
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
  const state  = getStateByUrlSlug(locationSlug);
  const city   = !state ? getCityByUrlSlug(locationSlug) : null;
  const region = !state && !city ? getRegionByUrlSlug(locationSlug) : null;

  if (!state && !city && !region) notFound();

  const loc = (state ?? city ?? region)!;
  const isState = !!state;
  const isRegion = !!region;

  const scope = state ? `state:${state.slug}` : city ? `city:${city.slug}` : `region:${region!.slug}`;

  const { creators, total, hasMore } = await fetchScopedCreators({
    scope,
    locationTerms: loc.terms,
    pageSize: 24,
    sort: 'popular',
    revalidate: 3600,
  });

  // Find parent state for city pages
  const parentState = city ? states.find(s => s.slug === city.parentState) : null;

  const faqs = expandLocationFaqs({
    customFaqs: loc.faqs,
    label: loc.label,
    total,
    isState: isState || isRegion,
    abbr: state?.abbr ?? region?.abbr,
    parentStateLabel: parentState?.label,
  });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
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
      ...(city && parentState
        ? [{ '@type': 'ListItem', position: 2, name: parentState.label, item: `${SITE_URL}/${parentState.urlSlug}` }]
        : []),
      { '@type': 'ListItem', position: (isState || isRegion) ? 2 : 3, name: loc.label, item: `${SITE_URL}/${locationSlug}` },
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


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}

      <div className="location-page page-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          {city && parentState && (
            <>
              <Link href={`/${parentState.urlSlug}`}>{parentState.label}</Link>
              <span className="breadcrumb-sep">›</span>
            </>
          )}
          {isState && (
            <>
              <Link href="/browse-by-state">United States</Link>
              <span className="breadcrumb-sep">›</span>
            </>
          )}
          <span className="breadcrumb-current">{loc.label}</span>
        </nav>

        {/* Hero */}
        <section className="detail-hero starfield">
          <div className="detail-hero-inner">
            <p className="eyebrow-pill">
              {isRegion ? 'Region' : isState ? 'State' : 'City'}{parentState ? ` · ${parentState.label}` : ''}
            </p>
            <h1>
              <span className="gradient-accent">{loc.label}</span> OnlyFans
            </h1>
            <p className="display-sub" style={{ margin: '0 0 0.5rem', maxWidth: 720 }}>{loc.intro}</p>
            <div className="detail-hero-meta">
              <span className="detail-hero-meta-item"><strong>{total.toLocaleString()}</strong> creators</span>
              <span className="detail-hero-meta-item">📍 {loc.label}{parentState ? `, ${parentState.abbr}` : ''}</span>
              <span className="detail-hero-meta-item">🔄 Updated daily</span>
              <span className="detail-hero-meta-item">✓ 100% verified</span>
            </div>
          </div>
        </section>

        {/* Creator grid */}
        <CreatorGrid
          initialCreators={creators}
          initialTotal={total}
          initialHasMore={hasMore}
          locationTerms={loc.terms}
          pageSize={24}
          scope={scope}
        />

        {/* About / Creator Stats (programmatic SEO) */}
        <CreatorStatsSection
          headingLabel={loc.label}
          params={{ locationTerms: loc.terms }}
        />

        {/* Related locations */}
        {isState && state && (
          <RelatedLocations
            mode="state-to-cities"
            stateSlug={state.slug}
            stateLabel={state.label}
          />
        )}
        {city && (
          <RelatedLocations
            mode="city-to-siblings"
            citySlug={city.slug}
            parentStateLabel={parentState?.label}
            parentStateUrlSlug={parentState?.urlSlug}
          />
        )}
        {isState && (
          <RelatedLocations mode="state-chips" currentSlug={state?.slug} />
        )}
        {isRegion && region && (
          <RelatedLocations mode="region-to-cities" regionSlug={region.slug} />
        )}

        {/* FAQ */}
        <section className="faq-section">
          <h2 className="faq-heading">Frequently Asked Questions about {loc.label} OnlyFans</h2>
          <dl className="faq-list">
            {faqs.map((faq, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">{faq.q}</summary>
                <dd className="faq-answer">{faq.a}</dd>
              </details>
            ))}
          </dl>
        </section>

        {/* State directory links for city pages */}
        {city && parentState && (
          <section style={{ padding: '2rem 0' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              More Cities in {parentState.label}
            </h2>
            <div className="chips-row chips-row--wrap">
              {getCitiesByState(city.parentState)
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

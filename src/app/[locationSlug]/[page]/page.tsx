import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStateByUrlSlug, states } from '@/config/states';
import { getCityByUrlSlug, cities } from '@/config/cities';
import { getRegionByUrlSlug, regions } from '@/config/regions';
import { fetchScopedCreators } from '@/lib/sponsorship';
import { fetchCreators } from '@/lib/supabase';
import StaticCreatorGrid from '@/components/StaticCreatorGrid';
import { cappedPageCount } from '@/lib/pagination';

// See the identical comment in src/app/[locationSlug]/page.tsx — false freezes the page forever,
// but only actually works because the fetchScopedCreators call below also passes revalidate:false.
export const revalidate = false;
export const dynamicParams = false; // beyond the capped page count, there's genuinely no more to show — 404, don't attempt to render on demand

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com';
const PAGE_SIZE = 24;

interface Props {
  params: Promise<{ locationSlug: string; page: string }>;
}

/**
 * Pages 2+ of a location's creator listing (state, city, or region) — see src/app/
 * [locationSlug]/page.tsx for page 1 (which carries the hero/FAQ/related-locations content;
 * duplicating that across potentially dozens of paginated pages per location would be both
 * wasted build work and near-duplicate-content SEO noise, so these pages stay deliberately
 * lighter).
 */
export async function generateStaticParams() {
  const allLocations = [
    ...states.map((s) => ({ urlSlug: s.urlSlug, terms: s.terms })),
    ...cities.map((c) => ({ urlSlug: c.urlSlug, terms: c.terms })),
    ...regions.map((r) => ({ urlSlug: r.urlSlug, terms: r.terms })),
  ];

  const results: { locationSlug: string; page: string }[] = [];
  for (const loc of allLocations) {
    // pageSize:1 here is a cheap count-only lookup, not a real data fetch — same pattern as
    // src/lib/count-cache.ts's fetchCachedCreatorCount. Deliberately calls fetchCreators()
    // directly rather than fetchScopedCreators(): the latter slots sponsor pins into the
    // requested page before deciding how many organic rows to fetch, and with pageSize:1 the
    // single pinned slot (position 1, every scope) satisfies the whole "page" on its own —
    // organicNeeded drops to 0, the real count query never runs, and total collapses to just
    // the pinned count (3) instead of the real total. Bypassing the pin logic for a pure count
    // sidesteps that; the ~3-row difference from pins doesn't matter for page-count math anyway.
    const { total } = await fetchCreators({
      locationTerms: loc.terms,
      pageSize: 1,
    });
    const pageCount = cappedPageCount(total, PAGE_SIZE);
    for (let p = 2; p <= pageCount; p++) {
      results.push({ locationSlug: loc.urlSlug, page: String(p) });
    }
  }
  return results;
}

function resolveLocation(locationSlug: string) {
  const state = getStateByUrlSlug(locationSlug);
  const city = !state ? getCityByUrlSlug(locationSlug) : null;
  const region = !state && !city ? getRegionByUrlSlug(locationSlug) : null;
  return { state, city, region, loc: state ?? city ?? region };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locationSlug, page } = await params;
  const { loc } = resolveLocation(locationSlug);
  if (!loc) return {};
  const url = `${SITE_URL}/${locationSlug}/${page}`;
  return {
    title: `${loc.metaTitle} — Page ${page}`,
    description: loc.metaDesc,
    alternates: { canonical: url },
  };
}

export default async function LocationPageNumbered({ params }: Props) {
  const { locationSlug, page: pageParam } = await params;
  const { state, city, region, loc } = resolveLocation(locationSlug);
  if (!loc) notFound();

  const page = parseInt(pageParam, 10);
  if (!Number.isInteger(page) || page < 2) notFound();

  const parentState = city ? states.find((s) => s.slug === city.parentState) : null;

  const scope = state ? `state:${state.slug}` : city ? `city:${city.slug}` : `region:${region!.slug}`;
  const { creators, total } = await fetchScopedCreators({
    scope,
    locationTerms: loc.terms,
    pageSize: PAGE_SIZE,
    page,
    sort: 'popular',
    revalidate: false,
  });

  const totalPages = cappedPageCount(total, PAGE_SIZE);
  if (creators.length === 0 && page > totalPages) notFound();

  const locPosition = city && parentState ? 3 : 2;
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      ...(city && parentState
        ? [{ '@type': 'ListItem', position: 2, name: parentState.label, item: `${SITE_URL}/${parentState.urlSlug}` }]
        : []),
      { '@type': 'ListItem', position: locPosition, name: loc.label, item: `${SITE_URL}/${locationSlug}` },
      { '@type': 'ListItem', position: locPosition + 1, name: `Page ${page}`, item: `${SITE_URL}/${locationSlug}/${page}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="location-page page-container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          {city && parentState && (
            <>
              <Link href={`/${parentState.urlSlug}`}>{parentState.label}</Link>
              <span className="breadcrumb-sep">›</span>
            </>
          )}
          {state && (
            <>
              <Link href="/browse-by-state">United States</Link>
              <span className="breadcrumb-sep">›</span>
            </>
          )}
          <Link href={`/${locationSlug}`}>{loc.label}</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Page {page}</span>
        </nav>

        <section className="detail-hero starfield" style={{ paddingBottom: '1.5rem' }}>
          <div className="detail-hero-inner">
            <h1>
              <span className="gradient-accent">{loc.label}</span> OnlyFans — Page {page}
            </h1>
          </div>
        </section>

        <StaticCreatorGrid
          creators={creators}
          total={Math.min(total, totalPages * PAGE_SIZE)}
          currentPage={page}
          totalPages={totalPages}
          baseUrl={`/${locationSlug}`}
        />

        <p style={{ textAlign: 'center', padding: '1rem' }}>
          <Link href={`/${locationSlug}`} className="section-rail-link">← Back to {loc.label} OnlyFans overview</Link>
        </p>
      </div>
    </>
  );
}

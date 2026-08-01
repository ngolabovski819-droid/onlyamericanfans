import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CreatorGrid from '@/components/CreatorGrid';
import DirectoryPagination from '@/components/DirectoryPagination';
import JsonLd from '@/components/JsonLd';
import RelatedLocations from '@/components/RelatedLocations';
import {
  DIRECTORY_METHODOLOGY,
  DirectoryComparison,
  DirectoryPulseSummary,
  DirectorySampleSnapshot,
  DirectorySnapshot,
  DirectoryTable,
  LocationDirectoryOverview,
  Methodology,
  buildDirectoryFaqs,
  buildDirectoryFallbackFaqs,
  toDirectoryLocationRow,
  toDirectorySnapshotStats,
} from '@/components/state-directory';
import { getCitiesByState, getCityByUrlSlug, cities } from '@/config/cities';
import { getRegionByUrlSlug, regions } from '@/config/regions';
import { getStateByUrlSlug, states } from '@/config/states';
import { SITE_URL } from '@/lib/site-url';
import { fetchScopedCreators } from '@/lib/sponsorship';
import {
  MIN_INDEXABLE_CITY_INVENTORY,
  getDirectoryCanonical,
  getDirectoryRobots,
} from '@/lib/seo/indexation';
import {
  buildCollectionPageJsonLd,
  buildDirectoryDatasetJsonLd,
  buildDirectoryItemListJsonLd,
} from '@/lib/seo/directory-json-ld';
import { getDirectoryPageCount, parseDirectoryPage } from '@/lib/seo/pagination';
import {
  getLocationStats,
  getNationalLocationStats,
  getStateStatsBundle,
} from '@/lib/state-stats';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locationSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ locationSlug }, query] = await Promise.all([params, searchParams]);
  const state = getStateByUrlSlug(locationSlug);
  const city = !state ? getCityByUrlSlug(locationSlug) : null;
  const region = !state && !city ? getRegionByUrlSlug(locationSlug) : null;
  const loc = state ?? city ?? region;
  if (!loc) return {};

  const page = parseDirectoryPage(query.page, 500);
  const url = getDirectoryCanonical(SITE_URL, `/${locationSlug}`, query.page);
  const pageSuffix = page > 1 ? ` — Page ${page}` : '';
  const scopeType = state ? 'state' : city ? 'city' : 'region';
  const stats = await getLocationStats(scopeType, loc.slug);
  const queryRobots = getDirectoryRobots({ searchParams: query, maxIndexablePage: 500 });
  const cityHasEnoughInventory = !city || !stats || stats.activeCount >= MIN_INDEXABLE_CITY_INVENTORY;
  const pageIsInRange = !stats || page <= getDirectoryPageCount(stats.activeCount, 24);
  const queryShouldIndex = typeof queryRobots !== 'string' && queryRobots?.index !== false;
  const shouldIndex = cityHasEnoughInventory && pageIsInRange && queryShouldIndex;
  const title = `${loc.label} OnlyFans Creators — Prices & Directory Data${pageSuffix}`;
  const description = stats
    ? `Browse ${stats.activeCount.toLocaleString('en-US')} active creator profiles matched to ${loc.label}, including ${stats.verifiedCount.toLocaleString('en-US')} verified and ${stats.freeCount.toLocaleString('en-US')} free accounts. See prices and methodology.`
    : `Browse public creator profile records matched to ${loc.label}. See current cards, advertised prices and the documented limits of the directory's location methodology.`;
  return {
    title,
    description,
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: { index: shouldIndex, follow: true },
    },
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | OnlyAmericanFans`,
      description,
      url,
      images: [{ url: `${SITE_URL}/${locationSlug}/opengraph-image` }],
    },
  };
}

export default async function LocationPage({ params, searchParams }: Props) {
  const [{ locationSlug }, query] = await Promise.all([params, searchParams]);
  const page = parseDirectoryPage(query.page, 500);
  const state = getStateByUrlSlug(locationSlug);
  const city = !state ? getCityByUrlSlug(locationSlug) : null;
  const region = !state && !city ? getRegionByUrlSlug(locationSlug) : null;
  if (!state && !city && !region) notFound();

  const loc = (state ?? city ?? region)!;
  const isState = Boolean(state);
  const isRegion = Boolean(region);
  const scope = state ? `state:${state.slug}` : city ? `city:${city.slug}` : `region:${region!.slug}`;
  const parentState = city ? states.find((candidate) => candidate.slug === city.parentState) : null;

  const statsPromise = state
    ? getStateStatsBundle(state.slug).then((bundle) => ({
        location: bundle.state,
        national: bundle.national,
        cities: bundle.cities,
      }))
    : Promise.all([
        getLocationStats(city ? 'city' : 'region', loc.slug),
        getNationalLocationStats(),
      ]).then(([location, national]) => ({ location, national, cities: [] }));

  const [creatorResult, statsBundle] = await Promise.all([
    fetchScopedCreators({
      scope,
      locationTerms: loc.terms,
      page,
      pageSize: 24,
      sort: 'popular',
      revalidate: 3600,
      fallbackToPopularIfEmpty: false,
    }),
    statsPromise,
  ]);
  const { creators, total, hasMore, nextCursor } = creatorResult;
  const { location: locationStats, national: nationalStats, cities: cityStats } = statsBundle;
  const locationSnapshot = locationStats ? toDirectorySnapshotStats(locationStats) : null;
  const nationalSnapshot = nationalStats ? toDirectorySnapshotStats(nationalStats) : null;
  const configuredCities = state ? getCitiesByState(state.slug) : [];
  const cityStatsBySlug = new Map(cityStats.map((row) => [row.scopeSlug, row]));
  const cityRows = state
    ? configuredCities
        .toSorted((left, right) => {
          const leftCount = cityStatsBySlug.get(left.slug)?.activeCount;
          const rightCount = cityStatsBySlug.get(right.slug)?.activeCount;
          if (leftCount == null && rightCount == null) return left.label.localeCompare(right.label);
          if (leftCount == null) return 1;
          if (rightCount == null) return -1;
          return rightCount - leftCount || left.label.localeCompare(right.label);
        })
        .map((configuredCity) => toDirectoryLocationRow({
          label: configuredCity.label,
          href: `/${configuredCity.urlSlug}`,
        }, cityStatsBySlug.get(configuredCity.slug)))
    : [];
  const visibleSampleSize = creators.filter((creator) => !creator.sponsored).length;
  const faqs = locationSnapshot
    ? buildDirectoryFaqs({ label: loc.label, stats: locationSnapshot, cutoffAt: locationStats?.cutoffAt })
    : buildDirectoryFallbackFaqs({
        label: loc.label,
        terms: loc.terms,
        estimatedInventory: total,
        visibleSampleSize,
      });
  const canonicalUrl = getDirectoryCanonical(SITE_URL, `/${locationSlug}`, query.page);
  const pageDescription = locationStats
    ? `Browse ${locationStats.activeCount.toLocaleString('en-US')} active public creator profiles matched to ${loc.label}, including ${locationStats.verifiedCount.toLocaleString('en-US')} with source-reported verification and ${locationStats.freeCount.toLocaleString('en-US')} with a known $0 advertised price.`
    : `Browse public creator profile records matched to ${loc.label}, with documented location methodology and clearly disclosed sponsored placements.`;

  const faqSchema = page === 1 && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } : null;
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      ...(city && parentState
        ? [{ '@type': 'ListItem', position: 2, name: parentState.label, item: `${SITE_URL}/${parentState.urlSlug}` }]
        : []),
      { '@type': 'ListItem', position: (isState || isRegion) ? 2 : 3, name: loc.label, item: `${SITE_URL}/${locationSlug}` },
    ],
  };
  const itemListSchema = creators.length > 0 ? buildDirectoryItemListJsonLd({
    name: `${loc.label} creator directory${page > 1 ? `, page ${page}` : ''}`,
    url: canonicalUrl,
    totalItems: locationStats?.activeCount,
    positionOffset: (page - 1) * 24,
    items: creators.slice(0, 10).map((creator) => ({
      url: `https://onlyfans.com/${creator.username}`,
      name: creator.name ?? creator.username,
    })),
  }) : null;
  const collectionPageSchema = buildCollectionPageJsonLd({
    name: `${loc.label} creator directory${page > 1 ? ` — Page ${page}` : ''}`,
    description: pageDescription,
    url: canonicalUrl,
    dateModified: locationStats?.contentChangedAt,
    breadcrumbId: `${canonicalUrl}#breadcrumb`,
    itemListId: itemListSchema ? `${canonicalUrl}#creator-list` : undefined,
  });
  const datasetSchema = page === 1 && locationStats ? buildDirectoryDatasetJsonLd({
    name: `${loc.label} creator directory snapshot`,
    description: `Aggregated inventory, verification, price and freshness metrics for public creator records matched to ${loc.label}.`,
    url: canonicalUrl,
    dateModified: locationStats.contentChangedAt,
    spatialCoverage: parentState ? `${loc.label}, ${parentState.label}, United States` : `${loc.label}, United States`,
    methodologyUrl: `${SITE_URL}/methodology`,
    temporalCoverage: `${locationStats.cutoffAt}/${locationStats.completedAt}`,
    variables: [
      { name: 'Active inventory', description: 'Active performer records matching the published location methodology.' },
      { name: 'Verified profiles', description: 'Active inventory explicitly marked verified by the source record.' },
      { name: 'Free accounts', description: 'Price-known active profiles with an effective advertised price of zero.' },
      { name: 'Median paid price', description: 'Median effective advertised price above zero.' },
      { name: 'Directory freshness', description: 'Recently refreshed and newly discovered profile counts.' },
    ],
  }) : null;

  return (
    <>
      <JsonLd id="location-breadcrumbs" data={breadcrumbSchema} />
      <JsonLd id="location-collection" data={collectionPageSchema} />
      {faqSchema && <JsonLd id="location-faqs" data={faqSchema} />}
      {itemListSchema && <JsonLd id="location-creators" data={itemListSchema} />}
      {datasetSchema && <JsonLd id="location-dataset" data={datasetSchema} />}

      <div className="location-page page-container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep" aria-hidden="true">›</span>
          {city && parentState && (
            <>
              <Link href={`/${parentState.urlSlug}`}>{parentState.label}</Link>
              <span className="breadcrumb-sep" aria-hidden="true">›</span>
            </>
          )}
          {isState && (
            <>
              <Link href="/browse-by-state">United States</Link>
              <span className="breadcrumb-sep" aria-hidden="true">›</span>
            </>
          )}
          <span className="breadcrumb-current" aria-current="page">{loc.label}</span>
        </nav>

        <section className="detail-hero starfield">
          <div className="detail-hero-inner">
            <p className="eyebrow-pill">
              {isRegion ? 'Region' : isState ? 'State' : 'City'}{parentState ? ` · ${parentState.label}` : ''}
            </p>
            <h1><span className="gradient-accent">{loc.label}</span> OnlyFans</h1>
            <p className="display-sub" style={{ margin: '0 0 0.5rem', maxWidth: 720 }}>
              {locationStats
                ? `Browse public creator profiles matched to ${loc.label}, backed by a published directory snapshot with one consistent cutoff.`
                : `Browse public creator profiles matched to ${loc.label}, with clearly labeled live-query estimates and page-sample observations while the next aggregate snapshot is pending.`}
            </p>
            <div className="detail-hero-meta">
              {locationStats && (
                <span className="detail-hero-meta-item">
                  <strong>{locationStats.activeCount.toLocaleString()}</strong> active inventory
                </span>
              )}
              <span className="detail-hero-meta-item">Location: {loc.label}{parentState ? `, ${parentState.abbr}` : ''}</span>
              {locationStats && (
                <span className="detail-hero-meta-item">
                  <strong>{locationStats.verifiedCount.toLocaleString()}</strong> verified
                </span>
              )}
              {locationStats?.completedAt && (
                <span className="detail-hero-meta-item">
                  Snapshot published {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(locationStats.completedAt))}
                </span>
              )}
            </div>
          </div>
        </section>

        {page === 1 && locationStats && (
          <DirectoryPulseSummary
            stats={locationStats}
            nationalStats={nationalStats}
            leadingCity={state ? cityStats[0] : null}
          />
        )}

        {page === 1 && locationSnapshot && nationalSnapshot && (
          <DirectoryComparison label={loc.label} local={locationSnapshot} national={nationalSnapshot} />
        )}

        {page === 1 && state && cityStats.length > 0 && cityRows.length > 0 && (
          <DirectoryTable
            rows={cityRows}
            title={`${state.label} city directory breakdown`}
            description={`Compare configured ${state.label} city pages using the same published snapshot. Cities without a trustworthy rollup remain linked and clearly marked as not available.`}
            firstColumnLabel="City"
            id="state-city-directory-heading"
          />
        )}

        {page === 1 && isState && state && (
          <RelatedLocations mode="state-to-cities" stateSlug={state.slug} stateLabel={state.label} />
        )}

        <CreatorGrid
          initialCreators={creators}
          initialTotal={locationStats?.activeCount ?? total}
          initialTotalIsEstimated={!locationStats}
          initialHasMore={hasMore}
          initialPage={page}
          initialNextCursor={nextCursor}
          locationTerms={loc.terms}
          pageSize={24}
          scope={scope}
          fallbackToPopularIfEmpty={false}
          showLoadMore={false}
        />

        <DirectoryPagination
          basePath={`/${locationSlug}`}
          currentPage={page}
          hasNextPage={hasMore}
          totalPages={locationStats ? getDirectoryPageCount(locationStats.activeCount, 24) : undefined}
          ariaLabel={`${loc.label} creator directory pages`}
        />

        {page === 1 && (
          locationSnapshot
            ? <DirectorySnapshot label={loc.label} stats={locationSnapshot} />
            : <DirectorySampleSnapshot label={loc.label} creators={creators} estimatedInventory={total} />
        )}

        {page === 1 && (
          <LocationDirectoryOverview
            label={loc.label}
            kind={isState ? 'state' : city ? 'city' : 'region'}
            terms={loc.terms}
            parentState={parentState ? { label: parentState.label, href: `/${parentState.urlSlug}` } : null}
            configuredCityCount={configuredCities.length}
          />
        )}

        {page === 1 && city && (
          <RelatedLocations
            mode="city-to-siblings"
            citySlug={city.slug}
            parentStateLabel={parentState?.label}
            parentStateUrlSlug={parentState?.urlSlug}
          />
        )}
        {page === 1 && isState && <RelatedLocations mode="state-chips" currentSlug={state?.slug} />}
        {page === 1 && isRegion && region && <RelatedLocations mode="region-to-cities" regionSlug={region.slug} />}

        {page === 1 && (
          <Methodology
            methodology={DIRECTORY_METHODOLOGY}
            snapshotAt={locationStats?.completedAt}
            snapshotId={locationStats?.snapshotId}
          />
        )}

        {page === 1 && faqs.length > 0 && (
          <section className="faq-section" aria-labelledby="location-faq-heading">
            <h2 id="location-faq-heading" className="faq-heading">{loc.label} directory data questions</h2>
            <div className="faq-list">
              {faqs.map((faq) => (
                <details key={faq.q} className="faq-item">
                  <summary className="faq-question">{faq.q}</summary>
                  <p className="faq-answer">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {page === 1 && city && parentState && (
          <section style={{ padding: '2rem 0' }} aria-labelledby="more-state-cities-heading">
            <h2 id="more-state-cities-heading" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              More Cities in {parentState.label}
            </h2>
            <div className="chips-row chips-row--wrap">
              {getCitiesByState(city.parentState)
                .filter((configuredCity) => configuredCity.slug !== city.slug)
                .map((configuredCity) => (
                  <Link key={configuredCity.slug} href={`/${configuredCity.urlSlug}`} className="location-chip">
                    {configuredCity.label} OnlyFans
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import styles from '@/components/state-directory/state-directory.module.css';
import {
  DIRECTORY_METHODOLOGY,
  DirectorySnapshot,
  DirectoryTable,
  Methodology,
  toDirectoryLocationRow,
  toDirectorySnapshotStats,
} from '@/components/state-directory';
import { states } from '@/config/states';
import {
  buildCollectionPageJsonLd,
  buildDirectoryDatasetJsonLd,
} from '@/lib/seo/directory-json-ld';
import { SITE_URL } from '@/lib/site-url';
import { getAllStateLocationStats, getNationalLocationStats } from '@/lib/state-stats';

export const metadata: Metadata = {
  title: 'Browse OnlyFans Creators by State — All 50 US States',
  description:
    'Browse creator directories for all 50 US states, with city links, transparent location methodology and comparative analytics when a complete snapshot is available.',
  alternates: { canonical: `${SITE_URL}/browse-by-state` },
  openGraph: {
    title: 'Browse OnlyFans Creators by State — All 50 US States',
    description: 'Explore creator directories, city links and transparent data methodology for every US state.',
    url: `${SITE_URL}/browse-by-state`,
  },
};

const REGION_GROUPS: { label: string; slugs: string[] }[] = [
  {
    label: 'Northeast',
    slugs: [
      'connecticut', 'maine', 'massachusetts', 'new-hampshire', 'new-jersey',
      'new-york', 'pennsylvania', 'rhode-island', 'vermont',
    ],
  },
  {
    label: 'Midwest',
    slugs: [
      'illinois', 'indiana', 'iowa', 'kansas', 'michigan', 'minnesota',
      'missouri', 'nebraska', 'north-dakota', 'ohio', 'south-dakota', 'wisconsin',
    ],
  },
  {
    label: 'South',
    slugs: [
      'alabama', 'arkansas', 'delaware', 'florida', 'georgia', 'kentucky',
      'louisiana', 'maryland', 'mississippi', 'north-carolina', 'oklahoma',
      'south-carolina', 'tennessee', 'texas', 'virginia', 'west-virginia',
    ],
  },
  {
    label: 'West',
    slugs: [
      'alaska', 'arizona', 'california', 'colorado', 'hawaii', 'idaho',
      'montana', 'nevada', 'new-mexico', 'oregon', 'utah', 'washington', 'wyoming',
    ],
  },
];

export default async function BrowseByStatePage() {
  const pageUrl = `${SITE_URL}/browse-by-state`;
  const [nationalStats, stateStats] = await Promise.all([
    getNationalLocationStats(),
    getAllStateLocationStats(),
  ]);
  const statsByState = new Map(stateStats.map((row) => [row.scopeSlug, row]));
  const regionByState = new Map(
    REGION_GROUPS.flatMap((region) => region.slugs.map((slug) => [slug, region.label] as const)),
  );
  const tableRows = states.map((state) => toDirectoryLocationRow({
    label: state.label,
    abbr: state.abbr,
    href: `/${state.urlSlug}`,
    region: regionByState.get(state.slug),
  }, statsByState.get(state.slug)));
  const publishedSnapshot = nationalStats ?? stateStats[0] ?? null;
  const hasCompleteStateSnapshot = Boolean(nationalStats)
    && states.every((state) => statsByState.has(state.slug));

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Browse by State', item: `${SITE_URL}/browse-by-state` },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${pageUrl}#state-list`,
    name: 'OnlyFans Creators by US State',
    numberOfItems: states.length,
    itemListElement: states.map((state, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: state.label,
      url: `${SITE_URL}/${state.urlSlug}`,
    })),
  };
  const collectionPageJsonLd = buildCollectionPageJsonLd({
    name: 'Browse creators by US state',
    description: metadata.description ?? 'Compare creator directory statistics across all 50 US states.',
    url: pageUrl,
    dateModified: nationalStats?.contentChangedAt,
    breadcrumbId: `${pageUrl}#breadcrumb`,
    itemListId: `${pageUrl}#state-list`,
  });
  const datasetJsonLd = nationalStats ? buildDirectoryDatasetJsonLd({
    name: 'OnlyAmericanFans US state directory snapshot',
    description: 'A consistent published snapshot of creator inventory, verification, advertised price and freshness metrics across US states.',
    url: pageUrl,
    dateModified: nationalStats.contentChangedAt,
    spatialCoverage: 'United States',
    methodologyUrl: `${SITE_URL}/methodology`,
    temporalCoverage: `${nationalStats.cutoffAt}/${nationalStats.completedAt}`,
    variables: [
      { name: 'Active inventory' },
      { name: 'Verified profiles' },
      { name: 'Free accounts' },
      { name: 'Median paid price' },
      { name: 'Directory freshness' },
    ],
  }) : null;

  return (
    <div className="browse-page">
      <JsonLd id="browse-state-breadcrumbs" data={breadcrumbJsonLd} />
      <JsonLd id="browse-state-list" data={itemListJsonLd} />
      <JsonLd id="browse-state-collection" data={collectionPageJsonLd} />
      {datasetJsonLd && <JsonLd id="browse-state-dataset" data={datasetJsonLd} />}

      <div className="browse-hero">
        <div className="browse-hero-inner">
          <p className="browse-eyebrow">US Directory Pulse</p>
          <h1 className="browse-h1">
            Browse Creators by <span className="browse-h1-accent">State</span>
          </h1>
          <p className="browse-sub">
            {hasCompleteStateSnapshot
              ? 'Explore all 50 states using one consistent directory snapshot. Compare active inventory, explicitly verified profiles, free accounts and median advertised prices, then open any state to browse its creators and local data.'
              : 'Open any of the 50 state directories to browse matched creator profiles, city connections and transparent location methodology. Comparative analytics appear only after a complete nationwide snapshot is published.'}
          </p>
        </div>
      </div>

      {nationalStats && (
        <DirectorySnapshot
          label="United States"
          stats={toDirectorySnapshotStats(nationalStats)}
          compact
        />
      )}

      {hasCompleteStateSnapshot ? (
        <DirectoryTable
          rows={tableRows}
          title="OnlyFans directory statistics by state"
          description="Every populated metric comes from the latest published snapshot. Not available means the snapshot has no trustworthy value for that state; it never represents an invented zero."
          firstColumnLabel="State"
        />
      ) : (
        <>
          <p className={styles.snapshotNotice} role="status">
            <strong>Nationwide analytics snapshot pending.</strong>{' '}
            We are not filling missing state metrics with zeros or estimates. The complete comparison table
            will appear only when all 50 states share the same successful cutoff; every state directory remains
            available below in the meantime.
          </p>
          <section className={styles.regionDirectory} aria-labelledby="all-state-directory-heading">
            <p className={styles.eyebrow}>All 50 states</p>
            <h2 id="all-state-directory-heading">Choose a state directory</h2>
            <p className={styles.regionIntro}>
              States are grouped by US Census region for faster navigation. Each link opens the state&apos;s
              current creator results, matching terms, connected city directories and data limitations.
            </p>
            <div className={styles.regionGrid}>
              {REGION_GROUPS.map((region) => (
                <section key={region.label} className={styles.regionCard} aria-labelledby={`region-${region.label.toLowerCase()}`}>
                  <h3 id={`region-${region.label.toLowerCase()}`}>{region.label}</h3>
                  <div className={styles.stateLinkGrid}>
                    {region.slugs.map((slug) => {
                      const state = states.find((candidate) => candidate.slug === slug);
                      if (!state) return null;
                      return (
                        <Link key={state.slug} href={`/${state.urlSlug}`} className={styles.stateLink}>
                          <strong aria-hidden="true">{state.abbr}</strong>
                          <span>{state.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </>
      )}

      <Methodology
        methodology={DIRECTORY_METHODOLOGY}
        snapshotAt={publishedSnapshot?.completedAt}
        snapshotId={publishedSnapshot?.snapshotId}
      />

      <section className="browse-footer-cta">
        <h2>Search beyond the state directory</h2>
        <p>
          Looking for a specific city or username? Try the{' '}
          <Link href="/onlyfans-search">creator search</Link>, or browse the{' '}
          <Link href="/categories">category directory</Link> to explore by niche.
        </p>
      </section>
    </div>
  );
}

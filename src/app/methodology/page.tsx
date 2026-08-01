import type { Metadata } from 'next';
import Link from 'next/link';

import JsonLd from '@/components/JsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/seo/directory-json-ld';
import type { JsonLdObject } from '@/lib/seo/json-ld';
import { SITE_URL } from '@/lib/site-url';
import { LOCATION_STATS_METHODOLOGY } from '@/lib/state-stats';

import styles from './methodology.module.css';

const PAGE_URL = `${SITE_URL}/methodology`;
const PAGE_TITLE = 'Directory Data Methodology';
const PAGE_DESCRIPTION =
  'How OnlyAmericanFans calculates location inventory, verified and free-account counts, median prices, freshness metrics and directory snapshots.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${PAGE_TITLE} | OnlyAmericanFans`,
    description: PAGE_DESCRIPTION,
    type: 'website',
    url: PAGE_URL,
  },
  robots: { index: true, follow: true },
};

const metricDefinitions = [
  {
    term: 'Active inventory',
    definition: LOCATION_STATS_METHODOLOGY.activeInventory,
  },
  {
    term: 'Verified profiles',
    definition: `${LOCATION_STATS_METHODOLOGY.verified} The verified share uses active inventory as its denominator.`,
  },
  {
    term: 'Effective advertised price',
    definition: LOCATION_STATS_METHODOLOGY.effectivePrice,
  },
  {
    term: 'Free accounts',
    definition: `${LOCATION_STATS_METHODOLOGY.freeAccounts} The free-account share uses only price-known active inventory as its denominator.`,
  },
  {
    term: 'Median paid price',
    definition: LOCATION_STATS_METHODOLOGY.medianPaidPrice,
  },
  {
    term: 'Known-price coverage',
    definition:
      'Active records with a known, nonnegative effective advertised price divided by active inventory. This exposes how representative price statistics are.',
  },
  {
    term: 'Refreshed in 7 days',
    definition: `${LOCATION_STATS_METHODOLOGY.refreshedRecently} The published seven-day count uses the seven days before the snapshot cutoff.`,
  },
  {
    term: 'New in 30 days',
    definition:
      'Active records first observed by this directory during the 30 days before the snapshot cutoff. This is discovery date, not a claim about when the creator joined a platform.',
  },
  {
    term: 'Checked in 30 days',
    definition: `${LOCATION_STATS_METHODOLOGY.checkedRecently} The published 30-day window is measured from the snapshot cutoff.`,
  },
  {
    term: 'Recently seen',
    definition: `${LOCATION_STATS_METHODOLOGY.recentlySeen} This source signal is reported separately from active inventory.`,
  },
  {
    term: 'Reported content counters',
    definition: LOCATION_STATS_METHODOLOGY.contentCounters,
  },
  {
    term: '30-day inventory change',
    definition: LOCATION_STATS_METHODOLOGY.thirtyDayChange,
  },
] as const;

const denominatorRows = [
  ['Verified share', 'Verified active profiles', 'Active inventory'],
  ['Free-account share', 'Free active profiles', 'Active profiles with a known effective price'],
  ['Known-price coverage', 'Active profiles with a known effective price', 'Active inventory'],
  ['Seven-day refresh coverage', 'Active profiles refreshed in the preceding seven days', 'Active inventory'],
] as const;

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: 'Home', url: SITE_URL },
  { name: PAGE_TITLE, url: PAGE_URL },
]);

const pageJsonLd: JsonLdObject = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  inLanguage: 'en-US',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
  about: {
    '@type': 'Dataset',
    name: 'OnlyAmericanFans directory snapshots',
    description:
      'Aggregated snapshots of public creator-directory records by United States location.',
    spatialCoverage: 'United States',
    creator: { '@id': `${SITE_URL}/#organization` },
  },
};

export default function MethodologyPage() {
  return (
    <div className={styles.page}>
      <JsonLd id="methodology-breadcrumb" data={{
        ...breadcrumbJsonLd,
        '@id': `${PAGE_URL}#breadcrumb`,
      }} />
      <JsonLd id="methodology-webpage" data={pageJsonLd} />

      <header className={styles.hero}>
        <p className={styles.eyebrow}>Transparent directory data</p>
        <h1>How our directory statistics are calculated</h1>
        <p className={styles.lede}>
          This methodology explains the sources, filters, denominators and limitations behind
          the statistics published across our US, state, region and city directory pages. It is
          designed to make every displayed number interpretable rather than simply impressive.
        </p>
        <ul className={styles.principles} aria-label="Methodology principles">
          <li>One cutoff per snapshot</li>
          <li>Published denominators</li>
          <li>Unknown is never zero</li>
          <li>Paid placement adds no statistical weight</li>
          <li>Contract: {LOCATION_STATS_METHODOLOGY.version}</li>
        </ul>
      </header>

      <nav className={styles.contents} aria-label="On this page">
        <strong>On this page</strong>
        <ul>
          <li><a href="#source">Source</a></li>
          <li><a href="#snapshots">Snapshots</a></li>
          <li><a href="#metrics">Metric definitions</a></li>
          <li><a href="#locations">Location matching</a></li>
          <li><a href="#sponsorship">Sponsorship</a></li>
          <li><a href="#limitations">Limitations</a></li>
          <li><a href="#corrections">Corrections</a></li>
        </ul>
      </nav>

      <section id="source" className={styles.section} aria-labelledby="source-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Provenance</p>
          <h2 id="source-heading">Source and scope</h2>
          <p>
            Statistics are calculated from current public creator-directory records in our
            database. Relevant fields include public profile location, performer and account
            status, source-reported verification, advertised subscription prices, and record
            observation timestamps.
          </p>
        </div>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}>
            <h3>What the data describes</h3>
            <p>
              The figures describe qualifying records available to this directory at a fixed
              cutoff. They are inventory statistics, not a census of every creator in a state or
              city and not proof of where a person resides.
            </p>
          </article>
          <article className={styles.policyCard}>
            <h3>Independence</h3>
            <p>
              OnlyAmericanFans is an independent discovery directory. It is not affiliated with,
              endorsed by, or operated by OnlyFans or Fenix International Limited.
            </p>
          </article>
        </div>
      </section>

      <section id="snapshots" className={styles.section} aria-labelledby="snapshots-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Consistent publication</p>
          <h2 id="snapshots-heading">One immutable cutoff, then one complete snapshot</h2>
          <p>
            Every module on a published snapshot uses the same cutoff. This prevents a headline,
            comparison and table on one page from describing different moments in the data.
          </p>
        </div>
        <div className={styles.stepGrid}>
          <article className={styles.step}>
            <strong>Fix the cutoff</strong>
            <p>The calculation records one UTC cutoff before evaluating any location.</p>
          </article>
          <article className={styles.step}>
            <strong>Calculate every scope</strong>
            <p>National, state, region and city aggregates use the same metric definitions.</p>
          </article>
          <article className={styles.step}>
            <strong>Validate completeness</strong>
            <p>The snapshot is not made current while required scope calculations are incomplete.</p>
          </article>
          <article className={styles.step}>
            <strong>Publish atomically</strong>
            <p>A successful snapshot replaces the prior one as a unit; a failed run leaves the last successful snapshot current.</p>
          </article>
        </div>
        <p className={styles.note}>
          <strong>Reading the timestamp:</strong> “Snapshot completed” is the time the complete
          aggregate became available. Seven- and 30-day windows are measured from the fixed
          cutoff, while an individual profile&apos;s underlying record may have been refreshed earlier.
          If statistics are unavailable, we show that state explicitly rather than converting it
          to zero or substituting unrelated location data.
        </p>
      </section>

      <section id="metrics" className={styles.section} aria-labelledby="metrics-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Metric contract</p>
          <h2 id="metrics-heading">Definitions used on directory pages</h2>
          <p>
            Counts and percentages answer different questions. Where a percentage is shown, its
            denominator is stated beside it or defined below.
          </p>
        </div>
        <dl className={styles.definitionGrid}>
          {metricDefinitions.map((metric) => (
            <div key={metric.term} className={styles.definition}>
              <dt>{metric.term}</dt>
              <dd>{metric.definition}</dd>
            </div>
          ))}
        </dl>

        <h3>Percentage denominators</h3>
        <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Percentage denominator definitions">
          <table className={styles.table}>
            <caption>Numerators and denominators used for published directory percentages</caption>
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col">Numerator</th>
                <th scope="col">Denominator</th>
              </tr>
            </thead>
            <tbody>
              {denominatorRows.map(([metric, numerator, denominator]) => (
                <tr key={metric}>
                  <th scope="row">{metric}</th>
                  <td>{numerator}</td>
                  <td>{denominator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="locations" className={styles.section} aria-labelledby="locations-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Geographic classification</p>
          <h2 id="locations-heading">How location matching and confidence work</h2>
          <p>
            The current location model matches curated, case-insensitive terms against the
            nonblank location stated on a public profile. A state or city match is a directory
            classification—it is not GPS evidence, an IP lookup, identity verification or proof
            of residence.
          </p>
        </div>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}>
            <h3>Confidence in the current version</h3>
            <p>
              We do not publish a numeric location-confidence score that the underlying record
              cannot support. Ambiguous abbreviations, names shared by multiple places, outdated
              profile text and creator travel can affect classification. Missing locations are
              excluded from geographic inventory.
            </p>
          </article>
          <article className={styles.policyCard}>
            <h3>National and local totals</h3>
            <p>
              The US total deduplicates active profiles matching at least one configured state
              term. A profile can match more than one local scope, so state or city figures should
              not be added together to recreate the national total.
            </p>
          </article>
        </div>
      </section>

      <section id="sponsorship" className={styles.section} aria-labelledby="sponsorship-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Editorial independence</p>
          <h2 id="sponsorship-heading">How sponsored creators are handled</h2>
          <p>
            Paid placement signals are excluded from metric calculations and editorial rankings.
            Sponsorship cannot make a profile active or verified, alter its price, increase its
            statistical weight, or duplicate it in an aggregate.
          </p>
          <p>
            A sponsored creator may still count once when the underlying public directory record
            independently meets the same eligibility rules as every other profile. Paid cards are
            separately labeled as advertisements on the page.
          </p>
        </div>
      </section>

      <section id="limitations" className={styles.section} aria-labelledby="limitations-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Read with care</p>
          <h2 id="limitations-heading">Important limitations</h2>
        </div>
        <ul className={styles.list}>
          <li>Directory coverage is not a census and may omit creators with missing, private, ambiguous or newly changed public information.</li>
          <li>A source-reported verified flag is not an endorsement or independent identity verification by OnlyAmericanFans.</li>
          <li>Advertised subscription price does not include taxes, tips, messages, pay-per-view content, bundles or purchases made after the cutoff.</li>
          <li>Profile status, price and location can change after a snapshot is completed.</li>
          <li>Historical discovery dates show when this directory first observed a record, not necessarily when the creator opened an account.</li>
          <li>We do not infer gender, race, ethnicity, sexuality or other sensitive traits from names, images or biographies for these statistics.</li>
        </ul>
      </section>

      <section id="corrections" className={styles.section} aria-labelledby="corrections-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Accountability</p>
          <h2 id="corrections-heading">Corrections and removals</h2>
          <p>
            If a listing, location classification or displayed field appears incorrect, send the
            creator username, the field in question and a link or description showing the current
            public information through our <Link href="/contact" className={styles.inlineLink}>contact page</Link>.
            We review corrections against the public record and apply accepted changes to the
            directory; aggregate changes appear after a subsequent successful snapshot.
          </p>
          <p>
            Creators and rights holders can use our dedicated <Link href="/dmca" className={styles.inlineLink}>DMCA and removal page</Link> for
            removal requests. Methodology questions are welcome through the same contact channel.
          </p>
        </div>
      </section>

      <aside className={styles.cta} aria-labelledby="explore-data-heading">
        <h2 id="explore-data-heading">Explore the published directory data</h2>
        <p>
          Use the <Link href="/browse-by-state" className={styles.inlineLink}>Browse by State directory</Link> to compare
          location pages that have a completed snapshot. Metric cells remain unavailable until the
          corresponding data has been successfully published.
        </p>
      </aside>
    </div>
  );
}

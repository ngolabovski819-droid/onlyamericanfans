import Link from 'next/link';
import styles from './state-directory.module.css';

interface LocationDirectoryOverviewProps {
  label: string;
  kind: 'state' | 'city' | 'region';
  terms: string[];
  parentState?: { label: string; href: string } | null;
  configuredCityCount?: number;
}

export function LocationDirectoryOverview({
  label,
  kind,
  terms,
  parentState,
  configuredCityCount = 0,
}: LocationDirectoryOverviewProps) {
  const kindLabel = kind === 'state' ? 'state' : kind === 'city' ? 'city' : 'regional';

  return (
    <section className={styles.overview} aria-labelledby="location-directory-overview-heading">
      <div>
        <p className={styles.eyebrow}>About this directory</p>
        <h2 id="location-directory-overview-heading">How the {label} creator directory is built</h2>
        <p>
          This {kindLabel} page matches public creator records whose source location text contains one
          of the directory&apos;s configured geographic terms. It is a discovery classification, not proof
          of residence, identity or current physical location.
        </p>
        {parentState && (
          <p>
            {label} is grouped under the <Link href={parentState.href}>{parentState.label} directory</Link>,
            making it easy to move between city-level and statewide results.
          </p>
        )}
        {kind === 'state' && configuredCityCount > 0 && (
          <p>
            This state hub also connects {configuredCityCount} configured city director{configuredCityCount === 1 ? 'y' : 'ies'}.
            Their links appear below even when an aggregate city snapshot is not yet available.
          </p>
        )}
      </div>
      <aside className={styles.matchingTerms} aria-label={`${label} matching terms`}>
        <h3>Public-text signals used</h3>
        <div className={styles.termList}>
          {terms.map((term) => <span key={term}>{term}</span>)}
        </div>
        <p>
          A profile only needs one configured signal to match. See the{' '}
          <Link href="/methodology">full methodology and limitations</Link>.
        </p>
      </aside>
    </section>
  );
}

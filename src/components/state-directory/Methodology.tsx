import type { DirectoryMethodologyCopy } from './types';
import { formatSnapshotDate } from './format';
import styles from './state-directory.module.css';

interface MethodologyProps {
  methodology: DirectoryMethodologyCopy;
  snapshotAt?: string | null;
  snapshotId?: string | number | null;
  headingId?: string;
}

export function Methodology({
  methodology,
  snapshotAt,
  snapshotId,
  headingId = 'directory-methodology-heading',
}: MethodologyProps) {
  return (
    <section className={styles.methodology} aria-labelledby={headingId}>
      <div className={styles.methodologyIntro}>
        <p className={styles.eyebrow}>Transparent methodology</p>
        <h2 id={headingId}>How these directory statistics are calculated</h2>
        <p>{methodology.source}</p>
        {(snapshotAt || snapshotId) && (
          <p className={styles.snapshotIdentity}>
            {snapshotAt && (
              <>
                Snapshot completed{' '}
                <time dateTime={snapshotAt}>{formatSnapshotDate(snapshotAt, true)} UTC</time>
              </>
            )}
            {snapshotAt && snapshotId ? ' · ' : ''}
            {snapshotId && <>Snapshot ID: <code>{snapshotId}</code></>}
          </p>
        )}
        {!snapshotAt && !snapshotId && (
          <p className={styles.snapshotIdentity}>
            No aggregate snapshot is displayed on this page yet. Any live-page sample above is calculated
            separately from the visible non-sponsored results and is explicitly labeled as a sample.
          </p>
        )}
      </div>

      <dl className={styles.definitionGrid}>
        <div><dt>Active inventory</dt><dd>{methodology.active}</dd></div>
        <div><dt>Verified</dt><dd>{methodology.verified}</dd></div>
        <div><dt>Free accounts</dt><dd>{methodology.freeAccounts}</dd></div>
        <div><dt>Median paid price</dt><dd>{methodology.medianPrice}</dd></div>
        <div><dt>Freshness</dt><dd>{methodology.freshness}</dd></div>
        <div><dt>Reported content counters</dt><dd>{methodology.contentCounters}</dd></div>
      </dl>

      {methodology.limitations.length > 0 && (
        <div className={styles.limitations}>
          <h3>Important limitations</h3>
          <ul>
            {methodology.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

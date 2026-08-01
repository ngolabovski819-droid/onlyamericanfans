import type { Creator } from '@/types/creator';
import styles from './state-directory.module.css';

interface DirectorySampleSnapshotProps {
  label: string;
  creators: Creator[];
  estimatedInventory: number;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = values.toSorted((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function DirectorySampleSnapshot({
  label,
  creators,
  estimatedInventory,
}: DirectorySampleSnapshotProps) {
  // Paid pins are intentionally excluded: they are not evidence that a profile matched this location query.
  const sample = creators.filter((creator) => !creator.sponsored);
  const priced = sample.filter((creator) => creator.subscribePrice != null);
  const free = priced.filter((creator) => creator.subscribePrice === 0);
  const paidPrices = priced
    .map((creator) => creator.subscribePrice)
    .filter((price): price is number => price != null && price > 0);
  const verified = sample.filter((creator) => creator.isVerified);
  const knownPosts = sample
    .map((creator) => creator.postsCount)
    .filter((count): count is number => count != null && count >= 0);
  const knownMedia = sample
    .map((creator) => {
      if (creator.photosCount == null && creator.videosCount == null) return null;
      return (creator.photosCount ?? 0) + (creator.videosCount ?? 0);
    })
    .filter((count): count is number => count != null);
  const medianPaidPrice = median(paidPrices);
  const sampleLabel = `${sample.length} non-sponsored profile${sample.length === 1 ? '' : 's'} visible on this page`;

  return (
    <section className={`${styles.snapshot} ${styles.sampleSnapshot}`} aria-labelledby="directory-sample-heading">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Live page reading</p>
          <h2 id="directory-sample-heading">What the current {label} results show</h2>
        </div>
        <p className={styles.updated}>
          Aggregate snapshot pending; sample values use {sampleLabel}. Result cache window: up to one hour.
        </p>
      </div>

      <dl className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <dt>Matched inventory estimate</dt>
          <dd>About {estimatedInventory.toLocaleString('en-US')}</dd>
          <p>Database planner estimate for this location query, not an exact published count</p>
        </div>
        <div className={styles.kpiCard}>
          <dt>Verified in visible sample</dt>
          <dd>{verified.length} of {sample.length}</dd>
          <p>Source-reported verification among {sampleLabel}</p>
        </div>
        <div className={styles.kpiCard}>
          <dt>Known $0 accounts</dt>
          <dd>{free.length} of {priced.length}</dd>
          <p>Only profiles with a known advertised price are included</p>
        </div>
        <div className={styles.kpiCard}>
          <dt>Median paid price</dt>
          <dd>{medianPaidPrice == null ? 'Not available' : `$${medianPaidPrice.toFixed(2)}`}</dd>
          <p>Visible paid profiles only; $0 and unknown prices are excluded</p>
        </div>
        {knownPosts.length > 0 && (
          <div className={styles.kpiCard}>
            <dt>Reported posts in sample</dt>
            <dd>{knownPosts.reduce((sum, count) => sum + count, 0).toLocaleString('en-US')}</dd>
            <p>Summed source post counters across {knownPosts.length} visible profiles with known data</p>
          </div>
        )}
        {knownMedia.length > 0 && (
          <div className={styles.kpiCard}>
            <dt>Reported media in sample</dt>
            <dd>{knownMedia.reduce((sum, count) => sum + count, 0).toLocaleString('en-US')}</dd>
            <p>Known photo and video counters across {knownMedia.length} visible profiles</p>
          </div>
        )}
      </dl>
      <p className={styles.sampleCaveat}>
        These are transparent page-sample observations, not statewide totals. They are replaced by the
        full-scope snapshot after a complete aggregate refresh succeeds.
      </p>
    </section>
  );
}

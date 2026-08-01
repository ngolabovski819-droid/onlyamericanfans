import type { DirectorySnapshotStats } from './types';
import { formatCount, formatPrice, formatShare, formatSnapshotDate, hasMetric } from './format';
import styles from './state-directory.module.css';

interface DirectorySnapshotProps {
  label: string;
  stats: DirectorySnapshotStats;
  headingLevel?: 'h2' | 'h3';
  compact?: boolean;
}

interface MetricCard {
  label: string;
  value: string;
  note: string;
}

export function DirectorySnapshot({
  label,
  stats,
  headingLevel = 'h2',
  compact = false,
}: DirectorySnapshotProps) {
  const Heading = headingLevel;
  const verifiedShare = formatShare(stats.verifiedCount, stats.activeInventory);
  const freeShare = formatShare(stats.freeAccountCount, stats.priceKnownCount);
  const metrics: MetricCard[] = [];

  if (hasMetric(stats.activeInventory)) {
    metrics.push({
      label: 'Active inventory',
      value: formatCount(stats.activeInventory),
      note: 'Profiles meeting the published active-record definition',
    });
  }
  if (hasMetric(stats.verifiedCount)) {
    metrics.push({
      label: 'Verified profiles',
      value: formatCount(stats.verifiedCount),
      note: verifiedShare ? `${verifiedShare} of active inventory` : 'Among active inventory',
    });
  }
  if (hasMetric(stats.freeAccountCount)) {
    metrics.push({
      label: 'Free accounts',
      value: formatCount(stats.freeAccountCount),
      note: freeShare
        ? `${freeShare} of ${formatCount(stats.priceKnownCount)} profiles with known prices`
        : 'Profiles with a known current price of $0',
    });
  }
  if (hasMetric(stats.medianPaidPrice)) {
    metrics.push({
      label: 'Median paid price',
      value: formatPrice(stats.medianPaidPrice),
      note: hasMetric(stats.priceKnownCount)
        ? `${formatCount(stats.priceKnownCount)} profiles have known effective prices; free accounts are excluded from the median`
        : 'Free and unknown prices excluded',
    });
  }
  if (hasMetric(stats.newlyDiscovered30Days)) {
    metrics.push({
      label: 'New in 30 days',
      value: formatCount(stats.newlyDiscovered30Days),
      note: 'First observed in the directory during the last 30 days',
    });
  }
  if (hasMetric(stats.successfulCheckedIn7Days)) {
    metrics.push({
      label: 'Confirmed in 7 days',
      value: formatCount(stats.successfulCheckedIn7Days),
      note: formatShare(stats.successfulCheckedIn7Days, stats.activeInventory)
        ? `${formatShare(stats.successfulCheckedIn7Days, stats.activeInventory)} of active inventory received a successful source check`
        : 'Profiles receiving a successful source check during the last 7 days',
    });
  }

  if (metrics.length === 0) return null;

  return (
    <section className={`${styles.snapshot} ${compact ? styles.snapshotCompact : ''}`} aria-labelledby="directory-snapshot-heading">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Directory Pulse</p>
          <Heading id="directory-snapshot-heading">{label} directory snapshot</Heading>
        </div>
        {stats.snapshotAt && (
          <p className={styles.updated}>
            Snapshot completed{' '}
            <time dateTime={stats.snapshotAt}>{formatSnapshotDate(stats.snapshotAt, true)} UTC</time>
          </p>
        )}
      </div>

      <dl className={styles.kpiGrid}>
        {metrics.map((metric) => (
          <div key={metric.label} className={styles.kpiCard}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
            <p>{metric.note}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}

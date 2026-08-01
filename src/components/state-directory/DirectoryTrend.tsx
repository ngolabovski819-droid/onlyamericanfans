import type { LocationStatsHistoryPoint } from '@/types/location-stats';
import { formatCount, formatPrice } from './format';
import styles from './state-directory.module.css';

interface DirectoryTrendProps {
  label: string;
  history: readonly LocationStatsHistoryPoint[];
}

const DAY_MS = 86_400_000;

function findComparison(
  points: readonly LocationStatsHistoryPoint[],
  current: LocationStatsHistoryPoint,
  days: number,
) {
  const threshold = new Date(current.cutoffAt).getTime() - days * DAY_MS;
  return points.find((point) => new Date(point.cutoffAt).getTime() <= threshold) ?? null;
}

function formatChange(current: number, previous: number | null): string {
  if (previous == null) return 'Building history';
  const delta = current - previous;
  const sign = delta > 0 ? '+' : '';
  if (previous === 0) return `${sign}${formatCount(delta)}`;
  return `${sign}${formatCount(delta)} (${sign}${((delta / previous) * 100).toFixed(1)}%)`;
}

function Sparkline({ points }: { points: readonly LocationStatsHistoryPoint[] }) {
  const ordered = points.toReversed();
  if (ordered.length < 2) return null;
  const values = ordered.map((point) => point.activeCount);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const coordinates = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 31 - ((value - min) / span) * 27;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  return (
    <svg className={styles.sparkline} viewBox="0 0 100 34" preserveAspectRatio="none" role="img" aria-label={`Active inventory ranged from ${formatCount(min)} to ${formatCount(max)} across ${values.length} snapshots`}>
      <polyline points={coordinates} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function DirectoryTrend({ label, history }: DirectoryTrendProps) {
  const current = history[0];
  if (!current) return null;
  const windows = [7, 30, 90].map((days) => ({
    days,
    previous: findComparison(history, current, days),
  }));
  const changed = history.filter((point, index) => (
    index === history.length - 1 || point.activeCount !== history[index + 1]?.activeCount
  )).slice(0, 5);

  return (
    <section className={styles.trendSection} aria-labelledby="directory-trend-heading">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Measured change</p>
          <h2 id="directory-trend-heading">{label} directory trend</h2>
          <p className={styles.sectionDescription}>
            Comparisons use the newest complete snapshot at or before each window boundary. Missing history stays unavailable rather than becoming zero.
          </p>
        </div>
      </div>
      <div className={styles.trendLayout}>
        <div>
          <div className={styles.trendCards}>
            {windows.map(({ days, previous }) => (
              <div key={days} className={styles.qualityCard}>
                <dt>{days}-day inventory change</dt>
                <dd>{formatChange(current.activeCount, previous?.activeCount ?? null)}</dd>
                <p>{previous ? `Compared with snapshot ${previous.snapshotId}` : `Available after ${days} days of snapshots`}</p>
              </div>
            ))}
          </div>
          <Sparkline points={history} />
        </div>
        <div className={styles.changeLog}>
          <h3>Recent inventory changes</h3>
          <ol>
            {changed.map((point) => (
              <li key={point.snapshotId}>
                <time dateTime={point.cutoffAt}>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(point.cutoffAt))}</time>
                <strong>{formatCount(point.activeCount)} active</strong>
                <span>{formatPrice(point.medianPaidPrice)} median paid price</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

import type { LocationStats } from '@/types/location-stats';
import { formatCount, formatShare, hasMetric } from './format';
import styles from './state-directory.module.css';

interface DirectoryDataQualityProps {
  label: string;
  stats: LocationStats;
}

export function DirectoryDataQuality({ label, stats }: DirectoryDataQualityProps) {
  const metrics = [
    {
      label: 'Core-field completeness',
      value: formatShare(stats.completeProfileCount, stats.activeCount) ?? 'Not available',
      note: `${formatCount(stats.completeProfileCount)} profiles have a known price, content counter and successful 7-day check`,
    },
    {
      label: 'Known-price coverage',
      value: formatShare(stats.priceKnownCount, stats.activeCount) ?? 'Not available',
      note: `${formatCount(stats.priceKnownCount)} of ${formatCount(stats.activeCount)} active profiles`,
    },
    {
      label: 'Confirmed in 7 days',
      value: formatShare(stats.successfulChecked7dCount, stats.activeCount) ?? 'Not available',
      note: `${formatCount(stats.successfulChecked7dCount)} successful source checks`,
    },
    {
      label: 'Content-counter coverage',
      value: formatShare(stats.contentKnownCount, stats.activeCount) ?? 'Not available',
      note: `${formatCount(stats.contentKnownCount)} profiles with at least one known counter`,
    },
    {
      label: 'Promotion prevalence',
      value: formatShare(stats.promotedCount, stats.activeCount) ?? 'Not available',
      note: `${formatCount(stats.promotedCount)} profiles with a source-reported promotion`,
    },
    {
      label: 'Discount prevalence',
      value: formatShare(stats.discountedCount, stats.activeCount) ?? 'Not available',
      note: `${formatCount(stats.discountedCount)} profiles with a promotion or bundle discount`,
    },
  ];

  if (hasMetric(stats.inventoryRank)) {
    metrics.unshift({
      label: 'State inventory rank',
      value: `#${formatCount(stats.inventoryRank)}`,
      note: hasMetric(stats.inventoryPercentile)
        ? `${Math.round(stats.inventoryPercentile * 100)}th percentile among all 50 states`
        : 'Ranked among all 50 states in the same snapshot',
    });
  }

  return (
    <section className={styles.dataQuality} aria-labelledby="directory-data-quality-heading">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Coverage and confidence</p>
          <h2 id="directory-data-quality-heading">How complete the {label} data is</h2>
          <p className={styles.sectionDescription}>
            Coverage uses the same active-inventory denominator and immutable snapshot as every other metric on this page.
          </p>
        </div>
      </div>
      <dl className={styles.qualityGrid}>
        {metrics.map((metric) => (
          <div key={metric.label} className={styles.qualityCard}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
            <p>{metric.note}</p>
          </div>
        ))}
      </dl>
      {(hasMetric(stats.medianPosts) || hasMetric(stats.medianPhotos) || hasMetric(stats.medianVideos)) && (
        <p className={styles.contentMedianLine}>
          Median reported counters among profiles with known values:{' '}
          {hasMetric(stats.medianPosts) ? `${formatCount(stats.medianPosts)} posts` : 'posts unavailable'} ·{' '}
          {hasMetric(stats.medianPhotos) ? `${formatCount(stats.medianPhotos)} photos` : 'photos unavailable'} ·{' '}
          {hasMetric(stats.medianVideos) ? `${formatCount(stats.medianVideos)} videos` : 'videos unavailable'}.
        </p>
      )}
    </section>
  );
}

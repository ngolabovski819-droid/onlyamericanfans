import type { LocationStats } from '@/types/location-stats';
import { formatCount, formatShare } from './format';
import styles from './state-directory.module.css';

interface DirectoryPriceDistributionProps {
  label: string;
  stats: LocationStats;
}

export function DirectoryPriceDistribution({ label, stats }: DirectoryPriceDistributionProps) {
  if (stats.priceKnownCount <= 0) return null;

  const rows = [
    { label: 'Free', range: '$0', count: stats.freeCount },
    { label: 'Entry paid', range: '$0.01–$4.99', count: stats.paidUnder5Count },
    { label: 'Lower-mid paid', range: '$5.00–$9.99', count: stats.paid5To10Count },
    { label: 'Upper-mid paid', range: '$10.00–$19.99', count: stats.paid10To20Count },
    { label: 'Premium paid', range: '$20.00+', count: stats.paid20PlusCount },
  ];

  return (
    <section className={styles.tableSection} aria-labelledby="directory-price-distribution-heading">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Advertised pricing</p>
          <h2 id="directory-price-distribution-heading">{label} price distribution</h2>
          <p className={styles.sectionDescription}>
            Exact counts from {formatCount(stats.priceKnownCount)} active profiles with known prices in
            snapshot {stats.snapshotId}. Unknown prices are excluded from every band.
          </p>
        </div>
      </div>
      <div className={styles.tableScroller} tabIndex={0} role="region" aria-labelledby="directory-price-distribution-heading">
        <table className={`${styles.table} ${styles.compactDataTable}`}>
          <thead>
            <tr><th scope="col">Band</th><th scope="col">Price</th><th scope="col">Profiles</th><th scope="col">Share of known prices</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.range}</td>
                <td><span className={styles.tableValue}>{formatCount(row.count)}</span></td>
                <td>{formatShare(row.count, stats.priceKnownCount) ?? 'Not available'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

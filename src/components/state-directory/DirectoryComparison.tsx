import type { DirectorySnapshotStats } from './types';
import { formatCount, formatPrice, formatShare, hasMetric } from './format';
import styles from './state-directory.module.css';

interface DirectoryComparisonProps {
  label: string;
  local: DirectorySnapshotStats;
  national: DirectorySnapshotStats;
}

interface ComparisonRow {
  label: string;
  local: string;
  national: string;
  note: string;
}

export function DirectoryComparison({ label, local, national }: DirectoryComparisonProps) {
  const rows: ComparisonRow[] = [];
  const localVerified = formatShare(local.verifiedCount, local.activeInventory);
  const nationalVerified = formatShare(national.verifiedCount, national.activeInventory);
  const localFree = formatShare(local.freeAccountCount, local.priceKnownCount);
  const nationalFree = formatShare(national.freeAccountCount, national.priceKnownCount);
  const localPriceCoverage = formatShare(local.priceKnownCount, local.activeInventory);
  const nationalPriceCoverage = formatShare(national.priceKnownCount, national.activeInventory);

  if (localVerified && nationalVerified) {
    rows.push({ label: 'Verified share', local: localVerified, national: nationalVerified, note: 'Share of active inventory' });
  }
  if (localFree && nationalFree) {
    rows.push({ label: 'Free-account share', local: localFree, national: nationalFree, note: 'Share of profiles with known prices' });
  }
  if (hasMetric(local.medianPaidPrice) && hasMetric(national.medianPaidPrice)) {
    rows.push({
      label: 'Median paid price',
      local: formatPrice(local.medianPaidPrice),
      national: formatPrice(national.medianPaidPrice),
      note: 'Free and unknown prices excluded',
    });
  }
  if (localPriceCoverage && nationalPriceCoverage) {
    rows.push({ label: 'Known-price coverage', local: localPriceCoverage, national: nationalPriceCoverage, note: 'Share of active inventory' });
  }
  if (hasMetric(local.newlyDiscovered30Days) && hasMetric(national.newlyDiscovered30Days)) {
    rows.push({
      label: 'New in 30 days',
      local: formatCount(local.newlyDiscovered30Days),
      national: formatCount(national.newlyDiscovered30Days),
      note: 'First observed during the last 30 days',
    });
  }

  if (rows.length === 0) return null;

  const headingId = 'directory-comparison-heading';
  return (
    <section className={styles.comparison} aria-labelledby={headingId}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>National benchmark</p>
          <h2 id={headingId}>{label} compared with the US directory</h2>
          <p className={styles.sectionDescription}>
            Both columns use the same snapshot definitions and denominators.
          </p>
        </div>
      </div>
      <div className={styles.tableScroller} tabIndex={0} role="region" aria-labelledby={headingId}>
        <table className={`${styles.table} ${styles.comparisonTable}`}>
          <caption className={styles.srOnly}>{label} directory metrics compared with national metrics</caption>
          <thead>
            <tr><th scope="col">Metric</th><th scope="col">{label}</th><th scope="col">United States</th><th scope="col">Definition</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td><span className={styles.tableValue}>{row.local}</span></td>
                <td><span className={styles.tableValue}>{row.national}</span></td>
                <td>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

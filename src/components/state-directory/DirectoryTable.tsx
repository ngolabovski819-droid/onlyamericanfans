import Link from 'next/link';
import type { DirectoryLocationRow } from './types';
import { formatCount, formatPrice, formatShare, formatSnapshotDate, hasMetric } from './format';
import styles from './state-directory.module.css';

interface DirectoryTableProps {
  rows: DirectoryLocationRow[];
  title: string;
  description: string;
  firstColumnLabel: string;
  id?: string;
}

function Unavailable() {
  return <span className={styles.unavailable}>Not available</span>;
}

function CountCell({ value, share }: { value?: number | null; share?: string | null }) {
  if (!hasMetric(value)) return <Unavailable />;
  return (
    <>
      <span className={styles.tableValue}>{formatCount(value)}</span>
      {share && <span className={styles.tableSubvalue}>{share}</span>}
    </>
  );
}

export function DirectoryTable({
  rows,
  title,
  description,
  firstColumnLabel,
  id = 'directory-table-heading',
}: DirectoryTableProps) {
  if (rows.length === 0) return null;

  return (
    <section className={styles.tableSection} aria-labelledby={id}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Explore the data</p>
          <h2 id={id}>{title}</h2>
          <p className={styles.sectionDescription}>{description}</p>
        </div>
      </div>

      <div className={styles.tableScroller} tabIndex={0} role="region" aria-labelledby={id}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>{description}</caption>
          <thead>
            <tr>
              <th scope="col">{firstColumnLabel}</th>
              <th scope="col">Active inventory</th>
              <th scope="col">Verified</th>
              <th scope="col">Free</th>
              <th scope="col">Median paid price</th>
              <th scope="col">Snapshot</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const verifiedShare = formatShare(row.verifiedCount, row.activeInventory);
              const freeShare = formatShare(row.freeAccountCount, row.priceKnownCount);
              return (
                <tr key={row.href}>
                  <th scope="row">
                    <Link href={row.href} className={styles.locationLink}>
                      {row.abbr && <span className={styles.abbr}>{row.abbr}</span>}
                      <span>
                        <strong>{row.label}</strong>
                        {row.region && <small>{row.region}</small>}
                      </span>
                    </Link>
                  </th>
                  <td><CountCell value={row.activeInventory} /></td>
                  <td><CountCell value={row.verifiedCount} share={verifiedShare} /></td>
                  <td><CountCell value={row.freeAccountCount} share={freeShare} /></td>
                  <td>
                    {hasMetric(row.medianPaidPrice)
                      ? <span className={styles.tableValue}>{formatPrice(row.medianPaidPrice)}</span>
                      : <Unavailable />}
                  </td>
                  <td>
                    {row.snapshotAt
                      ? <time dateTime={row.snapshotAt}>{formatSnapshotDate(row.snapshotAt)}</time>
                      : <Unavailable />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

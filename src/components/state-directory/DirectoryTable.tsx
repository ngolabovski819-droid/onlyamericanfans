'use client';

import { useMemo, useState } from 'react';
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
  sortable?: boolean;
}

type SortKey = 'directory' | 'inventory' | 'verified' | 'free' | 'price' | 'change' | 'freshness';

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

function ChangeCell({ count, percent }: { count?: number | null; percent?: number | null }) {
  if (count == null || !Number.isFinite(count)) return <Unavailable />;
  const sign = count > 0 ? '+' : '';
  const percentLabel = percent != null && Number.isFinite(percent)
    ? `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`
    : null;
  return (
    <>
      <span className={styles.tableValue}>{sign}{Math.round(count).toLocaleString('en-US')}</span>
      {percentLabel && <span className={styles.tableSubvalue}>{percentLabel} over 30 days</span>}
    </>
  );
}

export function DirectoryTable({
  rows,
  title,
  description,
  firstColumnLabel,
  id = 'directory-table-heading',
  sortable = false,
}: DirectoryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('directory');
  const sortedRows = useMemo(() => {
    if (!sortable || sortKey === 'directory') return rows;
    const valueFor = (row: DirectoryLocationRow): number | null => {
      if (sortKey === 'inventory') return row.activeInventory ?? null;
      if (sortKey === 'verified') return row.verifiedCount ?? null;
      if (sortKey === 'free') return row.freeAccountCount ?? null;
      if (sortKey === 'price') return row.medianPaidPrice ?? null;
      if (sortKey === 'change') return row.change30dPercent ?? null;
      return row.activeInventory && row.successfulCheckedIn7Days != null
        ? row.successfulCheckedIn7Days / row.activeInventory
        : null;
    };
    return rows.toSorted((left, right) => {
      const leftValue = valueFor(left);
      const rightValue = valueFor(right);
      if (leftValue == null && rightValue == null) return left.label.localeCompare(right.label);
      if (leftValue == null) return 1;
      if (rightValue == null) return -1;
      return rightValue - leftValue || left.label.localeCompare(right.label);
    });
  }, [rows, sortKey, sortable]);

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

      {sortable && (
        <label className={styles.sortControl}>
          Sort states by
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            <option value="directory">Directory order</option>
            <option value="inventory">Active inventory</option>
            <option value="verified">Verified profiles</option>
            <option value="free">Free accounts</option>
            <option value="price">Median paid price</option>
            <option value="change">30-day growth</option>
            <option value="freshness">7-day confirmation coverage</option>
          </select>
        </label>
      )}

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
              <th scope="col">30-day change</th>
              <th scope="col">Confirmed in 7 days</th>
              <th scope="col">Snapshot</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
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
                  <td><ChangeCell count={row.change30dCount} percent={row.change30dPercent} /></td>
                  <td>
                    <CountCell
                      value={row.successfulCheckedIn7Days}
                      share={formatShare(row.successfulCheckedIn7Days, row.activeInventory)}
                    />
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

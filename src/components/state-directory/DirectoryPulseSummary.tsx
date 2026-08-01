import type { LocationStats } from '@/types/location-stats';
import { formatCount, formatPrice, formatSnapshotDate } from './format';
import styles from './state-directory.module.css';

export interface DirectoryPulseSummaryProps {
  stats: LocationStats;
  nationalStats?: LocationStats | null;
  leadingCity?: LocationStats | null;
  headingLevel?: 'h2' | 'h3';
  headingId?: string;
}

const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  style: 'percent',
});

const percentagePointFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

function isNonNegativeFinite(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function validShare(numerator: number, denominator: number): number | null {
  if (
    !isNonNegativeFinite(numerator) ||
    !isNonNegativeFinite(denominator) ||
    denominator === 0 ||
    numerator > denominator
  ) {
    return null;
  }

  return numerator / denominator;
}

function sameSnapshot(primary: LocationStats, candidate: LocationStats): boolean {
  return (
    primary.snapshotId === candidate.snapshotId &&
    primary.cutoffAt === candidate.cutoffAt &&
    primary.completedAt === candidate.completedAt &&
    primary.methodologyVersion === candidate.methodologyVersion
  );
}

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return Math.round(count) === 1 ? singular : plural;
}

function formatShare(value: number): string {
  return percentFormatter.format(value);
}

function buildShareSentence(stats: LocationStats, national: LocationStats | null): string | null {
  const clauses: string[] = [];
  const verifiedShare = validShare(stats.verifiedCount, stats.activeCount);

  if (verifiedShare !== null) {
    const nationalVerifiedShare = national
      ? validShare(national.verifiedCount, national.activeCount)
      : null;
    const comparison = nationalVerifiedShare === null
      ? ''
      : `, compared with ${formatShare(nationalVerifiedShare)} across the US directory`;

    clauses.push(
      `${formatCount(stats.verifiedCount)} of ${formatCount(stats.activeCount)} active profiles are marked verified (${formatShare(verifiedShare)}${comparison})`,
    );
  }

  const freeShare = validShare(stats.freeCount, stats.priceKnownCount);
  if (freeShare !== null) {
    const nationalFreeShare = national
      ? validShare(national.freeCount, national.priceKnownCount)
      : null;
    const comparison = nationalFreeShare === null
      ? ''
      : `, compared with ${formatShare(nationalFreeShare)} nationally`;

    clauses.push(
      `${formatCount(stats.freeCount)} of ${formatCount(stats.priceKnownCount)} profiles with known advertised prices are free accounts (${formatShare(freeShare)}${comparison})`,
    );
  }

  if (clauses.length === 0) return null;
  if (clauses.length === 1) return `${clauses[0]}.`;
  return `${clauses[0]}; ${clauses[1]}.`;
}

function buildPriceSentence(stats: LocationStats, national: LocationStats | null): string | null {
  if (
    !isNonNegativeFinite(stats.medianPaidPrice) ||
    !isNonNegativeFinite(stats.paidCount) ||
    stats.paidCount === 0
  ) {
    return null;
  }

  const hasValidRange =
    isNonNegativeFinite(stats.paidPriceP25) &&
    isNonNegativeFinite(stats.paidPriceP75) &&
    stats.paidPriceP25 <= stats.medianPaidPrice &&
    stats.medianPaidPrice <= stats.paidPriceP75;
  const range = hasValidRange
    ? `, and the middle half of paid prices runs from ${formatPrice(stats.paidPriceP25)} to ${formatPrice(stats.paidPriceP75)}`
    : '';
  const nationalComparison =
    national &&
    isNonNegativeFinite(national.paidCount) &&
    national.paidCount > 0 &&
    isNonNegativeFinite(national.medianPaidPrice)
      ? `; the US median in the same snapshot is ${formatPrice(national.medianPaidPrice)}`
      : '';

  return `Among ${formatCount(stats.paidCount)} paid profiles, the median advertised subscription price is ${formatPrice(stats.medianPaidPrice)}${range}${nationalComparison}.`;
}

function buildChangeAndDiscoverySentence(stats: LocationStats): string | null {
  const clauses: string[] = [];

  if (isFiniteNumber(stats.change30dCount) && stats.previousCutoffAt) {
    if (stats.change30dCount === 0) {
      clauses.push('active inventory was unchanged over the 30-day comparison period');
    } else {
      const direction = stats.change30dCount > 0 ? 'increased' : 'decreased';
      const count = Math.abs(stats.change30dCount);
      const changePercent = stats.change30dPercent;
      let percentage = '';
      if (
        isFiniteNumber(changePercent) &&
        Math.sign(changePercent) === Math.sign(stats.change30dCount)
      ) {
        percentage = ` (${percentagePointFormatter.format(Math.abs(changePercent))}%)`;
      }

      clauses.push(
        `active inventory ${direction} by ${formatCount(count)} ${pluralize(count, 'profile')}${percentage} over the 30-day comparison period`,
      );
    }
  }

  if (isNonNegativeFinite(stats.new30dCount)) {
    clauses.push(
      `${formatCount(stats.new30dCount)} ${pluralize(stats.new30dCount, 'profile')} ${stats.new30dCount === 1 ? 'was' : 'were'} first observed during the latest 30-day window`,
    );
  }

  if (clauses.length === 0) return null;
  const sentence = clauses.join('; ');
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

function validLeadingCity(stats: LocationStats, candidate: LocationStats | null): LocationStats | null {
  if (!candidate || candidate.scopeType !== 'city' || !sameSnapshot(stats, candidate)) return null;
  if (
    stats.scopeType === 'state' &&
    candidate.parentStateSlug !== stats.scopeSlug
  ) {
    return null;
  }

  return isNonNegativeFinite(candidate.activeCount) ? candidate : null;
}

/**
 * Produces snapshot-grounded prose only. Optional comparisons are ignored
 * unless their immutable snapshot identity matches the primary record.
 */
export function buildDirectoryPulseSentences({
  stats,
  nationalStats,
  leadingCity,
}: Pick<DirectoryPulseSummaryProps, 'stats' | 'nationalStats' | 'leadingCity'>): string[] {
  const national =
    nationalStats &&
    nationalStats.scopeType === 'national' &&
    stats.scopeType !== 'national' &&
    sameSnapshot(stats, nationalStats)
      ? nationalStats
      : null;
  const city = validLeadingCity(stats, leadingCity ?? null);
  const rankClause = stats.scopeType === 'state' && isNonNegativeFinite(stats.inventoryRank)
    ? `, ranking #${formatCount(stats.inventoryRank)} among the 50 state directories in the same snapshot`
    : '';
  const sentences: string[] = [
    `The ${stats.label} directory snapshot contains ${formatCount(stats.activeCount)} active creator ${pluralize(stats.activeCount, 'profile')}${rankClause}.`,
  ];

  const shares = buildShareSentence(stats, national);
  if (shares) sentences.push(shares);

  const price = buildPriceSentence(stats, national);
  if (price) sentences.push(price);

  const changeAndDiscovery = buildChangeAndDiscoverySentence(stats);
  if (changeAndDiscovery) sentences.push(changeAndDiscovery);

  if (city) {
    const concentration = stats.activeCount > 0
      ? ` (${formatShare(city.activeCount / stats.activeCount)} of the state inventory before accounting for overlapping public-location signals)`
      : '';
    sentences.push(
      `The leading city by active inventory is ${city.label}, with ${formatCount(city.activeCount)} active ${pluralize(city.activeCount, 'profile')}${concentration} in the same snapshot.`,
    );
  }

  if (
    isNonNegativeFinite(stats.medianPosts) ||
    isNonNegativeFinite(stats.medianPhotos) ||
    isNonNegativeFinite(stats.medianVideos)
  ) {
    const counters = [
      isNonNegativeFinite(stats.medianPosts) ? `${formatCount(stats.medianPosts)} posts` : null,
      isNonNegativeFinite(stats.medianPhotos) ? `${formatCount(stats.medianPhotos)} photos` : null,
      isNonNegativeFinite(stats.medianVideos) ? `${formatCount(stats.medianVideos)} videos` : null,
    ].filter((value): value is string => value !== null);
    sentences.push(`Median source-reported profile counters are ${counters.join(', ')} among records where each counter is known.`);
  }

  if (sentences.length < 3) {
    sentences.push(
      `These figures use snapshot ${stats.snapshotId}, completed ${formatSnapshotDate(stats.completedAt, true)} UTC under methodology ${stats.methodologyVersion}.`,
    );
  }

  return sentences.slice(0, 5);
}

export function DirectoryPulseSummary({
  stats,
  nationalStats,
  leadingCity,
  headingLevel = 'h2',
  headingId = 'directory-pulse-summary-heading',
}: DirectoryPulseSummaryProps) {
  const Heading = headingLevel;
  const sentences = buildDirectoryPulseSentences({ stats, nationalStats, leadingCity });

  return (
    <section className={styles.pulseSummary} aria-labelledby={headingId}>
      <div className={styles.pulseSummaryHeader}>
        <div>
          <p className={styles.eyebrow}>Directory Pulse analysis</p>
          <Heading id={headingId}>What the latest {stats.label} data shows</Heading>
        </div>
        <p className={styles.pulseSummarySnapshot}>
          One published snapshot ·{' '}
          <time dateTime={stats.completedAt}>{formatSnapshotDate(stats.completedAt)}</time>
        </p>
      </div>
      <div className={styles.pulseSummaryText}>
        {sentences.map((sentence, index) => (
          <p key={`${index}-${sentence}`}>{sentence}</p>
        ))}
      </div>
    </section>
  );
}

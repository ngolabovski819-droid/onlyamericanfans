import { formatCount, formatPrice, formatShare, formatSnapshotDate, hasMetric } from './format';
import type { DirectorySnapshotStats } from './types';

export interface DirectoryFaq {
  q: string;
  a: string;
}

interface BuildDirectoryFaqsOptions {
  label: string;
  stats: DirectorySnapshotStats;
  cutoffAt?: string | null;
}

export function buildDirectoryFaqs({ label, stats, cutoffAt }: BuildDirectoryFaqsOptions): DirectoryFaq[] {
  const faqs: DirectoryFaq[] = [];
  const verifiedShare = formatShare(stats.verifiedCount, stats.activeInventory);
  const freeShare = formatShare(stats.freeAccountCount, stats.priceKnownCount);

  if (hasMetric(stats.activeInventory)) {
    faqs.push({
      q: `How many active creator profiles are in the ${label} directory?`,
      a: `The latest published snapshot contains ${formatCount(stats.activeInventory)} active profiles with a successful source check inside the 30-day freshness window and public location text matching a curated ${label} term. This describes matched directory records, not a census of every creator living in ${label}.`,
    });
  }
  if (hasMetric(stats.verifiedCount)) {
    faqs.push({
      q: `How many ${label} profiles are verified?`,
      a: `${formatCount(stats.verifiedCount)} active profiles explicitly report verified status${verifiedShare ? `, equal to ${verifiedShare} of active inventory` : ''}. Verification is never inferred from a name, image or biography.`,
    });
  }
  if (hasMetric(stats.freeAccountCount)) {
    faqs.push({
      q: `How many ${label} accounts have a free advertised price?`,
      a: `${formatCount(stats.freeAccountCount)} active profiles have a known effective advertised price of $0${freeShare ? `, or ${freeShare} of the ${formatCount(stats.priceKnownCount)} profiles with known prices` : ''}. Unknown prices are excluded rather than treated as free.`,
    });
  }
  if (hasMetric(stats.medianPaidPrice)) {
    faqs.push({
      q: `What is the median paid subscription price in ${label}?`,
      a: `The latest median effective advertised price is ${formatPrice(stats.medianPaidPrice)}. The calculation includes prices strictly above $0 and excludes free, unknown and negative values.`,
    });
  }
  if (stats.snapshotAt) {
    faqs.push({
      q: `When was the ${label} directory data updated?`,
      a: `This page uses the fully published snapshot completed ${formatSnapshotDate(stats.snapshotAt, true)} UTC${cutoffAt ? `, with a measurement cutoff of ${formatSnapshotDate(cutoffAt, true)} UTC` : ''}. A failed refresh does not replace the previous successful snapshot.`,
    });
  }
  faqs.push({
    q: `How are profiles assigned to ${label}?`,
    a: `The current methodology matches nonblank public profile locations against curated case-insensitive terms for ${label}. It does not verify residency, so ambiguous, missing or outdated location text can affect the total.`,
  });

  return faqs;
}

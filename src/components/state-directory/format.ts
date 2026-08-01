export function hasMetric(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function formatCount(value: number | null | undefined): string {
  return hasMetric(value) ? new Intl.NumberFormat('en-US').format(Math.round(value)) : 'Not available';
}

export function formatPrice(value: number | null | undefined): string {
  return hasMetric(value)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    : 'Not available';
}

export function formatShare(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
): string | null {
  if (!hasMetric(numerator) || !hasMetric(denominator) || denominator === 0) return null;
  return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(
    numerator / denominator,
  );
}

export function formatSnapshotDate(value: string | null | undefined, includeTime = false): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' as const } : {}),
    timeZone: 'UTC',
  }).format(date);
}

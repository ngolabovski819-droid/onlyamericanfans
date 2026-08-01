export type LastModifiedValue = string | Date | null | undefined;

interface NormalizedDate {
  timestamp: number;
  value: string;
}
function normalizeDate(value: LastModifiedValue): NormalizedDate | null {
  if (value == null || value === '') return null;

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp)
      ? { timestamp, value: value.toISOString() }
      : null;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  const timestamp = Date.parse(trimmed);
  if (!Number.isFinite(timestamp)) return null;

  // A date-only value is already valid sitemap syntax and avoids inventing a precision the
  // source does not have. Datetimes are normalized so downstream XML stays deterministic.
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? { timestamp, value: trimmed }
    : { timestamp, value: new Date(timestamp).toISOString() };
}

/**
 * Return the newest explicitly supplied, valid material-change timestamp.
 *
 * There is intentionally no `new Date()` fallback: omitting lastmod is more truthful than
 * claiming a fresh update on every build. Callers should pass only times when visible content,
 * directory data, or methodology actually changed.
 */
export function resolveLastModified(
  ...publishedChanges: readonly LastModifiedValue[]
): string | undefined {
  const normalized = publishedChanges
    .map(normalizeDate)
    .filter((value): value is NormalizedDate => value !== null);

  if (normalized.length === 0) return undefined;

  return normalized.reduce((latest, candidate) =>
    candidate.timestamp > latest.timestamp ? candidate : latest,
  ).value;
}

export interface DirectoryPublishedChanges {
  /** Time the shared page template or its explanatory content materially changed. */
  templateChangedAt?: LastModifiedValue;
  /** Time a newly published snapshot changed data visible on this page. */
  snapshotChangedAt?: LastModifiedValue;
  /** Time route-specific editorial content materially changed. */
  editorialChangedAt?: LastModifiedValue;
}

/** Hook for sitemap entries, metadata and JSON-LD to share one truthful dateModified value. */
export function getDirectoryLastModified({
  templateChangedAt,
  snapshotChangedAt,
  editorialChangedAt,
}: DirectoryPublishedChanges): string | undefined {
  return resolveLastModified(
    templateChangedAt,
    snapshotChangedAt,
    editorialChangedAt,
  );
}

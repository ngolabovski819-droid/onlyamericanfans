export type PaginationQueryValue = string | number | boolean | null | undefined;
export type PaginationToken = number | 'start-ellipsis' | 'end-ellipsis';

export function parseDirectoryPage(
  value: string | readonly string[] | null | undefined,
  maxPage = 10_000,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) return 1;

  const page = Number(raw);
  if (!Number.isSafeInteger(page) || page < 1) return 1;
  return Math.min(page, Math.max(1, maxPage));
}

export function getDirectoryPageCount(total: number, pageSize: number): number {
  if (!Number.isFinite(total) || total <= 0) return 1;
  if (!Number.isFinite(pageSize) || pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Builds a compact moving window while always exposing the first and last pages. Sequential
 * previous/next links ensure every page remains discoverable even when the full range is large.
 */
export function getPaginationTokens(
  currentPage: number,
  totalPages: number,
  maxNumberLinks = 7,
): PaginationToken[] {
  const safeTotal = Number.isFinite(totalPages)
    ? Math.max(1, Math.floor(totalPages))
    : 1;
  const normalizedCurrent = Number.isFinite(currentPage)
    ? Math.max(1, Math.floor(currentPage))
    : 1;
  const safeCurrent = Math.min(safeTotal, normalizedCurrent);
  const maxLinks = Number.isFinite(maxNumberLinks)
    ? Math.max(3, Math.floor(maxNumberLinks))
    : 7;

  if (safeTotal <= maxLinks) {
    return Array.from({ length: safeTotal }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, safeTotal, safeCurrent]);
  let distance = 1;
  while (pages.size < maxLinks) {
    if (safeCurrent - distance > 1) pages.add(safeCurrent - distance);
    if (pages.size < maxLinks && safeCurrent + distance < safeTotal) {
      pages.add(safeCurrent + distance);
    }
    if (safeCurrent - distance <= 1 && safeCurrent + distance >= safeTotal) break;
    distance += 1;
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const tokens: PaginationToken[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous != null && page - previous > 1) {
      tokens.push(previous === 1 ? 'start-ellipsis' : 'end-ellipsis');
    }
    tokens.push(page);
  });
  return tokens;
}

export function buildDirectoryPageUrl(
  basePath: string,
  page: number,
  retainedQuery: Readonly<Record<string, PaginationQueryValue>> = {},
): string {
  const isAbsolute = /^https?:\/\//i.test(basePath);
  const url = new URL(basePath, 'https://directory-pagination.invalid');

  Object.entries(retainedQuery).forEach(([key, value]) => {
    if (value == null || value === false || value === '') {
      url.searchParams.delete(key);
      return;
    }
    url.searchParams.set(key, String(value));
  });

  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  if (safePage === 1) url.searchParams.delete('page');
  else url.searchParams.set('page', String(safePage));

  if (isAbsolute) return url.toString();
  return `${url.pathname}${url.search}${url.hash}`;
}

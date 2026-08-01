import type { Metadata } from 'next';
import { buildDirectoryPageUrl, parseDirectoryPage } from './pagination';

/** City pages below this complete-snapshot inventory are followable but not indexable. */
export const MIN_INDEXABLE_CITY_INVENTORY = 20;

export type DirectorySearchParams = Readonly<
  Record<string, string | readonly string[] | undefined>
>;

interface DirectoryIndexationOptions {
  searchParams?: DirectorySearchParams;
  /** Query keys that represent distinct crawlable pages rather than filters/sorts. */
  indexableQueryKeys?: readonly string[];
  maxIndexablePage?: number;
}

/**
 * Filter and sort combinations should be followable but not independently indexed. This helper
 * deliberately does not alter robots.txt: crawlers need to fetch the URL to see its noindex.
 */
export function getDirectoryRobots({
  searchParams = {},
  indexableQueryKeys = ['page'],
  maxIndexablePage = 10_000,
}: DirectoryIndexationOptions = {}): Metadata['robots'] {
  const allowedKeys = new Set(indexableQueryKeys);
  const populatedKeys = Object.entries(searchParams)
    .filter(([, value]) => Array.isArray(value) ? value.length > 0 : Boolean(value))
    .map(([key]) => key);

  const pageValue = searchParams.page;
  const rawPage = Array.isArray(pageValue) ? pageValue[0] : pageValue;
  const parsedPage = parseDirectoryPage(pageValue, maxIndexablePage);
  const pageIsMalformed =
    (Array.isArray(pageValue) && pageValue.length !== 1) ||
    (rawPage != null && String(parsedPage) !== rawPage);
  const hasNonIndexableQuery = populatedKeys.some((key) => !allowedKeys.has(key));
  const shouldIndex = !hasNonIndexableQuery && !pageIsMalformed;

  return {
    index: shouldIndex,
    follow: true,
    googleBot: { index: shouldIndex, follow: true },
  };
}

export function getDirectoryCanonical(
  siteUrl: string,
  path: string,
  pageValue?: string | readonly string[] | null,
): string {
  const page = parseDirectoryPage(pageValue);
  const origin = siteUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return buildDirectoryPageUrl(`${origin}${normalizedPath}`, page);
}

import {
  buildDirectoryPageUrl,
  getPaginationTokens,
  type PaginationQueryValue,
} from '@/lib/seo/pagination';
import styles from './DirectoryPagination.module.css';

interface DirectoryPaginationProps {
  basePath: string;
  currentPage: number;
  hasNextPage: boolean;
  /** Optional when the backend has only a has-more signal. */
  totalPages?: number;
  retainedQuery?: Readonly<Record<string, PaginationQueryValue>>;
  maxNumberLinks?: number;
  ariaLabel?: string;
}

/**
 * Crawlable, no-JavaScript pagination for directory pages. It intentionally uses raw anchors:
 * bots and no-JS visitors receive real hrefs, and Next does not prefetch every expensive result
 * page as the navigation scrolls into view.
 */
export default function DirectoryPagination({
  basePath,
  currentPage,
  hasNextPage,
  totalPages,
  retainedQuery,
  maxNumberLinks = 7,
  ariaLabel = 'Creator directory pages',
}: DirectoryPaginationProps) {
  const safeCurrent = Number.isFinite(currentPage)
    ? Math.max(1, Math.floor(currentPage))
    : 1;
  const safeTotal = totalPages == null
    ? undefined
    : Number.isFinite(totalPages)
      ? Math.max(safeCurrent, Math.floor(totalPages))
      : safeCurrent;
  const canGoBack = safeCurrent > 1;
  const canGoForward = hasNextPage || (safeTotal != null && safeCurrent < safeTotal);

  if (!canGoBack && !canGoForward && (safeTotal == null || safeTotal <= 1)) {
    return null;
  }

  const pageHref = (page: number) =>
    buildDirectoryPageUrl(basePath, page, retainedQuery);
  const tokens = safeTotal == null
    ? []
    : getPaginationTokens(safeCurrent, safeTotal, maxNumberLinks);

  return (
    <nav className={styles.pagination} aria-label={ariaLabel}>
      {canGoBack ? (
        <a
          className={styles.link}
          href={pageHref(safeCurrent - 1)}
          rel="prev"
        >
          <span aria-hidden="true">←</span> Previous
        </a>
      ) : (
        <span
          className={`${styles.link} ${styles.disabled}`}
          aria-disabled="true"
        >
          <span aria-hidden="true">←</span> Previous
        </span>
      )}

      <span className={styles.pages}>
        {tokens.length === 0 ? (
          <span
            className={`${styles.link} ${styles.current}`}
            aria-current="page"
          >
            {safeCurrent}
          </span>
        ) : tokens.map((token) => {
          if (typeof token !== 'number') {
            return (
              <span
                key={token}
                className={styles.ellipsis}
                aria-hidden="true"
              >
                …
              </span>
            );
          }

          if (token === safeCurrent) {
            return (
              <span
                key={token}
                className={`${styles.link} ${styles.current}`}
                aria-current="page"
              >
                {token}
              </span>
            );
          }

          return (
            <a
              key={token}
              className={styles.link}
              href={pageHref(token)}
              aria-label={`Page ${token}`}
            >
              {token}
            </a>
          );
        })}
      </span>

      {canGoForward ? (
        <a
          className={styles.link}
          href={pageHref(safeCurrent + 1)}
          rel="next"
        >
          Next <span aria-hidden="true">→</span>
        </a>
      ) : (
        <span
          className={`${styles.link} ${styles.disabled}`}
          aria-disabled="true"
        >
          Next <span aria-hidden="true">→</span>
        </span>
      )}
    </nav>
  );
}

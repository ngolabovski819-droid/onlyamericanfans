import Link from 'next/link';
import type { Creator } from '@/types/creator';
import CreatorCard from './CreatorCard';

interface Props {
  creators: Creator[];
  total: number;
  currentPage: number;
  totalPages: number;
  /** URL for page 1, no trailing slash and no page segment (e.g. "/alabama-onlyfans"). */
  baseUrl: string;
}

/**
 * Fully static counterpart to CreatorGrid — no 'use client', no fetching, no Load More button.
 * Every page of results is its own real, pre-built URL (baseUrl for page 1,
 * `${baseUrl}/${page}` for the rest — see src/app/[locationSlug]/[page]/page.tsx), linked via
 * plain <Link>s. Once built, browsing these pages needs zero live database calls, ever — see
 * src/lib/pagination.ts for why page count is capped rather than unbounded.
 */
export default function StaticCreatorGrid({ creators, total, currentPage, totalPages, baseUrl }: Props) {
  if (creators.length === 0) {
    return (
      <div className="empty-state">
        <p>No American creators found matching your filters.</p>
        <Link href="/onlyfans-search" className="empty-state-link">Try a broader search</Link>
      </div>
    );
  }

  const pageUrl = (p: number) => (p <= 1 ? baseUrl : `${baseUrl}/${p}`);

  return (
    <div>
      <p className="results-count">
        Showing <strong>{creators.length}</strong> of {total.toLocaleString()} American creators
        {totalPages > 1 ? ` — page ${currentPage} of ${totalPages}` : ''}
      </p>
      <div className="creator-grid">
        {creators.map((c, i) => (
          <CreatorCard key={c.id} creator={c} index={i} />
        ))}
      </div>
      {totalPages > 1 && (
        <nav className="static-pagination" aria-label="Pagination">
          {currentPage > 1 ? (
            <Link href={pageUrl(currentPage - 1)} className="static-pagination-link" rel="prev">← Previous</Link>
          ) : (
            <span className="static-pagination-link static-pagination-link--disabled">← Previous</span>
          )}
          <span className="static-pagination-current">Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages ? (
            <Link href={pageUrl(currentPage + 1)} className="static-pagination-link" rel="next">Next →</Link>
          ) : (
            <span className="static-pagination-link static-pagination-link--disabled">Next →</span>
          )}
        </nav>
      )}
    </div>
  );
}

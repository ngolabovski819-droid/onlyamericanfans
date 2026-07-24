'use client';

import { useState, useCallback } from 'react';
import type { Creator } from '@/types/creator';
import CreatorCard from './CreatorCard';

interface Props {
  initialCreators: Creator[];
  initialHasMore: boolean;
  initialTotal: number;
  locationTerms?: string[];
  categoryTerms?: string[];
  filterGroups?: Record<string, string[]>;
  verified?: boolean;
  price?: string;
  sort?: string;
  q?: string;
  /** When true, load-more skips the AU location filter (used for category pages) */
  skipLocationFilter?: boolean;
  /** Page size used for SSR; load-more reuses it so offsets align. Defaults to 20. */
  pageSize?: number;
  /** Scope id ('home' | `category:<slug>` | `state:<slug>` | `city:<slug>` | `region:<slug>` | 'search')
   *  — when set, load-more goes through the sponsor-placement-aware orchestrator so pinned
   *  placements land on the correct page and overrides keep applying past page 1. */
  scope?: string;
}

const DEFAULT_PAGE_SIZE = 20;

export default function CreatorGrid({
  initialCreators,
  initialHasMore,
  initialTotal,
  locationTerms,
  categoryTerms,
  filterGroups,
  verified,
  price,
  sort,
  q,
  skipLocationFilter,
  pageSize,
  scope,
}: Props) {
  const effectivePageSize = pageSize ?? DEFAULT_PAGE_SIZE;
  const [creators, setCreators] = useState<Creator[]>(initialCreators);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (verified) params.set('verified', 'true');
      if (price && price !== 'any') params.set('price', price);
      if (sort) params.set('sort', sort);
      params.set('page', String(nextPage));
      params.set('page_size', String(effectivePageSize));
      if (locationTerms?.length) params.set('location_terms', locationTerms.join(','));
      if (categoryTerms?.length) params.set('category_terms', categoryTerms.join(','));
      if (filterGroups && Object.keys(filterGroups).length) {
        params.set('filter_groups', JSON.stringify(filterGroups));
      }
      // Skip US location filter when on a category page (matches SSR behaviour)
      if (skipLocationFilter) params.set('skip_location_filter', 'true');
      if (scope) params.set('scope', scope);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setCreators((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const newOnes = (data.creators as Creator[]).filter((c) => !existingIds.has(c.id));
        return [...prev, ...newOnes];
      });
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, q, verified, price, sort, locationTerms, categoryTerms, filterGroups, skipLocationFilter, effectivePageSize, scope]);

  if (creators.length === 0) {
    return (
      <div className="empty-state">
        <p>No American creators found matching your filters.</p>
        <a href="/onlyfans-search" className="empty-state-link">Try a broader search</a>
      </div>
    );
  }

  return (
    <div>
      <p className="results-count">
        Showing <strong>{creators.length}</strong>{initialTotal > creators.length ? ` of ${initialTotal.toLocaleString()}` : ''} American creators
      </p>
      <div className="creator-grid">
        {creators.map((c, i) => (
          <CreatorCard key={c.id} creator={c} index={i} />
        ))}
      </div>
      {hasMore && (
        <div className="load-more-wrap">
          <button
            className="load-more-btn"
            onClick={loadMore}
            disabled={loading}
            aria-label="Load more creators"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

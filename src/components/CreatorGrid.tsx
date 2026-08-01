'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Creator } from '@/types/creator';
import type { SearchCursor } from '@/lib/supabase';
import CreatorCard from './CreatorCard';

interface Props {
  initialCreators: Creator[];
  initialHasMore: boolean;
  initialTotal: number;
  /** PostgREST planner totals are estimates; only snapshot-backed callers should set false. */
  initialTotalIsEstimated?: boolean;
  /** One-based SSR result page. Crawlable directory URLs can begin beyond page 1. */
  initialPage?: number;
  /** Seek-pagination cursor from the SSR page's fetch — passed back on the first "Load More"
   *  click so deep pagination stays fast instead of degrading via OFFSET. */
  initialNextCursor?: SearchCursor | null;
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
  /** Disable the unrelated-popular fallback on indexable geographic directories. */
  fallbackToPopularIfEmpty?: boolean;
  /** Scope id ('home' | `category:<slug>` | `state:<slug>` | `city:<slug>` | `region:<slug>` | 'search')
   *  — when set, load-more goes through the sponsor-placement-aware orchestrator so pinned
   *  placements land on the correct page and overrides keep applying past page 1. */
  scope?: string;
  /** Hide the client-only append control when crawlable page links are rendered separately. */
  showLoadMore?: boolean;
}

const DEFAULT_PAGE_SIZE = 20;

export default function CreatorGrid({
  initialCreators,
  initialHasMore,
  initialTotal,
  initialTotalIsEstimated = true,
  initialPage = 1,
  initialNextCursor,
  locationTerms,
  categoryTerms,
  filterGroups,
  verified,
  price,
  sort,
  q,
  skipLocationFilter,
  pageSize,
  fallbackToPopularIfEmpty,
  scope,
  showLoadMore = true,
}: Props) {
  const effectivePageSize = pageSize ?? DEFAULT_PAGE_SIZE;
  const [creators, setCreators] = useState<Creator[]>(initialCreators);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<SearchCursor | null>(initialNextCursor ?? null);

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
      if (fallbackToPopularIfEmpty === false) params.set('fallback_to_popular', 'false');
      if (cursor) params.set('cursor', JSON.stringify(cursor));

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setCreators((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const newOnes = (data.creators as Creator[]).filter((c) => !existingIds.has(c.id));
        return [...prev, ...newOnes];
      });
      setHasMore(data.hasMore);
      setCursor((data.nextCursor as SearchCursor | null) ?? null);
      setPage(nextPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, q, verified, price, sort, locationTerms, categoryTerms, filterGroups, skipLocationFilter, effectivePageSize, scope, cursor, fallbackToPopularIfEmpty]);

  if (creators.length === 0) {
    return (
      <div className="empty-state">
        <p>No creator profiles found matching your filters.</p>
        <Link href="/onlyfans-search" className="empty-state-link">Try a broader search</Link>
      </div>
    );
  }

  const firstVisiblePosition = (Math.max(1, initialPage) - 1) * effectivePageSize + 1;
  const lastVisiblePosition = firstVisiblePosition + creators.length - 1;

  return (
    <div>
      <p className="results-count">
        Showing <strong>{firstVisiblePosition.toLocaleString()}–{lastVisiblePosition.toLocaleString()}</strong>
        {initialTotal >= lastVisiblePosition
          ? ` of ${initialTotalIsEstimated ? 'about ' : ''}${initialTotal.toLocaleString()}`
          : ''} matched creator profiles
      </p>
      <div className="creator-grid">
        {creators.map((c, i) => (
          <CreatorCard key={c.id} creator={c} index={i} />
        ))}
      </div>
      {showLoadMore && hasMore && (
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

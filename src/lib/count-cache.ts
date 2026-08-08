import { fetchCreators } from './supabase';

/**
 * Plain in-process memory cache for creator-count lookups, independent of Next's own fetch
 * cache. Next's ISR/fetch cache is what actually protects production (see the comment on
 * browse-by-state's `revalidate` export) — but it does nothing in `next dev`, which "always
 * renders on-demand" and re-runs every fetch on every request. Without this, opening
 * /browse-by-state locally re-runs all ~300 Supabase count queries (each a slow `location ILIKE`
 * OR-chain) on every single page load/reload, which in practice takes 40-70+ seconds.
 *
 * Stored on `globalThis`, NOT plain module scope — measured that a plain `const cache = new
 * Map()` at module scope did NOT survive between requests here (this dev server re-evaluates the
 * route's module graph per request), so a second load was exactly as slow as the first. Same
 * fix as the well-known Prisma-client-in-dev pattern: `globalThis` is the one thing guaranteed to
 * survive module re-evaluation within the same Node process.
 */
interface CachedCount {
  total: number;
  expiresAt: number;
}

declare global {
  var __creatorCountCache: Map<string, CachedCount> | undefined;
}

function getCache(): Map<string, CachedCount> {
  if (!globalThis.__creatorCountCache) {
    globalThis.__creatorCountCache = new Map();
  }
  return globalThis.__creatorCountCache;
}

export async function fetchCachedCreatorCount(locationTerms: string[] | undefined, ttlMs: number): Promise<number> {
  const cache = getCache();
  const key = locationTerms?.length ? locationTerms.join('|') : '__all__';
  const cached = cache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.total;

  const result = await fetchCreators({ locationTerms, pageSize: 1, revalidate: Math.ceil(ttlMs / 1000) });
  cache.set(key, { total: result.total, expiresAt: now + ttlMs });
  return result.total;
}

import type { Metadata } from 'next';
import { fetchCreators } from '@/lib/supabase';
import SearchFilters from '@/components/SearchFilters';
import CreatorGrid from '@/components/CreatorGrid';
import FAQ from '@/components/FAQ';
import { searchPageFaqs } from '@/lib/faqs';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://onlyamericanfans.com';

export const metadata: Metadata = {
  title: 'OnlyFans Search — Find American Creators by Name, City & State',
  description:
    'The best American OnlyFans search engine. Search thousands of verified US creators by name, city, state, price and more. Updated daily.',
  alternates: { canonical: `${SITE_URL}/onlyfans-search/` },
  openGraph: {
    title: 'American OnlyFans Search Engine',
    description: 'Find verified US OnlyFans creators by name, city & price.',
    url: `${SITE_URL}/onlyfans-search/`,
  },
};

interface Props {
  searchParams: Promise<{
    q?: string;
    verified?: string;
    price?: string;
    sort?: string;
    page?: string;
    filter_groups?: string;
  }>;
}

function parseFilterGroups(raw?: string): Record<string, string[]> | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string[]>;
    }
  } catch {}
  return undefined;
}

export default async function OnlyFansSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q        = sp.q ?? '';
  const verified = sp.verified === 'true';
  const price    = (sp.price as 'free' | 'under5' | 'under10' | 'any') ?? 'any';
  const sort     = (sp.sort as 'popular' | 'newest') ?? 'popular';
  const filterGroups = parseFilterGroups(sp.filter_groups);

  const { creators, total, hasMore } = await fetchCreators({
    q: q || undefined,
    verified: verified || undefined,
    price: price !== 'any' ? price : undefined,
    sort,
    filterGroups,
    pageSize: 24,
    skipLocationFilter: true,
    revalidate: 30,
  });

  return (
    <div className="page-container" style={{ paddingTop: '0.5rem', paddingBottom: '3rem' }}>
      <section className="hero-shell hero-shell--compact starfield" style={{ marginBottom: '2rem' }}>
        <div className="hero-shell-inner">
          <p className="eyebrow-pill">OnlyFans Search</p>
          <h1 className="display-h1">
            {q ? <>Results for <span className="gradient-accent">&ldquo;{q}&rdquo;</span></> : <>All <span className="gradient-accent">American</span> OnlyFans Creators</>}
          </h1>
          <p className="display-sub">
            <strong style={{ color: 'var(--text)' }}>{total.toLocaleString()}</strong> verified American creators · filter by price, sort, and verification status.
          </p>
          <form action="/onlyfans-search" method="GET">
            <div className="search-mega">
              <svg className="search-mega-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" name="q" defaultValue={q} className="search-mega-input" placeholder="Search by name, city or state…" aria-label="Search creators" />
              <button type="submit" className="search-mega-btn">Search</button>
            </div>
          </form>
        </div>
      </section>

      <div className="search-layout">
        <aside className="search-sidebar">
          <SearchFilters />
        </aside>

        <div>
          <CreatorGrid
            initialCreators={creators}
            initialTotal={total}
            initialHasMore={hasMore}
            q={q || undefined}
            verified={verified || undefined}
            price={price !== 'any' ? price : undefined}
            sort={sort}
            filterGroups={filterGroups}
            skipLocationFilter={true}
          />
        </div>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <FAQ faqs={searchPageFaqs} heading="Frequently Asked Questions" />
      </section>
    </div>
  );
}

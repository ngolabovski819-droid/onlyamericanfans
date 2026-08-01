import type { Metadata } from 'next';
import { fetchScopedCreators } from '@/lib/sponsorship';
import SearchFilters from '@/components/SearchFilters';
import CreatorGrid from '@/components/CreatorGrid';
import FAQ from '@/components/FAQ';
import { searchPageFaqs } from '@/lib/faqs';
import CreatorSearchBox from '@/components/CreatorSearchBox';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'OnlyFans Creator Search — Name, Price & Verification',
  description:
    'Search public creator directory records by name, advertised price and source-reported verification. Estimated result totals are labeled transparently.',
  alternates: { canonical: `${SITE_URL}/onlyfans-search` },
  openGraph: {
    title: 'OnlyFans Creator Search | OnlyAmericanFans',
    description: 'Search public creator records by name, advertised price and verification status.',
    url: `${SITE_URL}/onlyfans-search`,
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

  const { creators, total, hasMore, nextCursor } = await fetchScopedCreators({
    scope: 'search',
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
            {q ? <>Results for <span className="gradient-accent">&ldquo;{q}&rdquo;</span></> : <>Search the <span className="gradient-accent">Creator</span> Directory</>}
          </h1>
          <p className="display-sub">
            About <strong style={{ color: 'var(--text)' }}>{total.toLocaleString()}</strong> matching records · filter by price, sort, and source-reported verification.
          </p>
          <CreatorSearchBox defaultValue={q} />
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
            initialNextCursor={nextCursor}
            q={q || undefined}
            verified={verified || undefined}
            price={price !== 'any' ? price : undefined}
            sort={sort}
            filterGroups={filterGroups}
            skipLocationFilter={true}
            pageSize={24}
            scope="search"
          />
        </div>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <FAQ faqs={searchPageFaqs} heading="Frequently Asked Questions" />
      </section>
    </div>
  );
}

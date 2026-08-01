import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, categories } from '@/config/categories';
import { states } from '@/config/states';
import { cities } from '@/config/cities';
import { fetchScopedCreators } from '@/lib/sponsorship';
import CreatorGrid from '@/components/CreatorGrid';
import DirectoryPagination from '@/components/DirectoryPagination';
import JsonLd from '@/components/JsonLd';
import { categoryFaqs } from '@/lib/faqs';
import { getDirectoryCanonical, getDirectoryRobots } from '@/lib/seo/indexation';
import { parseDirectoryPage } from '@/lib/seo/pagination';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const cat = getCategoryBySlug(slug);
  if (!cat) return {};
  const page = parseDirectoryPage(query.page, 500);
  const title = `${cat.label} OnlyFans Creators — Category Directory${page > 1 ? ` — Page ${page}` : ''}`;
  const desc  = `Browse public creator profiles matched to the ${cat.label} category. Compare advertised prices and source-reported verification, with paid placements clearly labeled.`;
  const url = getDirectoryCanonical(SITE_URL, `/categories/${slug}`, query.page);
  return {
    title,
    description: desc,
    robots: getDirectoryRobots({ searchParams: query, maxIndexablePage: 500 }),
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, images: [{ url: `${SITE_URL}/categories/${slug}/opengraph-image` }] },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const page = parseDirectoryPage(query.page, 500);
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const { creators, total, hasMore, nextCursor } = await fetchScopedCreators({
    scope: `category:${slug}`,
    categoryTerms: cat.terms.length > 0 ? cat.terms : undefined,
    price: cat.priceFilter,
    skipLocationFilter: true,
    page,
    pageSize: 24,
    sort: 'popular',
    fallbackToPopularIfEmpty: false,
  });

  const faqs = categoryFaqs({ label: cat.label, slug, total, priceFilter: cat.priceFilter });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: `${SITE_URL}/categories` },
      { '@type': 'ListItem', position: 3, name: cat.label, item: `${SITE_URL}/categories/${slug}` },
    ],
  };

  return (
    <>
      {page === 1 && <JsonLd id="category-faqs" data={faqSchema} />}
      <JsonLd id="category-breadcrumbs" data={breadcrumbSchema} />

      <div className="location-page page-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/categories">Categories</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{cat.label}</span>
        </nav>

        {/* Hero */}
        <section className="detail-hero starfield">
          <div className="detail-hero-inner">
            <p className="eyebrow-pill">
              {cat.emoji ? `${cat.emoji} ` : ''}Category
              {cat.priceFilter === 'free' && <span style={{ marginLeft: 6, padding: '1px 6px', background: 'rgba(34,197,94,0.2)', color: '#4ade80', borderRadius: 99, fontSize: '0.65rem', letterSpacing: '0.06em' }}>FREE</span>}
            </p>
            <h1>
              <span className="gradient-accent">{cat.label}</span> OnlyFans Creators
            </h1>
            <p className="display-sub" style={{ margin: '0 0 0.5rem', maxWidth: 720 }}>
              Browse public creator profiles matched to the {cat.label.toLowerCase()} category. Verification
              and advertised price are shown from each current directory record, with ads labeled separately.
            </p>
            <div className="detail-hero-meta">
              <span className="detail-hero-meta-item">Category-matched directory</span>
              <span className="detail-hero-meta-item">Source-reported verification</span>
              <span className="detail-hero-meta-item">Current stored advertised prices</span>
            </div>
          </div>
        </section>

        <CreatorGrid
          initialCreators={creators}
          initialTotal={total}
          initialHasMore={hasMore}
          initialPage={page}
          initialNextCursor={nextCursor}
          categoryTerms={cat.terms.length > 0 ? cat.terms : undefined}
          price={cat.priceFilter}
          skipLocationFilter
          pageSize={24}
            scope={`category:${slug}`}
            fallbackToPopularIfEmpty={false}
            showLoadMore={false}
          />

        <DirectoryPagination
          basePath={`/categories/${slug}`}
          currentPage={page}
          hasNextPage={hasMore}
          ariaLabel={`${cat.label} creator directory pages`}
        />


        {/* FAQ */}
        {page === 1 && <section className="faq-section">
          <h2 className="faq-heading">Frequently Asked Questions</h2>
          <dl className="faq-list">
            {faqs.map((f, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">{f.q}</summary>
                <dd className="faq-answer">{f.a}</dd>
              </details>
            ))}
          </dl>
        </section>}

        {/* Browse by State — links to real state pages */}
        {page === 1 && <section style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem' }}>
          <div className="section-rail">
            <h2 className="section-rail-title">Browse American OnlyFans by State</h2>
            <Link href="/onlyfans-search" className="section-rail-link">All creators →</Link>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1rem' }}>
            Explore American OnlyFans creators in every US state.
          </p>
          <div className="chips-row chips-row--wrap">
            {states.map(s => (
              <Link key={s.slug} href={`/${s.urlSlug}`} className="location-chip">
                {s.abbr} — {s.label}
              </Link>
            ))}
          </div>
        </section>}

        {/* Explore Top US Cities — links to real city pages */}
        {page === 1 && <section style={{ paddingTop: '1rem', paddingBottom: '2.5rem' }}>
          <div className="section-rail">
            <h2 className="section-rail-title">Explore Top US Cities</h2>
            <Link href="/onlyfans-search" className="section-rail-link">More cities →</Link>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1rem' }}>
            Discover American OnlyFans creators in the biggest US cities.
          </p>
          <div className="chips-row chips-row--wrap">
            {cities.slice(0, 24).map(c => (
              <Link key={c.slug} href={`/${c.urlSlug}`} className="location-chip">
                {c.label}
              </Link>
            ))}
          </div>
        </section>}
      </div>
    </>
  );
}

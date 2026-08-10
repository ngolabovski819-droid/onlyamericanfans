import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, categories } from '@/config/categories';
import { fetchScopedCreators } from '@/lib/sponsorship';
import { fetchCreators } from '@/lib/supabase';
import StaticCreatorGrid from '@/components/StaticCreatorGrid';
import { cappedPageCount } from '@/lib/pagination';

// See the comment in src/app/[locationSlug]/page.tsx — false freezes the page forever, but only
// works because the fetchScopedCreators call below also passes revalidate:false.
export const revalidate = false;
export const dynamicParams = false; // beyond the capped page count, there's genuinely no more to show — 404, don't attempt to render on demand

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com';
const PAGE_SIZE = 24;

interface Props {
  params: Promise<{ slug: string; page: string }>;
}

/** Pages 2+ of a category's creator listing — see src/app/[locationSlug]/[page]/page.tsx for the
 *  identical pattern applied to states; same reasoning for keeping this lighter than page 1. */
export async function generateStaticParams() {
  const results: { slug: string; page: string }[] = [];
  for (const cat of categories) {
    // See the identical comment in src/app/[locationSlug]/[page]/page.tsx — fetchCreators()
    // directly, not fetchScopedCreators(), so the pageSize:1 count-only lookup doesn't get
    // short-circuited by sponsor-pin slotting.
    const { total } = await fetchCreators({
      categoryTerms: cat.terms.length > 0 ? cat.terms : undefined,
      price: cat.priceFilter,
      pageSize: 1,
    });
    const pageCount = cappedPageCount(total, PAGE_SIZE);
    for (let p = 2; p <= pageCount; p++) {
      results.push({ slug: cat.slug, page: String(p) });
    }
  }
  return results;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, page } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return {};
  const url = `${SITE_URL}/categories/${slug}/${page}`;
  return {
    title: `${cat.label} American OnlyFans Creators — Page ${page}`,
    description: `Browse more American ${cat.label.toLowerCase()} OnlyFans creators, page ${page}.`,
    alternates: { canonical: url },
  };
}

export default async function CategoryPageNumbered({ params }: Props) {
  const { slug, page: pageParam } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const page = parseInt(pageParam, 10);
  if (!Number.isInteger(page) || page < 2) notFound();

  const { creators, total } = await fetchScopedCreators({
    scope: `category:${slug}`,
    categoryTerms: cat.terms.length > 0 ? cat.terms : undefined,
    price: cat.priceFilter,
    skipLocationFilter: true,
    pageSize: PAGE_SIZE,
    page,
    sort: 'popular',
    revalidate: false,
  });

  const totalPages = cappedPageCount(total, PAGE_SIZE);
  if (creators.length === 0 && page > totalPages) notFound();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: `${SITE_URL}/categories/` },
      { '@type': 'ListItem', position: 3, name: cat.label, item: `${SITE_URL}/categories/${slug}/` },
      { '@type': 'ListItem', position: 4, name: `Page ${page}`, item: `${SITE_URL}/categories/${slug}/${page}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="location-page page-container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/categories">Categories</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href={`/categories/${slug}`}>{cat.label}</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Page {page}</span>
        </nav>

        <section className="detail-hero starfield" style={{ paddingBottom: '1.5rem' }}>
          <div className="detail-hero-inner">
            <h1>
              Best <span className="gradient-accent">{cat.label}</span> American OnlyFans — Page {page}
            </h1>
          </div>
        </section>

        <StaticCreatorGrid
          creators={creators}
          total={Math.min(total, totalPages * PAGE_SIZE)}
          currentPage={page}
          totalPages={totalPages}
          baseUrl={`/categories/${slug}`}
        />

        <p style={{ textAlign: 'center', padding: '1rem' }}>
          <Link href={`/categories/${slug}`} className="section-rail-link">← Back to {cat.label} overview</Link>
        </p>
      </div>
    </>
  );
}

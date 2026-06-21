import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, categories } from '@/config/categories';
import { states } from '@/config/states';
import { cities } from '@/config/cities';
import { fetchCreators } from '@/lib/supabase';
import CreatorGrid from '@/components/CreatorGrid';
import { categoryFaqs } from '@/lib/faqs';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return {};
  const title = `${cat.label} American OnlyFans Creators — Best American ${cat.label} OnlyFans`;
  const desc  = `Find the best ${cat.label} OnlyFans creators from United States. Browse verified American ${cat.label.toLowerCase()} creators sorted by popularity. Updated daily.`;
  const url   = `${SITE_URL}/categories/${slug}/`;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, images: [{ url: `${SITE_URL}/categories/${slug}/opengraph-image` }] },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const { creators, total, hasMore } = await fetchCreators({
    categoryTerms: cat.terms.length > 0 ? cat.terms : undefined,
    price: cat.priceFilter,
    skipLocationFilter: true,
    pageSize: 24,
    sort: 'popular',
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
      { '@type': 'ListItem', position: 2, name: 'Categories', item: `${SITE_URL}/categories/` },
      { '@type': 'ListItem', position: 3, name: cat.label, item: `${SITE_URL}/categories/${slug}/` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

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
              Best <span className="gradient-accent">{cat.label}</span> American OnlyFans
            </h1>
            <p className="display-sub" style={{ margin: '0 0 0.5rem', maxWidth: 720 }}>
              Discover the top American {cat.label.toLowerCase()} OnlyFans creators. All profiles are verified American creators —
              browse, filter and find your perfect American {cat.label.toLowerCase()} creator below.
            </p>
            <div className="detail-hero-meta">
              <span className="detail-hero-meta-item"><strong>{total.toLocaleString()}</strong> {cat.label.toLowerCase()} creators</span>
              <span className="detail-hero-meta-item">🇺🇸 100% American</span>
              <span className="detail-hero-meta-item">🔄 Updated daily</span>
            </div>
          </div>
        </section>

        <CreatorGrid
          initialCreators={creators}
          initialTotal={total}
          initialHasMore={hasMore}
          categoryTerms={cat.terms.length > 0 ? cat.terms : undefined}
          price={cat.priceFilter}
          skipLocationFilter
          pageSize={24}
        />


        {/* FAQ */}
        <section className="faq-section">
          <h2 className="faq-heading">Frequently Asked Questions</h2>
          <dl className="faq-list">
            {faqs.map((f, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">{f.q}</summary>
                <dd className="faq-answer">{f.a}</dd>
              </details>
            ))}
          </dl>
        </section>

        {/* Browse by State — links to real state pages */}
        <section style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem' }}>
          <div className="section-rail">
            <h2 className="section-rail-title">Browse American OnlyFans by State</h2>
            <Link href="/onlyfans-search" className="section-rail-link">All creators →</Link>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1rem' }}>
            Explore American OnlyFans creators in every US state.
          </p>
          <div className="chips-row chips-row--wrap">
            {states.map(s => (
              <Link key={s.slug} href={`/${s.urlSlug}/`} className="location-chip">
                {s.abbr} — {s.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Explore Top US Cities — links to real city pages */}
        <section style={{ paddingTop: '1rem', paddingBottom: '2.5rem' }}>
          <div className="section-rail">
            <h2 className="section-rail-title">Explore Top US Cities</h2>
            <Link href="/onlyfans-search" className="section-rail-link">More cities →</Link>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1rem' }}>
            Discover American OnlyFans creators in the biggest US cities.
          </p>
          <div className="chips-row chips-row--wrap">
            {cities.slice(0, 24).map(c => (
              <Link key={c.slug} href={`/${c.urlSlug}/`} className="location-chip">
                {c.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

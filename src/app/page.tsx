import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchScopedCreators } from '@/lib/sponsorship';
import { states } from '@/config/states';
import { cities } from '@/config/cities';
import CreatorGrid from '@/components/CreatorGrid';
import CreatorGridSkeleton from '@/components/CreatorGridSkeleton';
import FAQ from '@/components/FAQ';
import CreatorSearchBox from '@/components/CreatorSearchBox';
import { homepageFaqs } from '@/lib/faqs';
import { Suspense } from 'react';

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com';

export const metadata: Metadata = {
  title: 'OnlyAmericanFans — Find the Best American OnlyFans Creators',
  description:
    'Discover top American OnlyFans creators sorted by popularity. Search by state, city and price. Thousands of verified US creators.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'OnlyAmericanFans — #1 American OnlyFans Search Engine',
    description: 'Find top US OnlyFans creators by state, city & price.',
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/og-default.svg`, width: 1200, height: 630 }],
  },
};

// US location terms for homepage feed
const US_TERMS = [
  'usa', 'us', 'united states', 'america', 'american',
  'new york', 'los angeles', 'chicago', 'houston', 'phoenix',
  'miami', 'dallas', 'san diego', 'las vegas', 'atlanta',
  'seattle', 'boston', 'denver', 'nashville', 'austin',
  'san francisco', 'philadelphia', 'portland', 'minneapolis',
  'california', 'texas', 'florida', 'new york state',
];

async function TrendingCreators() {
  const { creators, total, hasMore } = await fetchScopedCreators({
    scope: 'home',
    pageSize: 20,
    sort: 'popular',
    revalidate: 300,
    locationTerms: US_TERMS,
  });
  return (
    <CreatorGrid
      initialCreators={creators}
      initialTotal={total}
      initialHasMore={hasMore}
      locationTerms={US_TERMS}
      scope="home"
      pageSize={20}
      />
  );
}

const QUICK_TABS = [
  { label: 'All Creators', href: '/onlyfans-search' },
  { label: 'Free OnlyFans', href: '/onlyfans-search?price=free' },
  { label: 'Verified Only', href: '/onlyfans-search?verified=true' },
  { label: 'Newest Creators', href: '/onlyfans-search?sort=newest' },
];

const REVIEWS = [
  { text: "Found my favorite New York creator in under 30 seconds. The filters are actually useful!", author: "User from Los Angeles" },
  { text: "Finally a search site specifically for American creators. Much better than scrolling Reddit!", author: "Miami fan" },
  { text: "The state filter is brilliant. Found Texas creators I never knew existed.", author: "Chicago user" },
];

// Popular states to show on homepage (sample)
const POPULAR_STATES = states.slice(0, 20);

const POPULAR_CITIES = [
  'new-york',
  'los-angeles',
  'miami',
  'chicago',
  'las-vegas',
  'atlanta',
  'houston',
  'dallas',
  'seattle',
  'boston',
].flatMap((slug) => {
  const city = cities.find((candidate) => candidate.slug === slug);
  return city ? [city] : [];
});

export default async function HomePage() {
  return (
    <>
      {/* — Hero — */}
      <div className="page-container" style={{ paddingTop: '0.5rem' }}>
        <section className="hero-shell starfield">
          <div className="hero-shell-inner">
            <p className="eyebrow-pill">America&apos;s #1 OnlyFans Directory</p>
            <h1 className="display-h1 display-h1--lg">
              Find the Best <span className="gradient-accent">American</span> OnlyFans Creators
            </h1>
            <p className="display-sub">
              Search thousands of verified US creators by state, city and price.
              Updated daily with the latest profiles — 100% American, always.
            </p>

            <CreatorSearchBox />

            <div className="chip-rail">
              {QUICK_TABS.map(t => (
                <Link key={t.href} href={t.href} className="chip-glass">{t.label}</Link>
              ))}
            </div>

            <div style={{ marginTop: '2.25rem', display: 'flex', justifyContent: 'center' }}>
              <div className="glass-stats">
                <div className="glass-stat">
                  <div className="glass-stat-num">500K+</div>
                  <div className="glass-stat-label">US Creators</div>
                </div>
                <div className="glass-stat">
                  <div className="glass-stat-num">50</div>
                  <div className="glass-stat-label">States</div>
                </div>
                <div className="glass-stat">
                  <div className="glass-stat-num">Daily</div>
                  <div className="glass-stat-label">Updates</div>
                </div>
                <div className="glass-stat">
                  <div className="glass-stat-num">Free</div>
                  <div className="glass-stat-label">To Browse</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* — Trust strip — */}
      <div className="page-container">
        <div className="trust-strip">
          <span className="trust-item"><span className="trust-item-icon">✓</span> 100% Verified American Profiles</span>
          <span className="trust-item"><span className="trust-item-icon">✓</span> No Sign-Up Required</span>
          <span className="trust-item"><span className="trust-item-icon">✓</span> Updated Daily</span>
          <span className="trust-item"><span className="trust-item-icon">✓</span> 18+ Adults Only</span>
        </div>
      </div>

      {/* — Browse by State — */}
      <section className="page-container" style={{ paddingBottom: 0 }}>
        <div className="section-rail">
          <h2 className="section-rail-title">Browse by State</h2>
          <Link href="/browse-by-state" className="section-rail-link">View all 50 states →</Link>
        </div>
        <div className="chips-row chips-row--wrap">
          {POPULAR_STATES.map(s => (
            <Link key={s.slug} href={`/${s.urlSlug}`} className="chip-glass">
              <strong style={{ color: 'var(--accent-light)' }}>{s.abbr}</strong> {s.label}
            </Link>
          ))}
        </div>
      </section>

      {/* — Trending Creators — */}
      <section className="page-container" style={{ paddingTop: '1rem' }}>
        <div className="section-rail">
          <h2 className="section-rail-title">🔥 Trending Now</h2>
          <Link href="/onlyfans-search?sort=popular" className="section-rail-link">See all trending →</Link>
        </div>
        <Suspense fallback={<CreatorGridSkeleton />}>
          <TrendingCreators />
        </Suspense>
      </section>

      {/* — Popular Cities — */}
      <section className="page-container" style={{ paddingTop: '0.5rem' }}>
        <div className="section-rail">
          <h2 className="section-rail-title">Popular Cities</h2>
        </div>
        <div className="chips-row chips-row--wrap">
          {POPULAR_CITIES.map((city) => (
            <Link key={city.slug} href={`/${city.urlSlug}`} className="chip-glass">{city.label}</Link>
          ))}
        </div>
      </section>

      {/* — How it Works — */}
      <section className="page-container">
        <div className="section-rail">
          <h2 className="section-rail-title">How It Works</h2>
        </div>
        <div className="category-tile-grid">
          <div className="feature-card-2026">
            <span className="feature-num">01</span>
            <div className="feature-icon-2026">🔎</div>
            <h3 className="feature-title" style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Search or Browse</h3>
            <p className="feature-desc">Find creators by name, state or city — or explore curated categories.</p>
          </div>
          <div className="feature-card-2026">
            <span className="feature-num">02</span>
            <div className="feature-icon-2026">🎯</div>
            <h3 className="feature-title" style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Filter Results</h3>
            <p className="feature-desc">Narrow by price, verified status, free content, bundles and sort by popular or newest.</p>
          </div>
          <div className="feature-card-2026">
            <span className="feature-num">03</span>
            <div className="feature-icon-2026">⭐</div>
            <h3 className="feature-title" style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Visit Their Page</h3>
            <p className="feature-desc">Tap any card to jump straight to their official OnlyFans profile.</p>
          </div>
        </div>
      </section>

      {/* — Conversion strip — */}
      <div className="page-container">
        <div className="conversion-strip">
          <div className="conversion-strip-text">
            <h3>Ready to find your favorite American creator?</h3>
            <p>Use our advanced search to filter 500,000+ verified US creators by state, city, price, and more.</p>
          </div>
          <div className="conversion-strip-cta">
            <Link href="/onlyfans-search" className="btn-glow">Start Searching →</Link>
          </div>
        </div>
      </div>

      {/* — Social Proof — */}
      <section className="page-container" style={{ paddingBottom: '2rem' }}>
        <div className="section-rail">
          <h2 className="section-rail-title">Loved by American Fans</h2>
          <span className="section-rail-link" style={{ color: 'var(--text-muted)' }}>★★★★★ 4.9/5</span>
        </div>
        <div className="category-tile-grid">
          {REVIEWS.map((r, i) => (
            <div key={i} className="feature-card-2026">
              <div className="review-stars" style={{ color: '#fbbf24', marginBottom: '0.6rem', fontSize: '0.9rem', letterSpacing: '0.1em' }}>★★★★★</div>
              <p className="review-text" style={{ color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '0.85rem' }}>&ldquo;{r.text}&rdquo;</p>
              <p className="review-author" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>— {r.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* — FAQ — */}
      <section className="page-container" style={{ paddingBottom: '4rem' }}>
        <FAQ faqs={homepageFaqs} heading="Frequently Asked Questions" />
      </section>
    </>
  );
}

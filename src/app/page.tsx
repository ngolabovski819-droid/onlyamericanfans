import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchCreators } from '@/lib/supabase';
import { regions } from '@/config/regions';
import CreatorGrid from '@/components/CreatorGrid';
import CreatorGridSkeleton from '@/components/CreatorGridSkeleton';
import StatsBar from '@/components/StatsBar';
import { Suspense } from 'react';

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://onlybritishfans.com';

export const metadata: Metadata = {
  title: 'OnlyBritishFans — Find the Best British OnlyFans Creators',
  description:
    'Discover top British OnlyFans creators sorted by popularity. Search by city, region and price. Thousands of verified UK creators.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'OnlyBritishFans — #1 British OnlyFans Search Engine',
    description: 'Find top British OnlyFans creators by location & price.',
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/og-default.svg`, width: 1200, height: 630 }],
  },
};

// UK location terms for homepage feed
const UK_TERMS = [
  'uk', 'united kingdom', 'british', 'england', 'english',
  'london', 'manchester', 'birmingham', 'glasgow', 'liverpool',
  'edinburgh', 'bristol', 'leeds', 'sheffield', 'cardiff',
  'newcastle', 'nottingham', 'southampton', 'leicester', 'brighton',
  'aberdeen', 'swansea', 'belfast', 'scotland', 'scottish',
  'wales', 'welsh', 'northern ireland',
];

async function TrendingCreators() {
  const { creators, total, hasMore } = await fetchCreators({ pageSize: 20, sort: 'popular', revalidate: 300, locationTerms: UK_TERMS });
  return (
    <CreatorGrid
      initialCreators={creators}
      initialTotal={total}
      initialHasMore={hasMore}
      locationTerms={UK_TERMS}
      />
  );
}

const QUICK_TABS = [
  { label: 'All Creators', href: '/search' },
  { label: 'Free OnlyFans', href: '/search?price=free' },
  { label: 'Verified Only', href: '/search?verified=true' },
  { label: 'Newest Creators', href: '/search?sort=newest' },
];

const REVIEWS = [
  { text: "Found my favourite London creator in under 30 seconds. The filters are actually useful!", author: "User from Manchester" },
  { text: "Finally a search site specifically for British creators. Much better than scrolling Reddit!", author: "Edinburgh fan" },
  { text: "The location filter is brilliant. Found Birmingham creators I never knew existed.", author: "Bristol user" },
];

export default async function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <p className="hero-eyebrow">🇬🇧 Britain&apos;s #1 OnlyFans Directory</p>
        <h1 className="hero-title">
          Find the Best{' '}
          <span className="hero-title-gradient">British OnlyFans</span>{' '}
          Creators
        </h1>
        <p className="hero-subtitle">
          Search thousands of verified UK creators by location and price.
          Updated daily with the latest profiles.
        </p>

        {/* Hero search */}
        <form action="/search" method="GET">
          <div className="hero-search">
            <input
              type="text"
              name="q"
              className="hero-search-input"
              placeholder="Search by name, city or keyword…"
              aria-label="Search creators"
            />
            <button type="submit" className="hero-search-btn">Search</button>
          </div>
        </form>

        {/* Quick tabs */}
        <div className="hero-quick-tabs">
          {QUICK_TABS.map(t => (
            <Link key={t.href} href={t.href} className="hero-quick-tab">{t.label}</Link>
          ))}
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <StatsBar />

      {/* ── Browse by Region ── */}
      <section style={{ padding: '2.5rem 1.5rem 0', maxWidth: 1400, margin: '0 auto' }}>
        <h2 className="section-heading">Browse by UK Region</h2>
        <div className="chips-row chips-row--wrap">
          {regions.map(r => (
            <Link key={r.slug} href={`/${r.urlSlug}/`} className="location-chip location-chip--state">
              {r.abbr} — {r.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trending Creators ── */}
      <section style={{ padding: '2.5rem 1.5rem', maxWidth: 1400, margin: '0 auto' }}>
        <h2 className="section-heading">🔥 Trending British Creators</h2>
        <Suspense fallback={<CreatorGridSkeleton />}>
          <TrendingCreators />
        </Suspense>
      </section>

      {/* ── Popular Cities ── */}
      <section style={{ padding: '0 1.5rem 3rem', maxWidth: 1400, margin: '0 auto' }}>
        <h2 className="section-heading">Popular Cities</h2>
        <div className="chips-row chips-row--wrap">
          {[
            { label: 'London OnlyFans', href: '/london-onlyfans/' },
            { label: 'Manchester OnlyFans', href: '/manchester-onlyfans/' },
            { label: 'Birmingham OnlyFans', href: '/birmingham-onlyfans/' },
            { label: 'Glasgow OnlyFans', href: '/glasgow-onlyfans/' },
            { label: 'Liverpool OnlyFans', href: '/liverpool-onlyfans/' },
            { label: 'Edinburgh OnlyFans', href: '/edinburgh-onlyfans/' },
            { label: 'Bristol OnlyFans', href: '/bristol-onlyfans/' },
            { label: 'Cardiff OnlyFans', href: '/cardiff-onlyfans/' },
          ].map(c => (
            <Link key={c.href} href={c.href} className="location-chip">{c.label}</Link>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="how-it-works">
        <h2 className="how-it-works-title">How OnlyBritishFans Works</h2>
        <p className="how-it-works-sub">Finding your favourite British creator is quick and easy.</p>
        <div className="how-it-works-steps">
          <div className="how-step">
            <div className="how-step-num">01</div>
            <h3>Search or Browse</h3>
            <p>Use our search bar or browse by region or city to find creators.</p>
          </div>
          <div className="how-step">
            <div className="how-step-num">02</div>
            <h3>Filter Results</h3>
            <p>Narrow down by price, verified status, content type and more with our advanced filters.</p>
          </div>
          <div className="how-step">
            <div className="how-step-num">03</div>
            <h3>Visit Their Page</h3>
            <p>Click any creator card to visit their official OnlyFans profile and subscribe.</p>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="social-proof">
        <h2 className="social-proof-title">Loved by British Fans</h2>
        <p className="social-proof-rating">⭐⭐⭐⭐⭐  4.9 out of 5 from fan reviews</p>
        <div className="review-grid">
          {REVIEWS.map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-stars">★★★★★</div>
              <p className="review-text">"{r.text}"</p>
              <p className="review-author">— {r.author}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchCreators } from '@/lib/supabase';
import { regions } from '@/config/regions';
import { cities } from '@/config/cities';
import CreatorGrid from '@/components/CreatorGrid';
import StatsBar from '@/components/StatsBar';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://onlybritishfans.com';

export const metadata: Metadata = {
  title: 'British OnlyFans Search Engine — Find UK Creators by City & Region',
  description:
    'The best British OnlyFans search engine. Browse thousands of verified UK creators by city and region. London, Manchester, Glasgow, Birmingham and more.',
  alternates: { canonical: `${SITE_URL}/onlyfans-search/` },
  openGraph: {
    title: 'British OnlyFans Search Engine',
    description: 'Find verified UK OnlyFans creators by city & price.',
    url: `${SITE_URL}/onlyfans-search/`,
  },
};

const POPULAR_CITIES = ['london', 'manchester', 'birmingham', 'glasgow', 'liverpool', 'edinburgh', 'bristol', 'cardiff'];

export default async function OnlyFansSearchPage() {
  const { creators, total, hasMore } = await fetchCreators({ pageSize: 20, sort: 'popular', revalidate: 3600 });

  return (
    <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
        British OnlyFans Search Engine
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 700, marginBottom: '2rem', lineHeight: 1.7 }}>
        Welcome to OnlyBritishFans — the UK&apos;s leading directory of British OnlyFans creators.
        Search by city or region and filter by price to find your perfect British creator.
      </p>

      <StatsBar />

      <section style={{ margin: '2.5rem 0' }}>
        <h2 className="section-heading">Browse by Region</h2>
        <div className="chips-row chips-row--wrap">
          {regions.map(r => (
            <Link key={r.slug} href={`/${r.urlSlug}/`} className="location-chip location-chip--state">
              <strong style={{ color: 'var(--accent-light)', marginRight: 4 }}>{r.abbr}</strong>
              {r.label}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ margin: '2.5rem 0' }}>
        <h2 className="section-heading">Popular Cities</h2>
        <div className="chips-row chips-row--wrap">
          {cities.filter(c => POPULAR_CITIES.includes(c.slug)).map(c => (
            <Link key={c.slug} href={`/${c.urlSlug}/`} className="location-chip">
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ margin: '2.5rem 0' }}>
        <h2 className="section-heading">All British Creators</h2>
        <CreatorGrid
          initialCreators={creators}
          initialTotal={total}
          initialHasMore={hasMore}
          />
      </section>

      {/* SEO text block */}
      <section style={{ marginTop: '3rem', padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', maxWidth: 800 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-light)' }}>
          About OnlyBritishFans
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          OnlyBritishFans is Britain&apos;s dedicated OnlyFans search engine, helping fans discover
          British content creators quickly and easily. Our platform is built specifically for finding
          UK OnlyFans creators — from London, Manchester, Birmingham, Glasgow, Liverpool and everywhere in between.
        </p>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>
          Our database is updated regularly with new British creators. Use our advanced filters to find
          verified creators, free OnlyFans pages, or creators in your local city.
        </p>
      </section>
    </div>
  );
}
import type { Metadata } from 'next';
import Link from 'next/link';
import { categories } from '@/config/categories';

export const metadata: Metadata = {
  title: 'OnlyFans Categories — Browse American Creators | OnlyAmericanFans',
  description:
    'Browse all American OnlyFans categories — MILF, BBW, teen, latina, ebony, fitness, trans, free and more. Find the perfect American creator for every taste.',
  alternates: { canonical: 'https://www.onlyamericanfans.com/categories/' },
};

const SITE_URL = 'https://www.onlyamericanfans.com';

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Categories', item: `${SITE_URL}/categories/` },
  ],
};

// ── Section definitions ────────────────────────────────────────────────────
const SECTIONS: { heading: string; emoji: string; slugs: string[] }[] = [
  {
    heading: 'Most Popular',
    emoji: '🔥',
    slugs: ['milf', 'bbw', 'teen', 'latina', 'asian', 'ebony', 'blonde', 'trans', 'lesbian', 'free', 'fitness', 'petite'],
  },
  {
    heading: 'By Appearance',
    emoji: '💅',
    slugs: ['busty', 'curvy', 'athletic', 'natural', 'redhead', 'brunette', 'tattoo'],
  },
  {
    heading: 'By Ethnicity',
    emoji: '🌏',
    slugs: ['asian', 'latina', 'ebony', 'indian'],
  },
  {
    heading: 'By Age',
    emoji: '⏳',
    slugs: ['teen', 'milf', 'mature'],
  },
  {
    heading: 'Gender & Identity',
    emoji: '🏳️‍🌈',
    slugs: ['trans', 'lesbian', 'femboy', 'couples'],
  },
  {
    heading: 'Content Type',
    emoji: '🎬',
    slugs: ['amateur', 'bdsm', 'feet', 'goth', 'cosplay', 'model', 'nurse', 'teacher', 'gfe', 'joi', 'pov', 'asmr', 'squirt'],
  },
  {
    heading: 'Special Deals',
    emoji: '🆓',
    slugs: ['free', 'milf-free'],
  },
];

// Build a lookup map
const catMap = Object.fromEntries(categories.map((c) => [c.slug, c]));

// Colour palette cycling for section accents
const SECTION_COLOURS = [
  { border: 'rgba(236,72,153,0.35)', glow: 'rgba(236,72,153,0.07)', dot: '#ec4899' },
  { border: 'rgba(124,58,237,0.35)', glow: 'rgba(124,58,237,0.07)', dot: '#9d5cf7' },
  { border: 'rgba(34,197,94,0.35)',  glow: 'rgba(34,197,94,0.07)',  dot: '#22c55e' },
  { border: 'rgba(251,146,60,0.35)', glow: 'rgba(251,146,60,0.07)', dot: '#fb923c' },
  { border: 'rgba(56,189,248,0.35)', glow: 'rgba(56,189,248,0.07)', dot: '#38bdf8' },
  { border: 'rgba(167,139,250,0.35)',glow: 'rgba(167,139,250,0.07)',dot: '#a78bfa' },
  { border: 'rgba(34,197,94,0.35)',  glow: 'rgba(34,197,94,0.07)',  dot: '#22c55e' },
];

export default function CategoriesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="page-container" style={{ paddingTop: '0.5rem', paddingBottom: '4rem' }}>
        {/* Hero */}
        <section className="hero-shell hero-shell--compact starfield">
          <div className="hero-shell-inner">
            <nav aria-label="Breadcrumb" style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
              <span>›</span>
              <span style={{ color: 'var(--accent-light)' }}>Categories</span>
            </nav>
            <p className="eyebrow-pill">{categories.length} Categories</p>
            <h1 className="display-h1">
              Browse <span className="gradient-accent">All</span> Categories
            </h1>
            <p className="display-sub">
              From MILF and BBW to free OnlyFans and fitness creators — find exactly the type of American creator you&apos;re looking for.
            </p>
            {/* Quick-jump pills */}
            <div className="chip-rail" style={{ marginTop: '0.5rem' }}>
              {SECTIONS.map((s) => {
                const id = s.heading.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                return (
                  <a key={s.heading} href={`#${id}`} className="chip-glass">
                    <span>{s.emoji}</span> {s.heading}
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sections as glass tiles */}
        {SECTIONS.map((section, si) => {
          const colour = SECTION_COLOURS[si % SECTION_COLOURS.length];
          const items = section.slugs.map((s) => catMap[s]).filter(Boolean);
          if (!items.length) return null;
          const sectionId = section.heading.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const tint = colour.glow.replace('0.07', '0.14');

          return (
            <section key={section.heading} id={sectionId} style={{ marginTop: '2.5rem' }}>
              <div className="section-rail">
                <h2 className="section-rail-title">
                  <span style={{ marginRight: 4 }}>{section.emoji}</span> {section.heading}
                </h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{items.length} categories</span>
              </div>
              <div className="category-tile" style={{ ['--tile-tint' as string]: tint } as React.CSSProperties}>
                <div className="category-tile-chips">
                  {items.map((cat) => (
                    <Link key={cat.slug} href={`/categories/${cat.slug}`} className="chip-glass">
                      {cat.emoji && <span>{cat.emoji}</span>} {cat.label}
                      {cat.priceFilter === 'free' && (
                        <span style={{ marginLeft: 6, fontSize: '0.6rem', fontWeight: 800, padding: '1px 6px', borderRadius: 99, background: 'rgba(34,197,94,0.2)', color: '#4ade80', letterSpacing: '0.06em' }}>FREE</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* All categories A–Z */}
        <section style={{ marginTop: '3rem' }}>
          <div className="section-rail">
            <h2 className="section-rail-title">📋 All Categories A–Z</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{categories.length} total</span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: '0.5rem',
          }}>
            {[...categories]
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((cat) => (
                <Link key={cat.slug} href={`/categories/${cat.slug}`} className="cat-card-subtle">
                  <span>{cat.label}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.45 }}>
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
          </div>
        </section>

        {/* Conversion strip */}
        <div className="conversion-strip" style={{ marginTop: '3rem' }}>
          <div className="conversion-strip-text">
            <h3>Can&apos;t find the right category?</h3>
            <p>Use our advanced search with custom filters to combine categories, locations and price ranges.</p>
          </div>
          <div className="conversion-strip-cta">
            <Link href="/onlyfans-search" className="btn-glow">Advanced Search →</Link>
          </div>
        </div>
      </div>

      <style>{`
        .cat-card-subtle {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.65rem 0.9rem;
          border-radius: var(--radius);
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-subtle);
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
          transition: all 0.18s;
          text-decoration: none;
        }
        .cat-card-subtle:hover {
          background: rgba(200,16,46,0.08);
          border-color: var(--accent);
          color: #fff;
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
}

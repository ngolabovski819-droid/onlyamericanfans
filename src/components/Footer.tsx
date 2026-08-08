import Link from 'next/link';
import { states } from '@/config/states';
import { popularCategories } from '@/config/categories';

// The four largest US states by population, plus a hand-picked set of less-trafficked ones —
// this is a sitewide footer, so it's a good place to spread internal link equity to pages
// (Alaska, Montana, Hawaii, New Mexico) that don't get many other internal links otherwise.
const FOOTER_STATE_SLUGS = [
  'california', 'texas', 'florida', 'new-york',
  'alaska', 'montana', 'new-mexico', 'arizona', 'hawaii', 'pennsylvania', 'illinois', 'ohio',
];

export default function Footer() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer footer-wrapper">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand column */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo">OnlyAmericanFans</Link>
            <p className="footer-tagline">
              America&apos;s largest OnlyFans creator directory. Find free and premium American creators updated daily.
            </p>
            <p className="footer-disclaimer">
              onlyamericanfans.com is not affiliated with or endorsed by OnlyFans or Fenix International Limited.
              All profiles linked are publicly listed. This site is for adults 18+ only.
            </p>
          </div>

          {/* States */}
          <div className="footer-col">
            <h3 className="footer-heading">Browse by State</h3>
            <ul className="footer-list">
              {FOOTER_STATE_SLUGS.map((slug) => {
                const s = states.find((st) => st.slug === slug);
                if (!s) return null;
                return (
                  <li key={s.slug}>
                    <Link href={`/${s.urlSlug}/`} className="footer-link">
                      {s.label} ({s.abbr})
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link href="/browse-by-state/" className="footer-link">Browse all states →</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h3 className="footer-heading">Top Categories</h3>
            <ul className="footer-list">
              {popularCategories.slice(0, 8).map((c) => (
                <li key={c.slug}>
                  <Link href={`/categories/${c.slug}/`} className="footer-link">
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/categories/" className="footer-link">All Categories →</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-col">
            <h3 className="footer-heading">Information</h3>
            <ul className="footer-list">
              <li><Link href="/about" className="footer-link">About Us</Link></li>
              <li><Link href="/blog" className="footer-link">Blog</Link></li>
              <li><Link href="/onlyfans-search" className="footer-link">Search Creators</Link></li>
              <li><Link href="/promote" className="footer-link">Promote Your OnlyFans</Link></li>
              <li><Link href="/contact" className="footer-link">Contact</Link></li>
            </ul>
            <h3 className="footer-heading" style={{ marginTop: '1rem' }}>Legal</h3>
            <ul className="footer-list">
              <li><Link href="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link href="/terms" className="footer-link">Terms of Use</Link></li>
              <li><Link href="/dmca" className="footer-link">DMCA / Takedowns</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} OnlyAmericanFans. All rights reserved.</p>
          <p className="footer-compliance">
            This website contains adult content and is intended for persons aged 18 and over.
            By using this site you confirm you are 18+.{' '}
            <Link href="/privacy" className="footer-link">Privacy Policy</Link> |{' '}
            <Link href="/terms" className="footer-link">Terms of Use</Link>
          </p>
          <p className="footer-hreflang">
            <link rel="alternate" hrefLang="en-US" href={siteUrl} />
          </p>
        </div>
      </div>
    </footer>
  );
}

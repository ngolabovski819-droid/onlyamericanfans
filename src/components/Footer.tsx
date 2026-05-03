import Link from 'next/link';
import { regions } from '@/config/regions';
import { cities } from '@/config/cities';

const TOP_CITIES = cities.slice(0, 8);

export default function Footer() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://onlybritishfans.com';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand column */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo">🇬🇧 OnlyBritishFans</Link>
            <p className="footer-tagline">
              Britain&apos;s largest OnlyFans creator directory. Find free and premium UK creators updated daily.
            </p>
            <p className="footer-disclaimer">
              OnlyBritishFans.com is not affiliated with or endorsed by OnlyFans or Fenix International Limited.
              All profiles linked are publicly listed. This site is for adults 18+ only.
            </p>
          </div>

          {/* Regions */}
          <div className="footer-col">
            <h3 className="footer-heading">Browse by Region</h3>
            <ul className="footer-list">
              {regions.map((r) => (
                <li key={r.slug}>
                  <Link href={`/${r.urlSlug}/`} className="footer-link">
                    {r.label} ({r.abbr})
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Cities */}
          <div className="footer-col">
            <h3 className="footer-heading">Top Cities</h3>
            <ul className="footer-list">
              {TOP_CITIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.urlSlug}/`} className="footer-link">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-col">
            <h3 className="footer-heading">Information</h3>
            <ul className="footer-list">
              <li><Link href="/about" className="footer-link">About Us</Link></li>
              <li><Link href="/blog" className="footer-link">Blog</Link></li>
              <li><Link href="/search" className="footer-link">Search Creators</Link></li>
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
          <p>© {currentYear} OnlyBritishFans. All rights reserved.</p>
          <p className="footer-compliance">
            This website contains adult content and is intended for persons aged 18 and over.
            By using this site you confirm you are 18+.{' '}
            <Link href="/privacy" className="footer-link">Privacy Policy</Link> |{' '}
            <Link href="/terms" className="footer-link">Terms of Use</Link>
          </p>
          <p className="footer-hreflang">
            <link rel="alternate" hrefLang="en-GB" href={siteUrl} />
          </p>
        </div>
      </div>
    </footer>
  );
}
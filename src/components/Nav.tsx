'use client';

import { useState } from 'react';
import Link from 'next/link';
import { regions } from '@/config/regions';
import { cities } from '@/config/cities';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Search', href: '/search' },
];

const POPULAR_CITIES = cities.slice(0, 8);

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [regionsOpen, setRegionsOpen] = useState(false);

  return (
    <header className="nav-wrapper">
      {/* Row 1 — logo + main links */}
      <div className="nav-row1">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-flag">🇬🇧</span>
          <span className="nav-logo-text">OnlyBritishFans</span>
        </Link>

        {/* Desktop nav */}
        <nav className="nav-desktop">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}

          {/* Regions dropdown */}
          <div
            className="nav-dropdown-wrap"
            onMouseEnter={() => setRegionsOpen(true)}
            onMouseLeave={() => setRegionsOpen(false)}
          >
            <button className="nav-link nav-dropdown-btn">
              Regions ▾
            </button>
            {regionsOpen && (
              <div className="nav-dropdown">
                {regions.map((r) => (
                  <Link key={r.slug} href={`/${r.urlSlug}/`} className="nav-dropdown-item">
                    <span className="nav-dropdown-abbr">{r.abbr}</span>
                    {r.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/blog" className="nav-link">Blog</Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="nav-mobile">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="nav-mobile-section">Regions</div>
          {regions.map((r) => (
            <Link key={r.slug} href={`/${r.urlSlug}/`} className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
              {r.abbr} — {r.label}
            </Link>
          ))}
          <div className="nav-mobile-section">Cities</div>
          {POPULAR_CITIES.map((c) => (
            <Link key={c.slug} href={`/${c.urlSlug}/`} className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
              {c.label}
            </Link>
          ))}
          <Link href="/blog" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Blog</Link>
        </div>
      )}
    </header>
  );
}
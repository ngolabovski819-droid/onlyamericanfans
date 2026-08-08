'use client';

import { useState } from 'react';
import Link from 'next/link';
import { states } from '@/config/states';
import { popularCategories } from '@/config/categories';
import HeaderCreatorSearch from './HeaderCreatorSearch';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Search', href: '/onlyfans-search' },
];

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [statesOpen, setStatesOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [mobileStatesOpen, setMobileStatesOpen] = useState(false);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);

  // Collapsed every time the mobile menu itself closes — whether via the hamburger toggle or a
  // link navigating away — so it never reopens mid-expanded. Done here (event handlers) rather
  // than an effect keyed off mobileOpen, since setState directly inside an effect body is the
  // pattern the lint rule (react-hooks/set-state-in-effect) flags.
  function closeMobileMenu() {
    setMobileOpen(false);
    setMobileStatesOpen(false);
    setMobileCatsOpen(false);
  }

  function toggleMobileMenu() {
    setMobileOpen((v) => {
      const next = !v;
      if (!next) {
        setMobileStatesOpen(false);
        setMobileCatsOpen(false);
      }
      return next;
    });
  }

  return (
    <header className="nav-wrapper">
      {/* Row 1 — logo + main links */}
      <div className="nav-row1">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-flag">🇺🇸</span>
          <span className="nav-logo-text">OnlyAmericanFans</span>
        </Link>

        <HeaderCreatorSearch />

        {/* Desktop nav */}
        <nav className="nav-desktop">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}

          {/* States dropdown */}
          <div
            className="nav-dropdown-wrap"
            onMouseEnter={() => setStatesOpen(true)}
            onMouseLeave={() => setStatesOpen(false)}
          >
            <button className="nav-link nav-dropdown-btn">
              States ▾
            </button>
            {statesOpen && (
              <div className="nav-dropdown nav-dropdown--states">
                {states.map((s) => (
                  <Link key={s.slug} href={`/${s.urlSlug}`} className="nav-dropdown-item">
                    <span className="nav-dropdown-abbr">{s.abbr}</span>
                    {s.label}
                  </Link>
                ))}
                <Link href="/browse-by-state" className="nav-dropdown-item nav-dropdown-item--all">
                  View All States →
                </Link>
              </div>
            )}
          </div>

          {/* Categories dropdown */}
          <div
            className="nav-dropdown-wrap"
            onMouseEnter={() => setCatsOpen(true)}
            onMouseLeave={() => setCatsOpen(false)}
          >
            <button className="nav-link nav-dropdown-btn">
              Categories ▾
            </button>
            {catsOpen && (
              <div className="nav-dropdown nav-dropdown--wide">
                {popularCategories.map((c) => (
                  <Link key={c.slug} href={`/categories/${c.slug}`} className="nav-dropdown-item">
                    {c.emoji && <span>{c.emoji} </span>}
                    {c.label}
                  </Link>
                ))}
                <Link href="/categories" className="nav-dropdown-item nav-dropdown-item--all">
                  View All Categories →
                </Link>
              </div>
            )}
          </div>

          <Link href="/blog" className="nav-link">Blog</Link>
          <Link href="/promote" className="nav-link nav-link--promote">Promote Your OnlyFans</Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          aria-label="Toggle menu"
          onClick={toggleMobileMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="nav-mobile">
          <HeaderCreatorSearch mobile onNavigate={closeMobileMenu} />
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-mobile-link" onClick={closeMobileMenu}>
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            className="nav-mobile-section nav-mobile-section--toggle"
            onClick={() => setMobileStatesOpen((v) => !v)}
            aria-expanded={mobileStatesOpen}
          >
            States
            <span className="nav-mobile-chevron">{mobileStatesOpen ? '−' : '+'}</span>
          </button>
          {mobileStatesOpen && (
            <>
              {states.map((s) => (
                <Link key={s.slug} href={`/${s.urlSlug}`} className="nav-mobile-link" onClick={closeMobileMenu}>
                  {s.abbr} — {s.label}
                </Link>
              ))}
              <Link href="/browse-by-state" className="nav-mobile-link nav-mobile-link--all" onClick={closeMobileMenu}>
                View All States →
              </Link>
            </>
          )}

          <button
            type="button"
            className="nav-mobile-section nav-mobile-section--toggle"
            onClick={() => setMobileCatsOpen((v) => !v)}
            aria-expanded={mobileCatsOpen}
          >
            Categories
            <span className="nav-mobile-chevron">{mobileCatsOpen ? '−' : '+'}</span>
          </button>
          {mobileCatsOpen && (
            <>
              {popularCategories.map((c) => (
                <Link key={c.slug} href={`/categories/${c.slug}`} className="nav-mobile-link" onClick={closeMobileMenu}>
                  {c.emoji} {c.label}
                </Link>
              ))}
              <Link href="/categories" className="nav-mobile-link nav-mobile-link--all" onClick={closeMobileMenu}>
                View All Categories →
              </Link>
            </>
          )}
          <Link href="/blog" className="nav-mobile-link" onClick={closeMobileMenu}>Blog</Link>
          <Link href="/promote" className="nav-mobile-link nav-link--promote" onClick={closeMobileMenu}>Promote Your OnlyFans</Link>
        </div>
      )}
    </header>
  );
}

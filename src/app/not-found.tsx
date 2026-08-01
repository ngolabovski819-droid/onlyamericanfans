import Link from 'next/link';
import { regions } from '@/config/regions';

export default function NotFound() {
  return (
    <div className="page-container">
      <div className="notfound-shell">
        <div className="notfound-code-2026">404</div>
        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 520, marginBottom: '2rem', fontSize: '1rem' }}>
          This creator or page doesn&apos;t exist. Try browsing by region or head back home:
        </p>
        <div className="chip-rail" style={{ marginBottom: '2rem' }}>
          {regions.map(r => (
            <Link key={r.slug} href={`/${r.urlSlug}/`} className="chip-glass">
              <strong style={{ color: 'var(--accent-light)' }}>{r.abbr}</strong> {r.label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/" className="btn-glow">Back to Home</Link>
          <Link href="/onlyfans-search" className="btn-glow btn-glow--ghost">Advanced Search</Link>
        </div>
      </div>
    </div>
  );
}

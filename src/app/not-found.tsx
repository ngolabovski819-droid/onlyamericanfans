import Link from 'next/link';
import { regions } from '@/config/regions';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-code">404</div>
      <h1>Page Not Found</h1>
      <p>This creator or page doesn&apos;t exist. Try browsing by region:</p>
      <div className="not-found-states">
        {regions.map(r => (
          <Link key={r.slug} href={`/${r.urlSlug}/`} className="location-chip location-chip--state">
            {r.label}
          </Link>
        ))}
      </div>
      <Link href="/" className="btn btn--primary">Back to Home</Link>
    </div>
  );
}

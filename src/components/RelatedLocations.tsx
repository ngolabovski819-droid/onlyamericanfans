import Link from 'next/link';
import { regions } from '@/config/regions';
import { cities } from '@/config/cities';

interface Props {
  mode: 'state-to-cities' | 'city-to-siblings' | 'state-chips';
  stateSlug?: string;
  citySlug?: string;
  stateLabel?: string;
  currentSlug?: string;
  parentStateLabel?: string;
  parentStateUrlSlug?: string;
}

export default function RelatedLocations({ mode, stateSlug, citySlug }: Props) {
  if (mode === 'state-chips') {
    return (
      <div className="related-chips-wrap">
        <h2 className="related-chips-heading">Browse by Region</h2>
        <div className="chips-row">
          {regions.map((r) => (
            <Link key={r.slug} href={`/${r.urlSlug}/`} className="location-chip">
              {r.abbr} — {r.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'state-to-cities' && stateSlug) {
    const regionCities = cities.filter((c) => c.parentRegion === stateSlug);
    if (!regionCities.length) return null;
    return (
      <div className="related-chips-wrap">
        <h2 className="related-chips-heading">Browse Cities in This Region</h2>
        <div className="chips-row">
          {regionCities.map((c) => (
            <Link key={c.slug} href={`/${c.urlSlug}/`} className="location-chip">
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'city-to-siblings' && citySlug) {
    const city = cities.find((c) => c.slug === citySlug);
    if (!city) return null;
    const parent = regions.find((r) => r.slug === city.parentRegion);
    const siblings = city.relatedCities
      .map((s) => cities.find((c) => c.slug === s))
      .filter(Boolean) as typeof cities;

    return (
      <div className="related-chips-wrap">
        {parent && (
          <>
            <h2 className="related-chips-heading">Browse {parent.label}</h2>
            <div className="chips-row" style={{ marginBottom: '0.75rem' }}>
              <Link href={`/${parent.urlSlug}/`} className="location-chip location-chip--state">
                All {parent.label} ({parent.abbr})
              </Link>
            </div>
          </>
        )}
        {siblings.length > 0 && (
          <>
            <h3 className="related-chips-subheading">Related Cities</h3>
            <div className="chips-row">
              {siblings.map((c) => (
                <Link key={c.slug} href={`/${c.urlSlug}/`} className="location-chip">
                  {c.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}
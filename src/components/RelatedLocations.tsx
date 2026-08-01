import Link from 'next/link';
import { states } from '@/config/states';
import { cities } from '@/config/cities';
import { regions } from '@/config/regions';
import { popularCategories } from '@/config/categories';

interface Props {
  mode: 'state-to-cities' | 'city-to-siblings' | 'state-context' | 'region-to-cities' | 'region-chips';
  stateSlug?: string;
  citySlug?: string;
  regionSlug?: string;
  stateLabel?: string;
  currentSlug?: string;
  parentStateLabel?: string;
  parentStateUrlSlug?: string;
}

export default function RelatedLocations({ mode, stateSlug, citySlug, regionSlug }: Props) {
  if (mode === 'state-context' && stateSlug) {
    const currentState = states.find((state) => state.slug === stateSlug);
    if (!currentState) return null;
    const parentRegion = regions.find((region) => region.stateSlugs.includes(stateSlug));
    const neighbors = currentState.relatedStates
      .map((slug) => states.find((state) => state.slug === slug))
      .filter((state): state is (typeof states)[number] => Boolean(state));

    return (
      <div className="related-chips-wrap">
        <h2 className="related-chips-heading">Continue exploring from {currentState.label}</h2>
        {parentRegion && (
          <div className="chips-row" style={{ marginBottom: '0.75rem' }}>
            <Link href={`/${parentRegion.urlSlug}`} className="location-chip location-chip--state">
              {parentRegion.label} region
            </Link>
          </div>
        )}
        {neighbors.length > 0 && (
          <>
            <h3 className="related-chips-subheading">Neighboring state directories</h3>
            <div className="chips-row" style={{ marginBottom: '0.75rem' }}>
              {neighbors.map((state) => (
                <Link key={state.slug} href={`/${state.urlSlug}`} className="location-chip">
                  {state.abbr} — {state.label}
                </Link>
              ))}
            </div>
          </>
        )}
        <h3 className="related-chips-subheading">Popular creator categories</h3>
        <div className="chips-row">
          {popularCategories.slice(0, 8).map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="location-chip">
              {category.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'state-to-cities' && stateSlug) {
    const stateCities = cities.filter((c) => c.parentState === stateSlug);
    if (!stateCities.length) return null;
    return (
      <div className="related-chips-wrap">
        <h2 className="related-chips-heading">Browse Cities in This State</h2>
        <div className="chips-row">
          {stateCities.map((c) => (
            <Link key={c.slug} href={`/${c.urlSlug}`} className="location-chip">
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
    const parent = states.find((s) => s.slug === city.parentState);
    const siblings = city.relatedCities
      .map((s) => cities.find((c) => c.slug === s))
      .filter(Boolean) as typeof cities;

    return (
      <div className="related-chips-wrap">
        {parent && (
          <>
            <h2 className="related-chips-heading">Browse {parent.label}</h2>
            <div className="chips-row" style={{ marginBottom: '0.75rem' }}>
              <Link href={`/${parent.urlSlug}`} className="location-chip location-chip--state">
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
                <Link key={c.slug} href={`/${c.urlSlug}`} className="location-chip">
                  {c.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (mode === 'region-chips') {
    return (
      <div className="related-chips-wrap">
        <h2 className="related-chips-heading">Browse by Region</h2>
        <div className="chips-row">
          {regions.map((r) => (
            <Link key={r.slug} href={`/${r.urlSlug}`} className="location-chip">
              {r.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'region-to-cities' && regionSlug) {
    const region = regions.find((r) => r.slug === regionSlug);
    if (!region) return null;
    const regionCities = region.relatedCities
      .map((s) => cities.find((c) => c.slug === s))
      .filter(Boolean) as typeof cities;
    const relatedRegionsList = region.relatedRegions
      .map((s) => regions.find((r) => r.slug === s))
      .filter(Boolean) as typeof regions;

    return (
      <div className="related-chips-wrap">
        {regionCities.length > 0 && (
          <>
            <h2 className="related-chips-heading">Explore Cities in the {region.label}</h2>
            <div className="chips-row" style={{ marginBottom: '0.75rem' }}>
              {regionCities.map((c) => (
                <Link key={c.slug} href={`/${c.urlSlug}`} className="location-chip">
                  {c.label}
                </Link>
              ))}
            </div>
          </>
        )}
        {relatedRegionsList.length > 0 && (
          <>
            <h3 className="related-chips-subheading">Other Regions</h3>
            <div className="chips-row">
              {relatedRegionsList.map((r) => (
                <Link key={r.slug} href={`/${r.urlSlug}`} className="location-chip">
                  {r.label}
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

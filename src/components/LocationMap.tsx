import Link from 'next/link';
import { states } from '@/config/states';
import { cities, type CityConfig } from '@/config/cities';
import { stateCapitals } from '@/config/state-capitals';
import { buildStateMapProjection } from '@/lib/state-map';
import MapExpandModal from './MapExpandModal';

interface Props {
  stateSlug: string;
  /** Set on city pages — draws that one city larger, labeled, and non-clickable (it's the current page). */
  highlightCitySlug?: string;
}

const WIDTH = 320;
const HEIGHT = 380;

/**
 * Renders a state's real boundary (via us-atlas topojson + d3-geo, see src/lib/state-map.ts) with
 * a dot for every city we index there (src/config/cities.ts — colored, linked) plus the state
 * capital when it isn't already one of those (grey, unlinked — just a geographic reference point).
 * Pure server-side SVG: no map library shipped to the browser — hover states, glow and label
 * reveals are plain CSS. The only client JS involved is MapExpandModal's open/close toggle, which
 * reuses this exact same SVG markup at a larger size rather than rendering anything new.
 */
export default function LocationMap({ stateSlug, highlightCitySlug }: Props) {
  const state = states.find((s) => s.slug === stateSlug);
  if (!state) return null;

  const projection = buildStateMapProjection(state.label, WIDTH, HEIGHT);
  if (!projection) return null;

  const citiesInState = cities.filter((c) => c.parentState === stateSlug);
  const capital = stateCapitals[stateSlug];
  const highlighted = highlightCitySlug
    ? citiesInState.find((c) => c.slug === highlightCitySlug)
    : undefined;

  const capitalPoint = capital ? projection.project(capital.lat, capital.lng) : null;

  return (
    <MapExpandModal
      heading={`${state.abbr} Map`}
      ariaLabel={`map of ${state.label} showing OnlyFans creator cities we cover`}
    >
      <svg
        viewBox={`0 0 ${projection.viewBoxWidth} ${projection.viewBoxHeight}`}
        className="location-map-svg"
        role="img"
        aria-label={`Map of ${state.label} showing OnlyFans creator cities we cover`}
      >
        <path d={projection.outlineD} className="location-map-outline" />

        {capitalPoint && capital && (
          <circle
            cx={capitalPoint[0]}
            cy={capitalPoint[1]}
            r={4}
            className="location-map-dot location-map-dot--other"
          >
            <title>{`${capital.label} — state capital`}</title>
          </circle>
        )}

        {citiesInState.map((city) => {
          const point = projection.project(city.lat, city.lng);
          if (!point) return null;
          const isActive = city.slug === highlightCitySlug;
          return (
            <MapCityDot
              key={city.slug}
              city={city}
              x={point[0]}
              y={point[1]}
              active={isActive}
              viewBoxWidth={projection.viewBoxWidth}
            />
          );
        })}
      </svg>

      {highlighted ? (
        <p className="location-map-caption">
          📍 {highlighted.label}, {state.abbr}
        </p>
      ) : (
        <p className="location-map-hint">Hover a city to explore</p>
      )}

      <div className="location-map-legend">
        <span className="location-map-legend-item">
          <i className="location-map-legend-dot location-map-legend-dot--city" aria-hidden="true" />
          Cities we cover
        </span>
        {capital && (
          <span className="location-map-legend-item">
            <i className="location-map-legend-dot location-map-legend-dot--other" aria-hidden="true" />
            Other city
          </span>
        )}
      </div>
    </MapExpandModal>
  );
}

function MapCityDot({
  city,
  x,
  y,
  active,
  viewBoxWidth,
}: {
  city: CityConfig;
  x: number;
  y: number;
  active: boolean;
  viewBoxWidth: number;
}) {
  // Flip the label to the opposite side near the map's edges so it never clips out of the
  // viewBox (e.g. a city right at a state's easternmost tip).
  const labelOnLeft = x > viewBoxWidth * 0.62;
  const labelDx = labelOnLeft ? -12 : 12;
  const textAnchor = labelOnLeft ? 'end' : 'start';

  if (active) {
    return (
      <g>
        <circle cx={x} cy={y} r={10} className="location-map-dot-pulse" />
        <circle cx={x} cy={y} r={7} className="location-map-dot location-map-dot--active">
          <title>{`${city.label} — you are here`}</title>
        </circle>
        <text x={x + labelDx} y={y + 4} textAnchor={textAnchor} className="location-map-dot-label location-map-dot-label--active">
          {city.label}
        </text>
      </g>
    );
  }
  return (
    <Link href={`/${city.urlSlug}`} className="location-map-link" aria-label={`${city.label} OnlyFans`}>
      {/* Larger invisible hit-circle so the tap target beats the visible dot, per marker-accessibility guidance. */}
      <circle cx={x} cy={y} r={12} fill="transparent" />
      <circle cx={x} cy={y} r={5} className="location-map-dot location-map-dot--city">
        <title>{`${city.label} OnlyFans`}</title>
      </circle>
      {/* Hidden until hover/focus — pure CSS reveal, see .location-map-link:hover in globals.css. */}
      <text x={x + labelDx} y={y + 4} textAnchor={textAnchor} className="location-map-dot-label">
        {city.label}
      </text>
    </Link>
  );
}

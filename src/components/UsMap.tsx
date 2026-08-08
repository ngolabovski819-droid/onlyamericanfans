import Link from 'next/link';
import { states } from '@/config/states';
import { buildUsMapProjection } from '@/lib/state-map';
import MapExpandModal from './MapExpandModal';

/**
 * Full 50-state clickable map for /browse-by-state — same zero-JS-cost approach as
 * src/components/LocationMap.tsx (us-atlas + d3-geo computed once server-side into plain SVG),
 * reusing the same MapExpandModal for the fullscreen toggle. Every state is a real <Link> to its
 * page; hover reveals the state abbreviation via the same CSS-only label pattern as the city map.
 */
export default function UsMap() {
  const data = buildUsMapProjection();
  const stateByLabel = new Map(states.map((s) => [s.label, s]));

  return (
    <MapExpandModal
      heading="US Map"
      ariaLabel="map of the United States — click a state to browse its OnlyFans creators"
      cardClassName="location-map--us"
      modalMaxWidth={960}
    >
      <svg
        viewBox={`0 0 ${data.viewBoxWidth} ${data.viewBoxHeight}`}
        className="us-map-svg"
        role="img"
        aria-label="Map of the United States — click a state to browse its OnlyFans creators"
      >
        {data.statePaths.map(({ name, d, centroid }) => {
          const state = stateByLabel.get(name);
          if (!state) return null;
          return (
            <Link key={state.slug} href={`/${state.urlSlug}`} className="us-map-state-link" aria-label={`${state.label} OnlyFans`}>
              <path d={d} className="us-map-state">
                <title>{`${state.label} OnlyFans`}</title>
              </path>
              <text x={centroid[0]} y={centroid[1]} className="us-map-state-label">
                {state.abbr}
              </text>
            </Link>
          );
        })}
      </svg>
    </MapExpandModal>
  );
}

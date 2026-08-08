import { geoMercator, geoAlbersUsa, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import statesTopology from 'us-atlas/states-10m.json';

// us-atlas ships real US Census boundary data (public domain) at 10m resolution — this is the
// only accurate source of state outlines in the project; hand-drawing 50 state shapes from
// memory would be guesswork. It's ~110KB and is only ever imported by this server-only module,
// which runs at build time to emit plain SVG path strings — the topojson/d3-geo machinery itself
// never reaches the client bundle.
const STATES_FC = feature(
  statesTopology as unknown as Parameters<typeof feature>[0],
  (statesTopology as unknown as { objects: { states: Parameters<typeof feature>[1] } }).objects.states,
) as unknown as FeatureCollection;

let featuresByName: Map<string, Feature> | null = null;
function getFeatureByStateName(name: string): Feature | undefined {
  if (!featuresByName) {
    featuresByName = new Map(STATES_FC.features.map((f) => [f.properties?.name as string, f]));
  }
  return featuresByName.get(name);
}

export interface StateMapProjection {
  /** SVG path `d` attribute for the state's outline. */
  outlineD: string;
  viewBoxWidth: number;
  viewBoxHeight: number;
  /** Projects [lat, lng] to an [x, y] pixel pair inside the viewBox. Null if outside the map's usable area. */
  project: (lat: number, lng: number) => [number, number] | null;
}

const PADDING = 22;

/**
 * Builds a self-contained Mercator projection fitted to a single state's real boundary, plus a
 * ready-to-render outline path. Returns null for a state label us-atlas doesn't recognize (should
 * never happen for the 50 US states, but a config typo shouldn't crash a page render).
 */
export function buildStateMapProjection(
  stateLabel: string,
  width = 300,
  height = 380,
): StateMapProjection | null {
  const stateFeature = getFeatureByStateName(stateLabel);
  if (!stateFeature) return null;

  const projection: GeoProjection = geoMercator().fitExtent(
    [[PADDING, PADDING], [width - PADDING, height - PADDING]],
    stateFeature as unknown as Feature<Geometry>,
  );
  const pathGenerator = geoPath(projection);
  const outlineD = pathGenerator(stateFeature as unknown as Feature<Geometry>) ?? '';

  return {
    outlineD,
    viewBoxWidth: width,
    viewBoxHeight: height,
    project: (lat: number, lng: number) => {
      const projected = projection([lng, lat]);
      return projected ? [projected[0], projected[1]] : null;
    },
  };
}

export interface UsMapStatePath {
  /** Matches StateConfig.label exactly (us-atlas feature.properties.name) — join key back to src/config/states.ts. */
  name: string;
  d: string;
  /** Projected centroid, for placing a hover-reveal abbreviation label. */
  centroid: [number, number];
}

export interface UsMapProjection {
  viewBoxWidth: number;
  viewBoxHeight: number;
  statePaths: UsMapStatePath[];
}

/**
 * Builds the full 50-state map for src/app/browse-by-state — geoAlbersUsa (not geoMercator) is
 * the standard projection for this exact job: it composites the continental US with Alaska and
 * Hawaii relocated into the conventional lower-left inset boxes real US wall maps use, instead of
 * a literal Mercator view where Alaska would dominate a third of the canvas.
 */
export function buildUsMapProjection(width = 960, height = 600): UsMapProjection {
  const projection = geoAlbersUsa().fitExtent(
    [[PADDING, PADDING], [width - PADDING, height - PADDING]],
    STATES_FC as unknown as Feature<Geometry>,
  );
  const pathGenerator = geoPath(projection);

  const statePaths = STATES_FC.features.flatMap((f): UsMapStatePath[] => {
    const d = pathGenerator(f as unknown as Feature<Geometry>);
    const centroid = pathGenerator.centroid(f as unknown as Feature<Geometry>);
    if (!d || centroid.some((n) => Number.isNaN(n))) return [];
    return [{ name: f.properties?.name as string, d, centroid: [centroid[0], centroid[1]] }];
  });

  return { viewBoxWidth: width, viewBoxHeight: height, statePaths };
}

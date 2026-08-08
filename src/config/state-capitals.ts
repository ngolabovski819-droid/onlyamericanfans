/**
 * State capitals — used ONLY to give src/components/LocationMap.tsx a "grey/other" reference
 * dot on states where the capital isn't already one of our indexed cities (src/config/cities.ts).
 * Where the capital IS already indexed (e.g. Montgomery, AL), the indexed dot renders on top of
 * this one at the same coordinates, so there's no visible duplicate — no de-dupe logic needed.
 */

export interface CapitalConfig {
  label: string;
  lat: number;
  lng: number;
}

export const stateCapitals: Record<string, CapitalConfig> = {
  alabama: { label: 'Montgomery', lat: 32.37, lng: -86.30 },
  alaska: { label: 'Juneau', lat: 58.30, lng: -134.42 },
  arizona: { label: 'Phoenix', lat: 33.45, lng: -112.07 },
  arkansas: { label: 'Little Rock', lat: 34.75, lng: -92.29 },
  california: { label: 'Sacramento', lat: 38.58, lng: -121.49 },
  colorado: { label: 'Denver', lat: 39.74, lng: -104.99 },
  connecticut: { label: 'Hartford', lat: 41.76, lng: -72.69 },
  delaware: { label: 'Dover', lat: 39.16, lng: -75.52 },
  florida: { label: 'Tallahassee', lat: 30.44, lng: -84.28 },
  georgia: { label: 'Atlanta', lat: 33.75, lng: -84.39 },
  hawaii: { label: 'Honolulu', lat: 21.31, lng: -157.86 },
  idaho: { label: 'Boise', lat: 43.62, lng: -116.20 },
  illinois: { label: 'Springfield', lat: 39.80, lng: -89.64 },
  indiana: { label: 'Indianapolis', lat: 39.77, lng: -86.16 },
  iowa: { label: 'Des Moines', lat: 41.59, lng: -93.62 },
  kansas: { label: 'Topeka', lat: 39.05, lng: -95.68 },
  kentucky: { label: 'Frankfort', lat: 38.20, lng: -84.87 },
  louisiana: { label: 'Baton Rouge', lat: 30.45, lng: -91.15 },
  maine: { label: 'Augusta', lat: 44.31, lng: -69.78 },
  maryland: { label: 'Annapolis', lat: 38.98, lng: -76.49 },
  massachusetts: { label: 'Boston', lat: 42.36, lng: -71.06 },
  michigan: { label: 'Lansing', lat: 42.73, lng: -84.55 },
  minnesota: { label: 'Saint Paul', lat: 44.95, lng: -93.09 },
  mississippi: { label: 'Jackson', lat: 32.30, lng: -90.18 },
  missouri: { label: 'Jefferson City', lat: 38.58, lng: -92.17 },
  montana: { label: 'Helena', lat: 46.59, lng: -112.04 },
  nebraska: { label: 'Lincoln', lat: 40.81, lng: -96.68 },
  nevada: { label: 'Carson City', lat: 39.16, lng: -119.77 },
  'new-hampshire': { label: 'Concord', lat: 43.21, lng: -71.54 },
  'new-jersey': { label: 'Trenton', lat: 40.22, lng: -74.76 },
  'new-mexico': { label: 'Santa Fe', lat: 35.69, lng: -105.94 },
  'new-york': { label: 'Albany', lat: 42.65, lng: -73.75 },
  'north-carolina': { label: 'Raleigh', lat: 35.78, lng: -78.64 },
  'north-dakota': { label: 'Bismarck', lat: 46.81, lng: -100.78 },
  ohio: { label: 'Columbus', lat: 39.96, lng: -83.00 },
  oklahoma: { label: 'Oklahoma City', lat: 35.47, lng: -97.52 },
  oregon: { label: 'Salem', lat: 44.94, lng: -123.04 },
  pennsylvania: { label: 'Harrisburg', lat: 40.27, lng: -76.88 },
  'rhode-island': { label: 'Providence', lat: 41.82, lng: -71.41 },
  'south-carolina': { label: 'Columbia', lat: 34.00, lng: -81.03 },
  'south-dakota': { label: 'Pierre', lat: 44.37, lng: -100.35 },
  tennessee: { label: 'Nashville', lat: 36.16, lng: -86.78 },
  texas: { label: 'Austin', lat: 30.27, lng: -97.74 },
  utah: { label: 'Salt Lake City', lat: 40.76, lng: -111.89 },
  vermont: { label: 'Montpelier', lat: 44.26, lng: -72.58 },
  virginia: { label: 'Richmond', lat: 37.54, lng: -77.44 },
  washington: { label: 'Olympia', lat: 47.04, lng: -122.90 },
  'west-virginia': { label: 'Charleston', lat: 38.35, lng: -81.63 },
  wisconsin: { label: 'Madison', lat: 43.07, lng: -89.40 },
  wyoming: { label: 'Cheyenne', lat: 41.14, lng: -104.82 },
};

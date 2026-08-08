import { cities, type CityConfig } from '@/config/cities';

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in kilometers between two lat/lng points. */
export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export interface NearestCityResult {
  city: CityConfig;
  distanceKm: number;
}

/**
 * Nearest indexed city (src/config/cities.ts) to an arbitrary lat/lng, by straight-line distance.
 * Always returns the closest city we have — even a very large distanceKm for a non-US visitor —
 * because that's the honest answer; see AGENTS.md on why this widget never fabricates a
 * per-creator distance instead.
 */
export function findNearestCity(lat: number, lng: number): NearestCityResult {
  let best: NearestCityResult = { city: cities[0], distanceKm: Infinity };
  for (const city of cities) {
    const distanceKm = haversineKm(lat, lng, city.lat, city.lng);
    if (distanceKm < best.distanceKm) best = { city, distanceKm };
  }
  return best;
}

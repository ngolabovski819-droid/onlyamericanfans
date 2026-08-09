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

const PRIVATE_IP_RE = /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd)/i;

/**
 * Best-effort IP -> lat/lng lookup for when Vercel's x-vercel-ip-* headers aren't present —
 * which is always, in local dev (Vercel only attaches those headers to requests that actually
 * pass through its edge network), and would also be true for any deploy target that isn't
 * Vercel. Without this, "near you" only ever works in production, and every local check of the
 * widget necessarily falls back to the plain "Popular creators" state, which looks identical to
 * a real bug even when nothing is wrong.
 *
 * Deliberately never throws and never blocks the caller for long: on a missing/private IP,
 * network failure, timeout, or rate-limited response, this just returns null so the caller falls
 * through to the honest "no location signal" fallback instead of hanging or crashing the route.
 *
 * When `ip` is missing/unroutable (the common case in bare `next dev`, which has no reverse
 * proxy in front of it to populate X-Forwarded-For), this queries the lookup service with no IP
 * argument, which resolves to the caller's OWN outbound public IP — i.e. the developer's real
 * location when run locally. In production behind Vercel this branch essentially never fires,
 * since Vercel always supplies the geo headers this function exists to work around.
 */
export async function lookupIpGeo(ip: string | null): Promise<{ lat: number; lng: number } | null> {
  const usableIp = ip && ip !== 'unknown' && !PRIVATE_IP_RE.test(ip) ? ip : '';
  const url = `http://ip-api.com/json/${usableIp}?fields=status,lat,lon`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const json = (await res.json()) as { status?: string; lat?: unknown; lon?: unknown };
    if (json.status !== 'success' || typeof json.lat !== 'number' || typeof json.lon !== 'number') return null;
    return { lat: json.lat, lng: json.lon };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
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

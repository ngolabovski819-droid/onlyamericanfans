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
export interface IpGeo {
  lat: number;
  lng: number;
  /** Visitor's own city name, if the lookup knew it. */
  city: string | null;
  /** Region/state code (e.g. "CA"), if known. Only displayed for US visitors. */
  region: string | null;
  /** ISO 3166-1 alpha-2, if known. */
  countryCode: string | null;
}

export async function lookupIpGeo(ip: string | null): Promise<IpGeo | null> {
  const usableIp = ip && ip !== 'unknown' && !PRIVATE_IP_RE.test(ip) ? ip : '';
  const url = `http://ip-api.com/json/${usableIp}?fields=status,lat,lon,city,region,countryCode`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      status?: string; lat?: unknown; lon?: unknown; city?: unknown; region?: unknown; countryCode?: unknown;
    };
    if (json.status !== 'success' || typeof json.lat !== 'number' || typeof json.lon !== 'number') return null;
    const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
    return { lat: json.lat, lng: json.lon, city: str(json.city), region: str(json.region), countryCode: str(json.countryCode) };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Human label for the VISITOR's own detected place — "Austin, TX" for a US visitor, "Skopje,
 * North Macedonia" for anyone else (country name via Intl, so no hand-maintained code→name map).
 * The nearby strip heads itself "Showing creators near <this>" for every visitor, so the claim
 * is about where THEY are rather than which indexed city happened to be closest. Requires a city
 * name — a bare country is never a "place" here (it would render as "near United States" above
 * a row of NYC creators), so without one this returns null and the strip falls back to the
 * nearest indexed city's own name. Never throws (an unknown/odd country code just falls back to
 * the raw code).
 */
export function formatVisitorPlace(city: string | null, region: string | null, countryCode: string | null): string | null {
  if (!city) return null;
  const code = countryCode?.toUpperCase() ?? null;
  if (code === 'US') return region ? `${city}, ${region.toUpperCase()}` : city;
  if (!code) return city;
  let country: string;
  try {
    country = new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    country = code;
  }
  return `${city}, ${country}`;
}

/**
 * Nearest indexed city (src/config/cities.ts) to an arbitrary lat/lng, by straight-line distance.
 * Always returns the closest city we have, however far — the caller decides whether that distance
 * is close enough to show (see MAX_NEAR_DISTANCE_MILES in src/app/api/nearby/route.ts; a
 * European visitor's nearest city is Bangor, ME at 3,000+ mi).
 */
export function findNearestCity(lat: number, lng: number): NearestCityResult {
  let best: NearestCityResult = { city: cities[0], distanceKm: Infinity };
  for (const city of cities) {
    const distanceKm = haversineKm(lat, lng, city.lat, city.lng);
    if (distanceKm < best.distanceKm) best = { city, distanceKm };
  }
  return best;
}

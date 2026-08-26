import { NextRequest, NextResponse } from 'next/server';
import { findNearestCity, formatVisitorPlace, haversineKm, lookupIpGeo } from '@/lib/geo';
import { fetchScopedCreators } from '@/lib/sponsorship';
import { states } from '@/config/states';

export const runtime = 'nodejs'; // same reason as /api/search — Supabase fetch caching needs full Node

// Same shape as /api/search's limiter: this route fires once per page load (not per click), so a
// normal visitor never gets near 10 requests / 10s — this only catches scripted abuse.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 10_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

// How far the nearest indexed city may be before the strip stops showing it. Owner's decision
// (2026-08-27): a visitor anywhere in the Americas still gets their nearest US city, however
// far (Mexico City → San Antonio ~700 mi, Bogotá → Miami ~1,500 mi), but beyond 2,800 mi the
// visitor is outside the continent entirely — the nearest indexed city to all of Europe is
// Bangor, ME at 3,000–4,400 mi, and "near Bangor · 4356 miles away" under every avatar reads as
// a bug — so those visitors get the sponsored-creator fallback (nearby:fallback scope) instead.
const MAX_NEAR_DISTANCE_MILES = 2800;
const MAX_NEAR_DISTANCE_KM = MAX_NEAR_DISTANCE_MILES / 0.621371;

function parseCoord(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

// The nearby:fallback scope is pinned with the sponsored creators (src/config/sponsor-placements.ts),
// so this is "Featured creators" in practice; any slot without an active campaign fills with
// organic popular creators. `precise` is echoed back even here so the widget can confirm a "Use
// precise location" click actually did something; `outOfRange` distinguishes "located, but too
// far from every indexed city" from "no location signal at all".
async function fallback(opts: { precise: boolean; outOfRange: boolean; place: string | null }) {
  const { creators } = await fetchScopedCreators({
    scope: 'nearby:fallback',
    pageSize: 5,
    sort: 'popular',
    revalidate: 300,
  });
  return NextResponse.json(
    { available: true, precise: opts.precise, outOfRange: opts.outOfRange, city: null, distanceKm: null, place: opts.place, creators },
    { headers: { 'Cache-Control': opts.precise ? 'private, no-store' : 'private, max-age=30' } },
  );
}

// Vercel percent-encodes this header (e.g. "S%C3%A3o%20Paulo"); tolerate a malformed value.
function decodeHeader(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw).trim();
    return decoded || null;
  } catch {
    return raw.trim() || null;
  }
}

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ available: false }, { status: 429, headers: { 'Retry-After': '10' } });
  }

  const { searchParams } = req.nextUrl;

  // Precise browser geolocation (from the "Use precise location" upgrade) always wins over IP geo.
  const preciseLat = parseCoord(searchParams.get('lat'));
  const preciseLng = parseCoord(searchParams.get('lng'));
  const isPrecise = preciseLat !== null && preciseLng !== null;

  let ipLat = parseCoord(req.headers.get('x-vercel-ip-latitude'));
  let ipLng = parseCoord(req.headers.get('x-vercel-ip-longitude'));
  // The visitor's OWN place label ("Skopje, North Macedonia" / "Austin, TX") — the strip heads
  // itself "Showing creators near <place>" for every visitor. Always taken from IP geo, even on a
  // precise-coordinates request: the browser only gives us lat/lng, and the IP place is on the
  // same request for free, whereas naming raw coordinates would need a reverse-geocoding call.
  // On a precise request it's only kept if the IP location agrees with the coordinates — see
  // PLACE_AGREEMENT_KM below.
  let place = formatVisitorPlace(
    decodeHeader(req.headers.get('x-vercel-ip-city')),
    req.headers.get('x-vercel-ip-country-region'),
    req.headers.get('x-vercel-ip-country'),
  );

  // Vercel's IP-geo headers are production-only (they're attached at Vercel's edge network, which
  // local dev never passes through). Rather than only ever showing "near you" once deployed, fall
  // back to a best-effort public IP-geolocation lookup — still silent, still no browser permission
  // prompt involved, just a different source for the same lat/lng (and place name). See
  // lookupIpGeo's own comment for why this is safe to call unconditionally: it degrades to null
  // (never throws/hangs) on any failure, and in production it essentially never fires since the
  // Vercel headers above already cover it.
  if (ipLat === null || ipLng === null) {
    const looked = await lookupIpGeo(ip === 'unknown' ? null : ip);
    if (looked) {
      ipLat = looked.lat;
      ipLng = looked.lng;
      place ??= formatVisitorPlace(looked.city, looked.region, looked.countryCode);
    }
  }

  const lat = isPrecise ? preciseLat : ipLat;
  const lng = isPrecise ? preciseLng : ipLng;

  // No location signal at all (IP lookup unavailable/failed too). We still always show creators
  // (never an empty widget) — just without a "near you" claim we can't back up.
  if (lat === null || lng === null) {
    return fallback({ precise: false, outOfRange: false, place });
  }

  // Precise coordinates that don't agree with the IP location (a VPN, or coarse carrier-level IP
  // geo) would put one place in the header and another under the avatars ("near Strumica" above
  // NYC creators "<1 mile away"). Drop the IP label in that case so the strip falls back to the
  // nearest indexed city's own name. 250 km tolerates mobile-carrier IP inaccuracy but catches
  // any VPN-scale mismatch.
  const PLACE_AGREEMENT_KM = 250;
  if (isPrecise && (ipLat === null || ipLng === null || haversineKm(ipLat, ipLng, lat, lng) > PLACE_AGREEMENT_KM)) {
    place = null;
  }

  const { city, distanceKm } = findNearestCity(lat, lng);

  // Located, but outside the Americas (see MAX_NEAR_DISTANCE_MILES): featured/sponsored creators
  // instead of a city thousands of miles away.
  if (distanceKm > MAX_NEAR_DISTANCE_KM) {
    return fallback({ precise: isPrecise, outOfRange: true, place });
  }

  const state = states.find((s) => s.slug === city.parentState);

  const { creators } = await fetchScopedCreators({
    scope: `nearby:${city.slug}`,
    locationTerms: city.terms,
    pageSize: 5,
    sort: 'popular',
    revalidate: 300,
  });

  return NextResponse.json(
    {
      available: true,
      precise: isPrecise,
      distanceKm: Math.round(distanceKm),
      city: { label: city.label, urlSlug: city.urlSlug, stateAbbr: state?.abbr ?? null },
      place,
      creators,
    },
    {
      headers: {
        // Personalized by IP/precise location — never cache this response on a shared CDN, but a
        // 30s browser-local cache smooths out rapid re-renders (e.g. React StrictMode double-fetch).
        'Cache-Control': isPrecise ? 'private, no-store' : 'private, max-age=30',
      },
    },
  );
}

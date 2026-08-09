import { NextRequest, NextResponse } from 'next/server';
import { findNearestCity, lookupIpGeo } from '@/lib/geo';
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

function parseCoord(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

async function popularFallback() {
  const { creators } = await fetchScopedCreators({
    scope: 'nearby:fallback',
    pageSize: 5,
    sort: 'popular',
    revalidate: 300,
  });
  return NextResponse.json(
    { available: true, precise: false, city: null, distanceKm: null, creators },
    { headers: { 'Cache-Control': 'private, max-age=30' } },
  );
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

  let lat = isPrecise ? preciseLat : parseCoord(req.headers.get('x-vercel-ip-latitude'));
  let lng = isPrecise ? preciseLng : parseCoord(req.headers.get('x-vercel-ip-longitude'));

  // Vercel's IP-geo headers are production-only (they're attached at Vercel's edge network, which
  // local dev never passes through). Rather than only ever showing "near you" once deployed, fall
  // back to a best-effort public IP-geolocation lookup — still silent, still no browser permission
  // prompt involved, just a different source for the same lat/lng. See lookupIpGeo's own comment
  // for why this is safe to call unconditionally: it degrades to null (never throws/hangs) on any
  // failure, and in production it essentially never fires since the Vercel headers above already
  // cover it.
  if (!isPrecise && (lat === null || lng === null)) {
    const looked = await lookupIpGeo(ip === 'unknown' ? null : ip);
    if (looked) {
      lat = looked.lat;
      lng = looked.lng;
    }
  }

  // No location signal at all (IP lookup unavailable/failed too). We still always show creators
  // (never an empty widget) — just without a "near you" claim we can't back up, falling back to a
  // plain popular scope instead of a fabricated location.
  if (lat === null || lng === null) {
    return popularFallback();
  }

  // Always the honest nearest-city distance, however large — never suppressed into the generic
  // "Popular creators" fallback just because a visitor happens to be far from every indexed city.
  const { city, distanceKm } = findNearestCity(lat, lng);
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

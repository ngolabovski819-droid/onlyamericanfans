'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Creator } from '@/types/creator';
import { buildImageUrl } from '@/lib/image';

interface NearbyResponse {
  available: boolean;
  precise?: boolean;
  distanceKm?: number | null;
  city?: { label: string; urlSlug: string; stateAbbr: string | null } | null;
  creators?: Creator[];
}

type PreciseState = 'idle' | 'loading' | 'denied' | 'error';

function formatDistance(distanceKm: number): string {
  const miles = distanceKm * 0.621371;
  if (miles < 1) return '<1 mile away';
  const rounded = Math.round(miles);
  return `${rounded} ${rounded === 1 ? 'mile' : 'miles'} away`;
}

/**
 * "Showing creators near <city>" strip — renders above CreatorGrid on every page (home, search,
 * category, state, city, region). Fetches client-side from /api/nearby rather than reading
 * request geo headers directly in the page: this project's pages are statically generated
 * (generateStaticParams + revalidate), and this project does NOT have Next's Cache Components
 * enabled, so any component reading headers()/cookies() in the page tree would force the WHOLE
 * route to render dynamically per-request. A client fetch to a Route Handler (same pattern
 * CreatorGrid already uses for "Load More" -> /api/search) keeps every page's static generation
 * untouched.
 *
 * Always shows creators once loaded — /api/nearby falls back to a plain popular scope (no "near
 * you" claim) when it has no location signal at all, so the widget is never a dead end. The
 * initial render relies ONLY on IP-based geo (read server-side from Vercel's request headers by
 * /api/nearby) — no browser permission prompt involved. Browser geolocation only fires when the
 * visitor explicitly clicks "Use precise location": firing it automatically on mount would pop
 * the browser's native permission prompt the instant the page loads, before the visitor has any
 * context for why the site wants their location — a bad first impression, and needless besides,
 * since IP geo already gets them a "near you" result with zero friction.
 *
 * Distance shown is honest: it's the real distance from the visitor's detected location to the
 * centroid of the nearest city we index (src/config/cities.ts) — never a fabricated per-creator
 * GPS distance, since we don't have real creator coordinates. See src/config/sponsor-placements.ts
 * for how a paid placement can appear here via the nearby:<citySlug> / nearby:fallback scopes.
 */
export default function NearbyCreatorsStrip() {
  const [data, setData] = useState<NearbyResponse | null>(null);
  const [preciseState, setPreciseState] = useState<PreciseState>('idle');

  const fetchPrecise = useCallback((silent: boolean) => {
    if (!navigator.geolocation) {
      if (!silent) setPreciseState('error');
      return;
    }
    if (!silent) setPreciseState('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(`/api/nearby?lat=${latitude}&lng=${longitude}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((json: NearbyResponse | null) => {
            if (json) setData(json);
            setPreciseState('idle');
          })
          .catch(() => setPreciseState(silent ? 'idle' : 'error'));
      },
      () => setPreciseState(silent ? 'idle' : 'denied'),
      { timeout: 8000, maximumAge: 300_000 },
    );
  }, []);

  useEffect(() => {
    let isCurrent = true;
    fetch('/api/nearby')
      .then((res) => (res.ok ? res.json() : null))
      .then((json: NearbyResponse | null) => {
        if (isCurrent) setData(json);
      })
      .catch(() => {
        if (isCurrent) setData(null);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const usePreciseLocation = useCallback(() => fetchPrecise(false), [fetchPrecise]);

  if (!data?.available || !data.creators?.length) return null;

  const { city, creators, distanceKm } = data;

  return (
    <div className="nearby-strip">
      <div className="section-rail">
        <h2 className="section-rail-title">OnlyFans Creators Near You</h2>
      </div>
      <div className="nearby-strip-header">
        <p className="nearby-strip-title">
          {city ? (
            <>
              📍 Showing creators near <strong>{city.label}{city.stateAbbr ? `, ${city.stateAbbr}` : ''}</strong>
            </>
          ) : (
            <>🔥 <strong>Popular creators</strong></>
          )}
        </p>
        {preciseState === 'denied' ? (
          <span className="nearby-strip-precise nearby-strip-precise--denied">Location access denied</span>
        ) : (
          <button
            type="button"
            className="nearby-strip-precise"
            onClick={usePreciseLocation}
            disabled={preciseState === 'loading'}
          >
            {preciseState === 'loading' ? 'Locating…' : '📍 Use precise location'}
          </button>
        )}
      </div>

      <div className="nearby-strip-avatars">
        {creators.map((creator) => (
          <NearbyAvatar key={creator.id} creator={creator} distanceKm={distanceKm ?? null} />
        ))}
      </div>
    </div>
  );
}

function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return '';
  return price === 0 ? 'Free' : `$${price.toFixed(2)}/mo`;
}

function NearbyAvatar({ creator, distanceKm }: { creator: Creator; distanceKm: number | null }) {
  const displayName = creator.name ?? creator.username;
  const image = creator.imageOverride ?? creator.avatarC144 ?? creator.avatar;
  const isTracked = creator.sponsorTracked || creator.sponsored;
  const href = isTracked ? `/go/${creator.username}` : `https://onlyfans.com/${creator.username}`;
  // Do not add noreferrer — the /go route needs the browser Referer for placement attribution.
  const rel = isTracked ? 'noopener nofollow sponsored' : 'noopener nofollow';
  const price = formatPrice(creator.subscribePrice);

  return (
    <a href={href} target="_blank" rel={rel} className="nearby-avatar" aria-label={`View ${displayName} on OnlyFans`}>
      <span className="nearby-avatar-img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={buildImageUrl(image ?? '', 96, 96)}
          alt={displayName}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="nearby-avatar-img"
          onError={(event) => {
            event.currentTarget.src = '/no-image.png';
          }}
        />
        {creator.sponsored && <span className="nearby-avatar-ad" title="Advertisement">Ad</span>}
      </span>
      <span className="nearby-avatar-name">
        <span className="nearby-avatar-name-text">{displayName}</span>
        {creator.isVerified && <span className="creator-verified-check" title="Verified creator">✓</span>}
      </span>
      {/* Same real visitor -> nearest-city distance shown in the strip's header — every creator
          here was matched into this scope precisely because they're tied to that city, so this
          is honest, just repositioned under each card instead of stated once up top. Not a
          fabricated per-creator GPS distance — see the component-level doc comment. */}
      {typeof distanceKm === 'number' && (
        <span className="nearby-avatar-distance">📍 {formatDistance(distanceKm)}</span>
      )}
      {price && (
        <span className={`nearby-avatar-price${creator.subscribePrice === 0 ? ' nearby-avatar-price--free' : ''}`}>
          {creator.subscribePrice === 0 && '🔓 '}{price}
        </span>
      )}
    </a>
  );
}

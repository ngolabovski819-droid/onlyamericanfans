'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  if (miles < 1) return '<1 mi away';
  return `${Math.round(miles)} mi away`;
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
 * you" claim) when it has no location signal at all, so the widget is never a dead end. On mount
 * it also makes a silent, best-effort attempt at precise browser geolocation (no click required);
 * if the visitor already granted permission (or grants it on the automatic prompt) the strip
 * upgrades in place. The manual "Use precise location" control stays available for anyone who
 * dismissed that prompt and wants to retry deliberately.
 *
 * Distance shown is honest: it's the real distance from the visitor's detected location to the
 * centroid of the nearest city we index (src/config/cities.ts) — never a fabricated per-creator
 * GPS distance, since we don't have real creator coordinates. See src/config/sponsor-placements.ts
 * for how a paid placement can appear here via the nearby:<citySlug> / nearby:fallback scopes.
 */
export default function NearbyCreatorsStrip() {
  const [data, setData] = useState<NearbyResponse | null>(null);
  const [preciseState, setPreciseState] = useState<PreciseState>('idle');
  const upgradedRef = useRef(false);

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

    // Best-effort, silent upgrade — doesn't block or replace the IP-based result above, and
    // never surfaces an error if the visitor ignores/denies the browser's permission prompt.
    if (!upgradedRef.current) {
      upgradedRef.current = true;
      fetchPrecise(true);
    }

    return () => {
      isCurrent = false;
    };
  }, [fetchPrecise]);

  const usePreciseLocation = useCallback(() => fetchPrecise(false), [fetchPrecise]);

  if (!data?.available || !data.creators?.length) return null;

  const { city, creators, distanceKm } = data;

  return (
    <div className="nearby-strip">
      <div className="nearby-strip-header">
        <p className="nearby-strip-title">
          {city ? (
            <>
              📍 Showing creators near <strong>{city.label}{city.stateAbbr ? `, ${city.stateAbbr}` : ''}</strong>
              {typeof distanceKm === 'number' && (
                <span className="nearby-strip-distance"> · {formatDistance(distanceKm)}</span>
              )}
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
          <NearbyAvatar key={creator.id} creator={creator} />
        ))}
      </div>
    </div>
  );
}

function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return '';
  return price === 0 ? 'Free' : `$${price.toFixed(2)}/mo`;
}

function NearbyAvatar({ creator }: { creator: Creator }) {
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
      {price && <span className={`nearby-avatar-price${creator.subscribePrice === 0 ? ' nearby-avatar-price--free' : ''}`}>{price}</span>}
    </a>
  );
}

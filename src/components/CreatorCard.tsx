'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import type { Creator } from '@/types/creator';
import { buildSrcset } from '@/lib/image';

interface Props {
  creator: Creator;
  index: number;
}

const WISHLIST_KEY = 'onlyamericanfans:wishlist';
const DOT_WINDOW_SIZE = 7;

function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'Price unavailable';
  if (price === 0) return 'FREE';
  return `$${price.toFixed(2)}/mo`;
}

function getBestBundle(creator: Creator): string | null {
  if (creator.bundle1Price && creator.bundle1Duration && creator.bundle1Discount) {
    return `-${creator.bundle1Discount}% for ${creator.bundle1Duration} months`;
  }
  return null;
}

function uniqueImages(images: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  return images.filter((image): image is string => {
    if (!image) return false;
    const normalized = image.trim();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function stopCardNavigation(event: MouseEvent<HTMLElement>) {
  event.preventDefault();
  event.stopPropagation();
}

export default function CreatorCard({ creator, index }: Props) {
  const images = useMemo(
    () => uniqueImages(creator.imageOverride
      ? [creator.imageOverride, ...(creator.sponsorGalleryImages ?? [])]
      : [creator.avatar ?? creator.avatarC144, creator.header, ...(creator.sponsorGalleryImages ?? [])]
    ),
    [creator.imageOverride, creator.avatar, creator.avatarC144, creator.header, creator.sponsorGalleryImages]
  );
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const displayName = creator.name ?? creator.username;
  const currentImage = buildSrcset(images[activeImage]);
  const isEager = index < 4 && activeImage === 0;
  const bundle = getBestBundle(creator);
  const price = formatPrice(creator.subscribePrice);
  const isFree = creator.subscribePrice === 0;

  useEffect(() => {
    let isCurrent = true;
    let nextValue = false;
    try {
      const stored = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]') as unknown;
      nextValue = Array.isArray(stored) && stored.includes(creator.username.toLowerCase());
    } catch {}
    const frame = requestAnimationFrame(() => {
      if (isCurrent) setWishlisted(nextValue);
    });
    return () => {
      isCurrent = false;
      cancelAnimationFrame(frame);
    };
  }, [creator.username]);

  const isTracked = creator.sponsorTracked || creator.sponsored;
  const href = isTracked ? `/go/${creator.username}` : `https://onlyfans.com/${creator.username}`;
  // Do not add noreferrer: the /go route needs the browser Referer for placement attribution.
  const rel = isTracked ? 'noopener nofollow sponsored' : 'noopener nofollow';

  const goToImage = (event: MouseEvent<HTMLButtonElement>, nextIndex: number) => {
    stopCardNavigation(event);
    setActiveImage((nextIndex + images.length) % images.length);
  };

  const toggleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    stopCardNavigation(event);
    const username = creator.username.toLowerCase();
    const nextValue = !wishlisted;
    setWishlisted(nextValue);
    try {
      const stored = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]') as unknown;
      const usernames = new Set(Array.isArray(stored) ? stored.filter((item): item is string => typeof item === 'string') : []);
      if (nextValue) usernames.add(username);
      else usernames.delete(username);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify([...usernames]));
    } catch {
      // The visual state still works if storage is unavailable.
    }
  };

  const dotStart = Math.max(
    0,
    Math.min(activeImage - Math.floor(DOT_WINDOW_SIZE / 2), images.length - DOT_WINDOW_SIZE)
  );
  const visibleDots = images.slice(dotStart, dotStart + DOT_WINDOW_SIZE);

  return (
    <article className="creator-card">
      <a
        href={href}
        target="_blank"
        rel={rel}
        className="creator-card-link"
        aria-label={`View ${displayName} on OnlyFans`}
      />

      <div className="creator-card-img-wrap">
        {/* Only the active slide exists in the DOM, so inactive gallery images are not requested. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={images[activeImage] ?? 'fallback'}
          src={currentImage.src}
          srcSet={currentImage.srcSet || undefined}
          sizes={currentImage.sizes || undefined}
          alt={`${displayName} OnlyFans — image ${activeImage + 1} of ${Math.max(images.length, 1)}`}
          loading={isEager ? 'eager' : 'lazy'}
          fetchPriority={isEager ? 'high' : 'auto'}
          decoding="async"
          referrerPolicy="no-referrer"
          className="creator-card-image"
          onError={(event) => {
            event.currentTarget.srcset = '';
            event.currentTarget.src = '/no-image.png';
          }}
        />

        <div className="creator-card-top-controls">
          <button
            type="button"
            className={`creator-heart${wishlisted ? ' creator-heart--active' : ''}`}
            onClick={toggleWishlist}
            aria-label={wishlisted ? `Remove ${displayName} from wishlist` : `Add ${displayName} to wishlist`}
            aria-pressed={wishlisted}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <span aria-hidden="true">♥</span>
          </button>

          {creator.sponsored && (creator.sponsorTags?.length || creator.sponsorAdditionalTagCount) && (
            <div className="creator-sponsored-tags" aria-label="Creator content tags">
              {creator.sponsorTags?.map((tag) => (
                <span className="creator-sponsored-tag" key={tag}>{tag}</span>
              ))}
              {!!creator.sponsorAdditionalTagCount && (
                <span className="creator-sponsored-tag creator-sponsored-tag--count">
                  +{creator.sponsorAdditionalTagCount}
                </span>
              )}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="creator-carousel-arrow creator-carousel-arrow--previous"
              onClick={(event) => goToImage(event, activeImage - 1)}
              aria-label={`Show previous image of ${displayName}`}
              title="Previous image"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              className="creator-carousel-arrow creator-carousel-arrow--next"
              onClick={(event) => goToImage(event, activeImage + 1)}
              aria-label={`Show next image of ${displayName}`}
              title="Next image"
            >
              <span aria-hidden="true">›</span>
            </button>
            <div className="creator-carousel-dots" aria-label={`Image ${activeImage + 1} of ${images.length}`}>
              {visibleDots.map((_, dotIndex) => {
                const imageIndex = dotStart + dotIndex;
                return (
                  <button
                    type="button"
                    key={imageIndex}
                    className={`creator-carousel-dot${imageIndex === activeImage ? ' creator-carousel-dot--active' : ''}`}
                    onClick={(event) => goToImage(event, imageIndex)}
                    aria-label={`Show image ${imageIndex + 1}`}
                    aria-current={imageIndex === activeImage ? 'true' : undefined}
                  />
                );
              })}
            </div>
          </>
        )}

        {creator.sponsored && (
          <span
            className="creator-sponsored-disclosure"
            title="Advertisement"
            aria-label="Advertisement"
          >
            Ad
          </span>
        )}
      </div>

      <div className="creator-card-body">
        <h3 className="creator-name">
          <span className="creator-name-text">{displayName}</span>
          {creator.isVerified && (
            <span className="creator-verified-check" title="Verified creator" aria-label="Verified creator">✓</span>
          )}
        </h3>
        <p className="creator-username">@{creator.username}</p>
        {creator.location && <p className="creator-location">📍 {creator.location}</p>}
        <div className="creator-price-row">
          <span className={`creator-price ${isFree ? 'creator-price--free' : ''}`}>{price}</span>
          {bundle && <span className="creator-bundle">{bundle}</span>}
        </div>
        <span className="creator-view-btn" aria-hidden="true">View Profile</span>
      </div>
    </article>
  );
}

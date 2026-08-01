'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import type { Creator } from '@/types/creator';
import { buildImageUrl } from '@/lib/image';
import { getSponsorPreviews } from '@/lib/sponsor-preview';

interface Props {
  history: string[];
  onSelect: (term: string) => void;
  onRemove: (term: string) => void;
  onClear: () => void;
}

// Keep the input focused until the intended dropdown click has fired.
function keepInputFocus(event: MouseEvent<HTMLElement>) {
  event.preventDefault();
}

export default function SearchHistoryDropdown({ history, onSelect, onRemove, onClear }: Props) {
  const [sponsors, setSponsors] = useState<Creator[]>();

  useEffect(() => {
    let current = true;
    getSponsorPreviews().then((creators) => {
      if (current) setSponsors(creators);
    });
    return () => {
      current = false;
    };
  }, []);

  if ((!sponsors || sponsors.length === 0) && history.length === 0) return null;

  return (
    <div className="search-history-dropdown" aria-label="Sponsored creators and recent searches">
      {sponsors && sponsors.length > 0 && (
        <>
          {sponsors.map((sponsor) => {
            const sponsorImage = sponsor.imageOverride ?? sponsor.avatarC144 ?? sponsor.avatar;
            return (
              // Plain anchor deliberately avoids Next.js prefetch firing the tracked redirect.
              <a
                href={`/go/${sponsor.username}`}
                target="_blank"
                rel="noopener nofollow sponsored"
                className="search-sponsor-row"
                onMouseDown={keepInputFocus}
                aria-label={`${sponsor.name ?? sponsor.username}, advertisement`}
                key={sponsor.username}
              >
                {sponsorImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="search-sponsor-avatar"
                    src={buildImageUrl(sponsorImage, 80, 80)}
                    alt=""
                    width={40}
                    height={40}
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="search-sponsor-copy">
                  <strong>{sponsor.name ?? sponsor.username}</strong>
                  <span>@{sponsor.username}</span>
                </span>
                <span className="search-sponsor-disclosure" title="Advertisement" aria-label="Advertisement">
                  Ad
                </span>
              </a>
            );
          })}
          {history.length > 0 && <div className="search-history-divider" />}
        </>
      )}

      {history.length > 0 && (
        <>
          <div className="search-history-header">
            <span>Recent searches</span>
            <button type="button" onMouseDown={keepInputFocus} onClick={onClear}>Clear</button>
          </div>
          {history.map((term) => (
            <div className="search-history-item" key={term}>
              <button
                type="button"
                className="search-history-term"
                onMouseDown={keepInputFocus}
                onClick={() => onSelect(term)}
              >
                {term}
              </button>
              <button
                type="button"
                className="search-history-remove"
                onMouseDown={keepInputFocus}
                onClick={() => onRemove(term)}
                aria-label={`Remove “${term}” from recent searches`}
              >
                ×
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

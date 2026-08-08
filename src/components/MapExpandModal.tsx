'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  heading: string;
  ariaLabel: string;
  children: ReactNode;
  /** Overrides the modal's default max-width (640px) — the 50-state US map needs more room than a single-state city map. */
  modalMaxWidth?: number;
  /** Applied to the inline (non-modal) card wrapper, e.g. to let a wider map use more of its container. */
  cardClassName?: string;
}

/**
 * Wraps a server-rendered map (src/components/LocationMap.tsx) with an "expand" toggle that
 * shows the exact same SVG markup larger in a fullscreen modal — no separate render, no data
 * refetch, just CSS sizing the same vector art up for clarity. `children` is server-rendered
 * once and placed twice in this client component's own output (inline card + modal); React
 * treats those as two independent subtrees, so duplicate keys inside (city slugs, etc.) are
 * fine — key uniqueness only matters among siblings under the same parent.
 *
 * The modal is rendered through a portal into document.body rather than in place. The map sits
 * inside .detail-hero, which sets `isolation: isolate` (for its own background-glow layering) —
 * that creates a stacking context, and a position:fixed element trapped inside one can never
 * paint above page-level fixed/sticky elements OUTSIDE it (like the sticky nav header) no matter
 * how high its z-index goes, since z-index only competes within the nearest containing stacking
 * context. A portal moves the modal's DOM node to <body>, outside that stacking context entirely.
 */
export default function MapExpandModal({ heading, ariaLabel, children, modalMaxWidth, cardClassName }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const modal = (
    <div
      className="location-map-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="location-map-modal"
        style={modalMaxWidth ? { width: `min(92vw, ${modalMaxWidth}px)` } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="location-map-modal-close"
          onClick={() => setIsOpen(false)}
          aria-label="Close map"
        >
          ✕
        </button>
        <p className="location-map-heading">{heading}</p>
        {children}
      </div>
    </div>
  );

  return (
    <>
      <div className={`location-map${cardClassName ? ` ${cardClassName}` : ''}`}>
        <div className="location-map-header-row">
          <p className="location-map-heading">{heading}</p>
          <button
            type="button"
            className="location-map-expand-btn"
            onClick={() => setIsOpen(true)}
            aria-label={`Expand ${ariaLabel}`}
            title="View larger map"
          >
            ⛶
          </button>
        </div>
        {children}
      </div>

      {isOpen && createPortal(modal, document.body)}
    </>
  );
}

import type { Creator } from '@/types/creator';

// The homepage and search page never need separate requests for the same campaign preview.
let cachedPreview: Promise<Creator | null> | null = null;

export function getSponsorPreview(): Promise<Creator | null> {
  if (!cachedPreview) {
    cachedPreview = fetch('/api/sponsor-preview')
      .then((response) => (response.ok ? response.json() as Promise<Creator | null> : null))
      .catch(() => null);
  }
  return cachedPreview;
}

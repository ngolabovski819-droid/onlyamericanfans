import type { Creator } from '@/types/creator';

// The homepage and search page never need separate requests for the same campaign preview.
let cachedPreview: Promise<Creator[]> | null = null;

export function getSponsorPreviews(): Promise<Creator[]> {
  if (!cachedPreview) {
    cachedPreview = fetch('/api/sponsor-preview?v=2')
      .then((response) => (response.ok ? response.json() as Promise<Creator[] | Creator | null> : []))
      .then((payload) => Array.isArray(payload) ? payload : payload ? [payload] : [])
      .catch(() => []);
  }
  return cachedPreview;
}

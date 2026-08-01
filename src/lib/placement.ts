import { states } from '@/config/states';
import { cities } from '@/config/cities';
import { regions } from '@/config/regions';
import { categories } from '@/config/categories';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com';

/**
 * Derives a short `placement` label for a click-log row from the raw Referer header.
 *
 * Returns null when there's no referrer at all — that's expected and NOT a bug: pasted links,
 * messaging-app shares and in-app browsers all legitimately strip it. The click is still logged
 * and counted; only the placement attribution is unknown for that row.
 *
 * `requestHost` (from the incoming request's own Host header) is compared alongside
 * NEXT_PUBLIC_SITE_URL so this still resolves internal paths correctly on localhost/preview
 * deployments where the two differ.
 */
export function derivePlacement(referer: string | null | undefined, requestHost: string): string | null {
  if (!referer) return null;

  let refUrl: URL;
  try {
    refUrl = new URL(referer);
  } catch {
    return null;
  }

  let siteHost = requestHost;
  try {
    siteHost = new URL(SITE_URL).hostname;
  } catch {
    // fall through to requestHost
  }

  const isInternal = refUrl.hostname === siteHost || refUrl.hostname === requestHost;
  if (!isInternal) {
    return `external:${refUrl.hostname}`;
  }

  const path = refUrl.pathname.replace(/\/+$/, '') || '/';
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) return 'home';
  if (path === '/onlyfans-search') return 'search';
  if (segments[0] === 'categories') return segments[1] ? `category:${segments[1]}` : 'categories';
  if (segments[0] === 'go') return null; // referrer chain from our own redirect shouldn't occur

  // Single-segment location slugs — state, city or region urlSlug (e.g. /california-onlyfans)
  if (segments.length === 1) {
    const slug = segments[0];
    const state = states.find((s) => s.urlSlug === slug);
    if (state) return `state:${state.slug}`;
    const city = cities.find((c) => c.urlSlug === slug);
    if (city) return `city:${city.slug}`;
    const region = regions.find((r) => r.urlSlug === slug);
    if (region) return `region:${region.slug}`;
    const category = categories.find((c) => c.slug === slug);
    if (category) return `category:${category.slug}`;
  }

  return `page:${path}`;
}

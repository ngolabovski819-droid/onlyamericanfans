import {
  resolveLastModified,
  type LastModifiedValue,
} from './last-modified';

export type SitemapChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface SitemapUrlEntry {
  /** Site-relative path or absolute canonical URL. */
  url: string;
  /** Supply only a real published change; invalid or absent values are omitted. */
  lastModified?: LastModifiedValue;
  changeFrequency?: SitemapChangeFrequency;
  priority?: number;
}
function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function absoluteSitemapUrl(siteUrl: string, value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  const origin = siteUrl.replace(/\/+$/, '');
  if (value === '' || value === '/') return origin;
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
}

/**
 * Builds a deduplicated sitemap without inventing lastmod values. This stays custom because the
 * app already serves numbered sitemap Route Handlers; the output follows the same XML contract
 * as Next's sitemap file convention.
 */
export function buildSitemapXml(
  siteUrl: string,
  entries: readonly SitemapUrlEntry[],
): string {
  const seen = new Set<string>();
  const urls: string[] = [];

  entries.forEach((entry) => {
    const url = absoluteSitemapUrl(siteUrl, entry.url);
    if (seen.has(url)) return;
    seen.add(url);

    const lastModified = resolveLastModified(entry.lastModified);
    const priority = entry.priority == null
      ? undefined
      : Math.min(1, Math.max(0, entry.priority));

    urls.push([
      '<url>',
      `<loc>${escapeXml(url)}</loc>`,
      lastModified ? `<lastmod>${escapeXml(lastModified)}</lastmod>` : '',
      entry.changeFrequency
        ? `<changefreq>${entry.changeFrequency}</changefreq>`
        : '',
      priority == null ? '' : `<priority>${priority}</priority>`,
      '</url>',
    ].join(''));
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('');
}

export function sitemapXmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}

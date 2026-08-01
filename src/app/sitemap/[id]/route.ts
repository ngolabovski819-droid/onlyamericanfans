import { NextResponse } from 'next/server';
import { categories } from '@/config/categories';
import { cities } from '@/config/cities';
import { regions } from '@/config/regions';
import { states } from '@/config/states';
import { getAllPosts } from '@/lib/blog';
import {
  getAllCityLocationStats,
  getAllRegionLocationStats,
  getAllStateLocationStats,
  getNationalLocationStats,
} from '@/lib/state-stats';
import { getDirectoryLastModified } from '@/lib/seo/last-modified';
import { hasIndexableCityQuality } from '@/lib/seo/indexation';
import {
  buildSitemapXml,
  sitemapXmlResponse,
  type SitemapChangeFrequency,
  type SitemapUrlEntry,
} from '@/lib/seo/sitemap';
import { SITE_URL } from '@/lib/site-url';

// These dates represent real shipped template/content changes. They stay fixed until a later
// material edit; request time and no-op scraper runs must never manufacture sitemap freshness.
const SITE_TEMPLATE_CHANGED_AT = '2026-08-01';
const CATEGORY_TEMPLATE_CHANGED_AT = '2026-07-31';

function url(
  path: string,
  priority = 0.7,
  changeFrequency: SitemapChangeFrequency = 'weekly',
  lastModified: string | undefined = SITE_TEMPLATE_CHANGED_AT,
): SitemapUrlEntry {
  return { url: path, priority, changeFrequency, lastModified };
}

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  if (id === '0') {
    const [nationalStats, stateStats, regionStats, cityStats] = await Promise.all([
      getNationalLocationStats(),
      getAllStateLocationStats(),
      getAllRegionLocationStats(),
      getAllCityLocationStats(),
    ]);
    const stateChangedAt = new Map(stateStats.map((row) => [row.scopeSlug, row.contentChangedAt]));
    const regionChangedAt = new Map(regionStats.map((row) => [row.scopeSlug, row.contentChangedAt]));
    const cityStatsBySlug = new Map(cityStats.map((row) => [row.scopeSlug, row]));

    const staticUrls = [
      url('/', 1, 'daily'),
      url('/onlyfans-search', 0.9, 'daily'),
      url(
        '/browse-by-state',
        0.9,
        'daily',
        getDirectoryLastModified({
          templateChangedAt: SITE_TEMPLATE_CHANGED_AT,
          snapshotChangedAt: nationalStats?.contentChangedAt,
        }),
      ),
      url('/categories', 0.8, 'weekly', CATEGORY_TEMPLATE_CHANGED_AT),
      url('/blog', 0.8, 'weekly', CATEGORY_TEMPLATE_CHANGED_AT),
      url('/methodology', 0.75, 'monthly'),
      url('/about', 0.5, 'monthly'),
      url('/contact', 0.4, 'monthly'),
      url('/promote', 0.8, 'monthly'),
      url('/privacy', 0.3, 'monthly'),
      url('/terms', 0.3, 'monthly'),
      url('/dmca', 0.3, 'monthly'),
    ];
    const stateUrls = states.map((state) => url(
      `/${state.urlSlug}`,
      0.95,
      'daily',
      getDirectoryLastModified({
        templateChangedAt: SITE_TEMPLATE_CHANGED_AT,
        snapshotChangedAt: stateChangedAt.get(state.slug),
      }),
    ));
    const regionUrls = regions.map((region) => url(
      `/${region.urlSlug}`,
      0.85,
      'daily',
      getDirectoryLastModified({
        templateChangedAt: SITE_TEMPLATE_CHANGED_AT,
        snapshotChangedAt: regionChangedAt.get(region.slug),
      }),
    ));
    const hasCompleteCityRollups = cityStats.length > 0;
    const cityUrls = cities
      .filter((city) => (
        hasCompleteCityRollups && hasIndexableCityQuality(cityStatsBySlug.get(city.slug))
      ))
      .map((city) => url(
      `/${city.urlSlug}`,
      0.8,
      'daily',
      getDirectoryLastModified({
        templateChangedAt: SITE_TEMPLATE_CHANGED_AT,
        snapshotChangedAt: cityStatsBySlug.get(city.slug)?.contentChangedAt,
      }),
      ));
    const categoryUrls = categories.map((category) =>
      url(`/categories/${category.slug}`, 0.7, 'daily', CATEGORY_TEMPLATE_CHANGED_AT));

    return sitemapXmlResponse(buildSitemapXml(SITE_URL, [
      ...staticUrls,
      ...stateUrls,
      ...regionUrls,
      ...cityUrls,
      ...categoryUrls,
    ]));
  }

  if (id === '1') {
    const posts = getAllPosts();
    const blogUrls = posts.map((post) =>
      url(`/blog/${post.slug}`, 0.7, 'weekly', post.date || undefined));
    return sitemapXmlResponse(buildSitemapXml(
      SITE_URL,
      blogUrls.length ? blogUrls : [url('/blog', 0.7, 'weekly', CATEGORY_TEMPLATE_CHANGED_AT)],
    ));
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

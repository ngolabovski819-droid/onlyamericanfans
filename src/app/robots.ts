import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep Next's CSS, JavaScript and image assets crawlable so search engines can render
        // the page accurately. API responses and outbound tracking redirects are not indexable
        // content and can safely stay out of the crawl queue.
        disallow: ['/api/', '/go/'],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap/0`, `${SITE_URL}/sitemap/1`],
  };
}

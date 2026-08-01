import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep every non-root page on the no-trailing-slash canonical URL.
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: '/search',
        destination: '/onlyfans-search',
        permanent: true,
      },
      {
        source: '/search/:path*',
        destination: '/onlyfans-search',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.weserv.nl" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
      {
        source: "/:locationSlug([a-z-]+-onlyfans)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=60" },
        ],
      },
      {
        source: "/categories/:slug/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=60" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static generation defaults to using every available CPU core as a parallel worker (11 on
  // this machine) — each one hits the database simultaneously during build. Confirmed via direct
  // testing that even with the location column indexed, 11 concurrent connections is enough to
  // overwhelm the new Supabase free-tier project's shared/limited compute (the query cost per
  // request isn't the bottleneck — the raw number of simultaneous connections is). Capping this
  // trades a somewhat longer build for not hammering a small database with a burst of concurrent
  // load every single deploy.
  experimental: {
    cpus: 2,
  },
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
      { protocol: "https", hostname: "**.onlyfans.com" },
    ],
    deviceSizes: [640, 720, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [32, 48, 64, 80, 96, 128, 240, 256, 360, 384, 480],
    minimumCacheTTL: 2592000,
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

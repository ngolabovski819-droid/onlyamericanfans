import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

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
    // The /_next/image width allowlist, clamped to exactly what this site requests:
    //   360 + 720 — creator card 1x/2x pair (src/lib/image.ts)
    //   96        — NearbyCreatorsStrip avatars
    //   80        — search-dropdown sponsor thumb
    // Nothing here imports next/image, so these lists are purely that allowlist. Any other
    // ?w= now 400s instead of billing a transformation — /_next/image is a public endpoint and
    // remotePatterns admits any **.onlyfans.com image.
    deviceSizes: [720],
    imageSizes: [80, 96, 360],
    // Next 16's default, pinned so it stays in lockstep with IMAGE_QUALITY in src/lib/image.ts.
    qualities: [75],
    // One year, up from 30 days. OnlyFans photo URLs are immutable (hash + upload timestamp in
    // the path; a new avatar gets a new URL), so a 30-day TTL re-billed identical output every
    // month. Vercel keeps this cache across deploys.
    minimumCacheTTL: 31536000,
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

// Local `next dev` only — production builds use nextConfig unchanged.
// Turbopack's default runs PostCSS in a separate node.exe per job, and on Windows it started
// 200+ of them at once compiling a single page; across several dev servers that reached 1,386
// processes / 18.5 GB and froze the machine (2026-09-19). Worker threads keep that work inside
// the one dev-server process.
export default function config(phase: string): NextConfig {
  if (phase !== PHASE_DEVELOPMENT_SERVER) return nextConfig;
  return {
    ...nextConfig,
    experimental: { ...nextConfig.experimental, turbopackPluginRuntimeStrategy: "workerThreads" },
  };
}

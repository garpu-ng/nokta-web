import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Image Optimization is left on (the previous global `unoptimized: true` is
  // gone) so next/image emits a responsive srcset and serves modern formats.
  // On Vercel this runs on the Image Optimization CDN; a self-hosted `next start`
  // optimizes on demand via sharp. Individually animated assets (the footer's
  // animated WebP) opt out per-instance with the `unoptimized` prop, since
  // optimizing animated images would drop their frames.
  images: {
    // Defaults, plus the widths the sheet actually paints between the old
    // buckets. A 400px card was jumping from 384 to 640, and a 1270px plate
    // from 1200 to 1920. imageSizes stay below the smallest deviceSize.
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 480, 560],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 3840],
    // 75 stays the default for every other image. 90 is allowlisted only so
    // the Ma plates can ask for it: Next 16 serves the closest allowed
    // quality, and a quality={90} prop without this entry would stay at 75.
    qualities: [75, 90],
    // Optimized images were leaving with max-age=0, so every return visit
    // revalidated them. A day is long enough to help and short enough that a
    // replaced project file is not stuck for a month. HTML stays dynamic
    // (the locale cookie) and is not covered here.
    minimumCacheTTL: 60 * 60 * 24,
  },
  async headers() {
    return [
      {
        // Files in /public. Hashed /_next/static assets already ship
        // immutable and cannot be overridden. Pages have no extension, so
        // this does not touch HTML.
        source: "/:path*.:ext(jpg|jpeg|png|webp|gif|svg|ico|mp4|webm|html)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  // Pin the workspace root to this app: a stray package-lock.json in the home
  // directory otherwise makes Next infer C:\Users\boboh as the root.
  turbopack: { root: __dirname },
};

export default nextConfig;

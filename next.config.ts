import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Image Optimization is left on (the previous global `unoptimized: true` is
  // gone) so next/image emits a responsive srcset and serves modern formats.
  // On Vercel this runs on the Image Optimization CDN; a self-hosted `next start`
  // optimizes on demand via sharp. Individually animated assets (the footer's
  // animated WebP) opt out per-instance with the `unoptimized` prop, since
  // optimizing animated images would drop their frames.
  images: {},
};

export default nextConfig;

"use client";

import { useEffect, useRef } from "react";

// Drop-in replacement for an animated GIF that used to ship as an <img>. Renders
// a silent, looping <video> styled exactly like the old image (same className /
// intrinsic width+height so CSS governs the rendered size). Mirrors the
// TeaserVideo house pattern: set `muted` via the property (more reliable than the
// attribute across browsers) and kick off play() on mount. Autoplay is driven
// from the effect rather than the native `autoplay` attribute so it can be
// suppressed under prefers-reduced-motion (the first frame stays visible).
//
// Use for OPAQUE source GIFs converted to H.264 mp4 — H.264 has no alpha channel,
// so transparent animations must stay as WebP instead.
type Props = {
  src: string;
  className?: string;
  /** intrinsic width in px (aspect-ratio hint; CSS still controls display size) */
  width: number;
  /** intrinsic height in px */
  height: number;
  /** accessible name; when omitted the video is treated as decorative */
  label?: string;
};

export default function GifVideo({ src, className, width, height, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    // Honour prefers-reduced-motion: leave the video paused on its first frame.
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    v.play().catch(() => {
      /* autoplay may be blocked; the first frame stays visible */
    });
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      width={width}
      height={height}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

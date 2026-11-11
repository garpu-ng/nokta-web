"use client";

import { useEffect, useRef } from "react";
import { motionOff, prefersReducedMotion, watchMotion } from "@/lib/motion";

/* The moving version of a card's image, for work that is itself moving.

   It hangs in the same frame the still would hang in and wears the same class,
   so the card's hover — the hairline going to paper, the sheet edging closer —
   plays over it unchanged. Nothing about the wall knows this card is different.

   Two things are decided here rather than by the house pattern:

   The clip is not fetched until the card is actually on screen. The wall
   renders every work and hides the ones the filter is not standing on
   (display:none, so the order never shifts — see WorkWall), which means this
   card is in the DOM of every /arbeiten visit, including the ones that never
   press its material. `preload="none"` plus an IntersectionObserver is what
   keeps that from costing a quarter megabyte to a reader who never sees it: a
   hidden element never intersects, so the bytes are never asked for.

   And it pauses on the way out. A wall of sheets is scrolled past, and a clip
   decoding under the fold is work nobody is watching.

   The rest is the house pattern for every clip on the site: `muted` set via the
   property rather than the attribute, play() kicked off from script so it can
   be withheld under prefers-reduced-motion — in which case the poster simply
   stays, which is why a work that moves still has to name a still. The card's
   title is real text inside the same link, so the frame is decorative here
   exactly as the <Image> it replaces is: aria-hidden, no captions. */

export default function WorkClip({
  src,
  poster,
  width,
  height,
  focus,
  className,
}: {
  src: string;
  poster: string;
  /** the poster's intrinsic size — the attributes reserve the card's box, the
      same job lib/mediaSizes.ts does for a still */
  width: number;
  height: number;
  /** object-position, when the wall's 4:5 crop should not stay centred */
  focus?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;

    if (prefersReducedMotion()) return;

    // Plays only while on screen AND the header's motion switch is on; both
    // are re-checked whenever either changes, so switching motion back on
    // does not start a clip that is scrolled out of view.
    let onScreen = typeof IntersectionObserver !== "function";
    const sync = () => {
      if (onScreen && !motionOff()) {
        v.play().catch(() => {
          /* autoplay may be blocked; the poster stays visible */
        });
      } else {
        v.pause();
      }
    };
    const unwatch = watchMotion(sync);

    if (typeof IntersectionObserver !== "function") {
      sync();
      return unwatch;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      // A sliver is enough to count as on screen: the card enters from the
      // bottom edge, and waiting for a fraction of it would start the clip
      // late on exactly the reader who is scrolling slowly enough to notice.
      { threshold: 0.01 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      unwatch();
    };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      width={width}
      height={height}
      style={focus ? { objectPosition: focus } : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

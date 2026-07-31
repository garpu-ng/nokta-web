"use client";

import { useEffect, useRef } from "react";
import styles from "./TeaserVideo.module.css";

/* The studio teaser, full-bleed, opening the homepage.

   The clip is 1280 × 507 (2.52:1) and is shown at exactly that ratio rather
   than cropped into a taller box — an aspect-ratio box, not a fixed height,
   so the band keeps its proportion at every width. The band carries the
   page's h1 off-screen, which is why the copy still arrives as props: the
   video is a client component and never reaches for a dictionary itself.

   House pattern for every clip on the site: `muted` set via the property
   (more reliable than the attribute across browsers), and play() kicked off
   from an effect rather than the native `autoplay` attribute so it can be
   suppressed under prefers-reduced-motion — in which case the poster frame
   simply stays. The video carries no information the headline doesn't, so it
   is decorative: aria-hidden, no captions. */

export default function TeaserVideo({
  lead1,
  lead2,
}: {
  lead1: string;
  lead2: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    // Honour prefers-reduced-motion: leave the video paused on its poster frame.
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    v.play().catch(() => {
      /* autoplay may be blocked; the poster stays visible */
    });
  }, []);

  return (
    <section className={styles.hero}>
      <video
        ref={ref}
        className={styles.video}
        poster="/noktateaser-poster.jpg?v=29"
        muted
        loop
        playsInline
        /* metadata, not auto: the clip is 2.25 MB and sits above the fold, so
           `auto` pulled the whole file down on every cold homepage load before
           the reader had done anything. The poster (24 KB) is what carries the
           band until the video is actually wanted, and under
           prefers-reduced-motion the file is never fetched at all. */
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/noktateaser.mp4?v=29" type="video/mp4" />
      </video>
      {/* The band shows the film and nothing else — no scrim, no set headline
          over the frame. The page's h1 stays, off-screen rather than
          display:none, so the document still opens on a heading for the
          outline and for a screen reader: the two sentences, each closing on
          its point, as they used to be set. */}
      <h1 className="nk-sr-only">{`${lead1}. ${lead2}.`}</h1>
    </section>
  );
}

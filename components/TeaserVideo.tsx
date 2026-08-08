"use client";

import { useEffect, useRef } from "react";
import styles from "./TeaserVideo.module.css";

/* The studio teaser, full-bleed, opening the homepage.

   The band is 2.52:1 — an aspect-ratio box, not a fixed height, so it keeps
   its proportion at every width. That figure was once the teaser film's own;
   it is now the page's, and a clip is cut to it rather than the other way
   round. The clip here is a 1920 × 1080 render, so `object-fit: cover` takes
   its centre band (the top of the sky and the bottom of the water fall
   outside) and the film is delivered whole because the phone turns the same
   box portrait and wants that height back. The band carries the page's h1
   off-screen, which is why the copy still arrives as props: the video is a
   client component and never reaches for a dictionary itself.

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
        /* The clip's own first frame, not a chosen one: this is a single
           continuous shot that opens dark and comes up, so a brighter still
           would pop the moment playback started. Under prefers-reduced-motion
           it is the whole film, and it still carries the mark. */
        poster="/noktasinus-poster.jpg?v=1"
        muted
        loop
        playsInline
        /* metadata, not auto: the clip is 2.2 MB and sits above the fold, so
           `auto` pulled the whole file down on every cold homepage load before
           the reader had done anything. The poster (28 KB) is what carries the
           band until the video is actually wanted, and under
           prefers-reduced-motion the file is never fetched at all. */
        preload="metadata"
        aria-hidden="true"
      >
        {/* The `?v=` is the handle for re-encoding a clip in place: bump it and
            every cache lets go of the old bytes. */}
        <source src="/noktasinus.mp4?v=1" type="video/mp4" />
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

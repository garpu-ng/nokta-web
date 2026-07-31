"use client";

import { useCallback, useRef } from "react";

/* A portrait that plays itself once and then stays played.

   THE CONTRACT:
     1. It rests on its FIRST frame. Nothing moves until a pointer arrives.
     2. Hovering runs it; leaving pauses it where it stands. It only ever
        advances under a pointer, and re-entering resumes rather than
        restarts — the drawing is being revealed, not replayed.
     3. When it runs out it is FINISHED for this page view. The browser holds
        the last painted frame, and hovering again does nothing at all. This
        is the one thing a <video> will not do for you: play() on an ended
        element rewinds it to zero and plays it a second time, so the guard
        below is the whole point of the component.
     4. There is no `loop`, and there never should be.

   Whether this is used at all is a CSS decision, not a JS one: /studio hides
   the clip and shows a still wherever there is no real pointer or the reader
   has asked for less motion (see .clip / .still in the page's module). The
   still is this clip's own last frame, so the two are the same drawing —
   which is why nothing has to be kept in sync when the plate swaps.

   Converted from an opaque source GIF, like the flying-head clips that used
   to sit in these plates. A transparent animation could not ship this way —
   neither H.264 nor the VP9 profile used here carries an alpha channel that
   every browser will honour. */
type Props = {
  /** VP9/WebM first, H.264/mp4 second: the browser takes the first it can
      decode, and between them they cover everything that ships today. */
  sources: { src: string; type: string }[];
  /** intrinsic width in px (aspect-ratio hint; CSS still controls display size) */
  width: number;
  /** intrinsic height in px */
  height: number;
  className?: string;
};

/* An empty box is not a poster. `preload="metadata"` alone only promises the
   duration and the dimensions — a browser is free to paint nothing at all
   until playback starts, and here playback may never start, because it waits
   on a pointer that might never arrive. A media fragment pointing a hair past
   zero makes the request a seek: the browser fetches that frame and paints
   it. So the first frame IS the poster, at no extra asset. */
function firstFrame(src: string): string {
  return src.includes("#") ? src : `${src}#t=0.001`;
}

export default function PortraitClip({ sources, width, height, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  const run = useCallback(() => {
    const v = ref.current;
    if (!v || v.ended) return;
    // Set muted on the property rather than trusting the attribute — the
    // house pattern, and what keeps autoplay policy from blocking play().
    v.muted = true;
    v.play().catch(() => {
      /* playback may be refused; the frame it is on stays visible */
    });
  }, []);

  const hold = useCallback(() => {
    const v = ref.current;
    if (!v || v.ended) return;
    v.pause();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      width={width}
      height={height}
      muted
      playsInline
      preload="metadata"
      // Decorative: the name is set as real text in the card below it.
      aria-hidden="true"
      onMouseEnter={run}
      onMouseLeave={hold}
    >
      {sources.map((s) => (
        <source key={s.src} src={firstFrame(s.src)} type={s.type} />
      ))}
    </video>
  );
}

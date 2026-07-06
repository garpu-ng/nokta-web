"use client";

import { useEffect, useRef } from "react";
import styles from "./TeaserVideo.module.css";

// Muted-autoplay teaser banner with the nokta. wordmark centred on it. Sets
// muted via the property (more reliable than the attribute across browsers)
// and kicks off play() on mount.
export default function TeaserVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {
      /* autoplay may be blocked; the poster stays visible */
    });
  }, []);

  return (
    <div className={styles.teaser} aria-hidden="true">
      <video
        ref={ref}
        className={styles.video}
        poster="/noktateaser-poster.jpg?v=28"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/noktateaser.mp4?v=28" type="video/mp4" />
      </video>
      <span className={styles.logo}>
        nokta<span className={styles.dot}>.</span>
      </span>
    </div>
  );
}

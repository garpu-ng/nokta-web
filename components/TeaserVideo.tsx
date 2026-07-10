"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
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
        poster="/noktateaser-poster.jpg?v=29"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/noktateaser.mp4?v=29" type="video/mp4" />
      </video>
      <span className={styles.logo}>
        <Image
          src="/nokta_logo.png"
          alt=""
          aria-hidden="true"
          width={2000}
          height={410}
          className={styles.logoImg}
        />
      </span>
    </div>
  );
}

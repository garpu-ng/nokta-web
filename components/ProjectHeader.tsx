"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./ProjectHeader.module.css";

/* The header every piece of work wears: where to go back to, the title, and the
   one annotation line (kind · year · client-or-Eigenprojekt) — identical to the
   card the work has on the wall. A floating copy of the title slides in from the
   top once you have scrolled well past the real header, so a long image stack
   never loses its label. */

interface Props {
  title: string;
  /** the pre-translated annotation line, rendered under the title */
  anno?: ReactNode;
  backHref: string;
  backLabel: string;
}

export default function ProjectHeader({ title, anno, backHref, backLabel }: Props) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [fixed, setFixed] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Trigger after scrolling past the header bottom + 500px extra
    const threshold = header.offsetTop + header.offsetHeight + 500;

    const onScroll = () => setFixed(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Original header — stays in normal document flow */}
      <div ref={headerRef} className={styles.header}>
        <Link href={backHref} className={styles.back}>{backLabel}</Link>
        <h1>{title}</h1>
        {anno ? <p className={styles.anno}>{anno}</p> : null}
      </div>

      {/* Floating sticky frame — slides in from top when scrolled far enough */}
      <div className={`${styles.sticky}${fixed ? " " + styles.stickyVisible : ""}`}>
        <div className={styles.stickyTitle}>{title}</div>
        {anno ? <div className={`${styles.anno} ${styles.stickyAnno}`}>{anno}</div> : null}
      </div>
    </>
  );
}

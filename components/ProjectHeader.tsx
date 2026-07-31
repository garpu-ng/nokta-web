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

/** How far past the header's bottom edge the floating card takes over, in px. */
const LEAD = 500;

export default function ProjectHeader({ title, anno, backHref, backLabel }: Props) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [fixed, setFixed] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    if (typeof IntersectionObserver === "undefined") return;

    /* Where the card takes over is a fact about the layout, so the layout is
       what answers: the root grows LEAD px upward and the header is the target,
       so it stops intersecting exactly LEAD px past its own bottom edge — a
       line that follows a resize, a rotation or a late webfont. The threshold
       this replaces was measured once at mount and never again; it also read
       offsetTop against the nearest positioned ancestor rather than the page,
       so the lead ran short by the height of the masthead on top of that.

       The bottom-edge test is what makes !isIntersecting mean "scrolled past"
       rather than "not reached yet" — both read as not intersecting. No
       sentinel: the header is itself the thing the reader scrolls past. */
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        setFixed(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
      },
      { rootMargin: `${LEAD}px 0px 0px 0px`, threshold: 0 },
    );
    io.observe(header);
    return () => io.disconnect();
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

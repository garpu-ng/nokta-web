"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./ProjectHeader.module.css";

interface Props {
  title: string;
  client: string;
  category: string;
  year: string | number;
  description: string;
}

export default function ProjectHeader({ title, client, category, year, description }: Props) {
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
        <Link href="/arch" className={styles.back}>← Alle Projekte</Link>
        <h1>{title}</h1>
        <p className={styles.projectMeta}>
          {client} &nbsp;·&nbsp; {category} &nbsp;·&nbsp; {year}
        </p>
        <p style={{ fontSize: "0.95rem", color: "var(--on-brand)", opacity: 0.9, maxWidth: "560px", lineHeight: 1.7 }}>
          {description}
        </p>
      </div>

      {/* Floating sticky frame — slides in from top when scrolled far enough */}
      <div className={`${styles.sticky}${fixed ? " " + styles.stickyVisible : ""}`}>
        <div className={styles.stickyTitle}>{title}</div>
        <div className={`${styles.projectMeta} ${styles.stickyMeta}`}>
          {category} &nbsp;·&nbsp; {year}
        </div>
      </div>
    </>
  );
}

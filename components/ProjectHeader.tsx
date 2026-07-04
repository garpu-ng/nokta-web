"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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
      <div ref={headerRef} className="wa-project-header">
        <Link href="/" className="wa-back">← Alle Projekte</Link>
        <h1>{title}</h1>
        <p className="wa-project-meta">
          {client} &nbsp;·&nbsp; {category} &nbsp;·&nbsp; {year}
        </p>
        <p style={{ fontSize: "0.95rem", color: "#555", maxWidth: "560px", lineHeight: 1.7 }}>
          {description}
        </p>
      </div>

      {/* Floating sticky frame — slides in from top when scrolled far enough */}
      <div className={`wa-project-sticky${fixed ? " wa-project-sticky--visible" : ""}`}>
        <div className="wa-project-sticky-title">{title}</div>
        <div className="wa-project-meta wa-project-sticky-meta">
          {category} &nbsp;·&nbsp; {year}
        </div>
      </div>
    </>
  );
}

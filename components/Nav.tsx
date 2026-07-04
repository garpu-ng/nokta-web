"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Projekte" },
  { href: "/prozess", label: "Prozess" },
  { href: "/studio", label: "Studio" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Nav() {
  const path = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Below this width the nav is a static top bar — never translate it.
    const mobile = window.matchMedia("(max-width: 767px)");

    // Nav's natural vertical center, measured with the transform neutralised.
    let naturalCenter = 0;
    const measure = () => {
      const prev = nav.style.transform;
      nav.style.transform = "none";
      const rect = nav.getBoundingClientRect();
      naturalCenter = rect.top + rect.height / 2;
      nav.style.transform = prev;
    };
    measure();

    const onScroll = () => {
      if (mobile.matches) {
        setTranslateY(0);
      } else if (window.scrollY > 30) {
        setTranslateY(window.innerHeight / 2 - naturalCenter);
      } else {
        setTranslateY(0);
      }
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={navRef}
      className="nav dropdown smaller big"
      style={{
        transform: `translateY(${translateY}px)`,
        transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Link href="/" className="new-logo w-inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="WaArchi" className="wa-logo" />
      </Link>

      {links.map(({ href, label }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="link-5 big"
            style={{ opacity: active ? 1 : 0.45 }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

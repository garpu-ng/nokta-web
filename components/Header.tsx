"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRANCHES, branchForPath } from "@/lib/branches";

/**
 * The one constant on the site. Stays in the neutral "nokta" identity on every
 * branch — except the dot, which adopts the active branch's motto-colour
 * (driven by --brand-accent, so it transitions with the background wash).
 */
export default function Header() {
  const pathname = usePathname();
  const active = branchForPath(pathname);

  return (
    <header className="nk-header">
      <Link href="/" className="nk-wordmark" aria-label="nokta — Startseite">
        nokta<span className="nk-dot" aria-hidden="true">.</span>
      </Link>

      <nav className="nk-tabs">
        {BRANCHES.map((b) => (
          <Link
            key={b.key}
            href={b.path}
            className={`nk-tab${active === b.key ? " nk-tab--active" : ""}`}
          >
            {b.label}
          </Link>
        ))}
        <span className="nk-tabs-sep" aria-hidden="true" />
        <Link
          href="/studio"
          className={`nk-tab nk-tab--muted${pathname.startsWith("/studio") ? " nk-tab--active" : ""}`}
        >
          studio
        </Link>
        <Link
          href="/kontakt"
          className={`nk-tab nk-tab--muted${pathname.startsWith("/kontakt") ? " nk-tab--active" : ""}`}
        >
          kontakt
        </Link>
      </nav>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavLinks.module.css";

/* The four pages of the sheet. Each is set lowercase with its own trailing
   period — the copy carries the period, not the CSS, so a locale is free to
   drop it (Japanese sets 。 or nothing at all).

   The active page is marked by a 2px accent rule under the word. It is the
   ONE piece of chrome that has to know where the reader is, and the answer
   comes from the router rather than from state: usePathname() is already
   correct on the first client render, so nothing flashes into place. */

type Item = { href: string; label: string };

export default function NavLinks({
  items,
  navLabel,
}: {
  items: Item[];
  navLabel: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label={navLabel}>
      {items.map(({ href, label }) => {
        // "/" matches only itself; every other page also owns its subtree, so
        // /arbeiten/teahouse marks "arbeiten." — a work is not a page you
        // arrived at sideways, it is one of the things hanging on the wall the
        // nav item names.
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={styles.link}
            aria-current={active ? "page" : undefined}
          >
            {label}
            {/* The rule stops 6px short of the right edge so it runs under the
                word and not under its period. Drawn as a span rather than a
                border so it can do exactly that. */}
            {active ? <span className={styles.rule} aria-hidden="true" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

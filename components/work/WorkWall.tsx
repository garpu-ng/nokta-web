"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import type { WorkKind } from "@/lib/works";
import WorkCard, { type WallItem } from "./WorkCard";
import styles from "./WorkWall.module.css";

/* The wall: every piece the studio shows, the shop's line prints included,
   in an order the page shuffles on each visit. The kinds are stamps and a
   filter, never sections, never headings.

   "Alle" leads the chips and is where the wall opens: the page is the overview
   now, and the two doors above it (app/arbeiten/page.tsx) are the way into one
   material in depth. A chip narrows the wall to one kind. Filtering only hides
   cards (display:none), so the images stay decoded and the order never
   shifts; without JS the row is simply inert on what the URL named.

   The filter spends no colour. The chips are hairline outlines, and the ONE
   that is pressed is filled creme with ink type on it. The chip itself is the
   site's .nk-chip (app/styles/base.css), the same object /kontakt offers its
   four subjects with.

   The cards enter through the shared Reveal primitive, staggered left-then-
   right so a row lands as a pair rather than a block.

   Which filter the wall opens on is decided on the server: /arbeiten?kind=
   rendering renders the renderings, so the homepage's doors land on their own
   material rather than flashing another one and then swapping. */

/** A chip's value: one kind, or the whole wall. */
export type WallFilter = WorkKind | "all";

export default function WorkWall({
  items,
  kinds,
  listLabel,
  initialKind,
  allLabel,
  wallClassName,
}: {
  items: WallItem[];
  /** the kinds present on the wall, in a fixed order, with their translated stamps */
  kinds: { kind: WorkKind; label: string }[];
  listLabel: string;
  /** what the wall opens on; the page resolves it from ?kind= */
  initialKind: WallFilter;
  /** the translated label of the chip that shows everything */
  allLabel: string;
  /** the page's own class name for the wall — the page keeps owning how it
      looks */
  wallClassName: string;
}) {
  const [active, setActive] = useState<WallFilter>(initialKind);
  const shows = (kind: WorkKind, filter: WallFilter) => filter === "all" || kind === filter;

  /* Which card the reader actually sees first, and therefore which image is
     the page's LCP. Filtering only hides cards, so it is the first item the
     server-rendered filter leaves standing — /arbeiten?kind=rendering must
     hand its priority to the first rendering, not to the first card in the
     wall order. Read from initialKind rather than the live filter: this
     decides the FIRST paint, and pressing a chip later must not re-prioritise
     images the browser has already fetched. */
  const leadSlug = items.find((item) => shows(item.kind, initialKind))?.slug;

  /* Where each card sits on the sheet the reader is looking at, which is not
     where it sits in the running order: the fourth print is the twelfth item
     on the wall. The stagger below alternates on this seat, and counting items
     instead would hand both halves of a row the same beat — the renderings
     land at 0, 2, 4, 6, 8, 11, so five of the six would have entered
     together. */
  const seats = new Map<string, number>();
  for (const item of items) {
    if (shows(item.kind, active)) seats.set(item.slug, seats.size);
  }

  /* Keep the URL honest about what is on screen, so a narrowed wall can be
     copied out of the address bar — the server already reads ?kind= and
     renders the same set. replaceState rather than the router: this is the
     same page with a different filter, and a real navigation would refetch it
     and cost a flash. History is replaced, not pushed, so the back button
     still leaves the wall instead of walking back through filter states. */
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const url = active === "all" ? window.location.pathname : `?kind=${active}`;
    window.history.replaceState(null, "", url);
  }, [active]);

  return (
    <>
      <div className={wallClassName}>
        <div className={styles.filter}>
          <button
            type="button"
            className="nk-chip"
            aria-pressed={active === "all"}
            onClick={() => setActive("all")}
          >
            {allLabel}
          </button>
          {kinds.map(({ kind, label }) => (
            <button
              key={kind}
              type="button"
              className="nk-chip"
              aria-pressed={active === kind}
              onClick={() => setActive(kind)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Always aligned: a shuffled wall has no curated neighbours, so the
            hand-pinned hanging (spans and lifts, drawn for one fixed order)
            would land at random. Every card hangs two-up instead; the cells
            still carry span and lift, which the module CSS overrides. */}
        <ul className={`${styles.grid} ${styles.aligned}`} aria-label={listLabel}>
          {items.map((item) => (
            <li
              key={item.slug}
              className={`${styles.cell} ${styles[`span${item.span}`]}${
                !shows(item.kind, active) ? ` ${styles.filteredOut}` : ""
              }`}
              style={{ "--lift": `${item.lift}rem` } as React.CSSProperties}
            >
              {/* The wall reads two-up, so the stagger alternates: the left
                  sheet is pinned, then the right one a beat later. */}
              <Reveal delay={((seats.get(item.slug) ?? 0) % 2) * 90}>
                <WorkCard item={item} lead={item.slug === leadSlug} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

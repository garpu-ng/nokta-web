"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Reveal from "@/components/Reveal";
import { isWorkKind, type WorkKind } from "@/lib/works";
import WorkCard, { type WallItem } from "./WorkCard";
import styles from "./WorkWall.module.css";

/* The wall: every piece the studio shows, the shop's line prints included,
   in one fixed order. The kinds are stamps and a filter, never sections,
   never headings.

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

   The page prerenders the whole wall. A copied /arbeiten?kind= link is applied
   by a blocking script before paint (app/[locale]/arbeiten/page.tsx). This
   component catches up after hydration and keeps the attribute in step with
   the chips. The document itself does not vary by the query, which is what
   lets the four languages be cached. */

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
  // The prerender is always the full wall. The address bar is read here so the
  // chips and the hidden cards match ?kind= once React is running.
  const fromUrl = useSyncExternalStore(
    () => () => {},
    () => {
      const requested = new URLSearchParams(window.location.search).get("kind");
      return isWorkKind(requested) && kinds.some((k) => k.kind === requested)
        ? requested
        : "all";
    },
    () => initialKind,
  );
  const [picked, setPicked] = useState<WallFilter | null>(null);
  const active = picked ?? fromUrl;
  // False only for the hydration render, which still believes the wall is
  // unfiltered. Touching data-nk-wall then would undo the script and flash
  // every card before the client snapshot arrives.
  const clientReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const shows = (kind: WorkKind, filter: WallFilter) => filter === "all" || kind === filter;

  useLayoutEffect(() => {
    if (!clientReady) return;
    const root = document.documentElement;
    if (active === "all") delete root.dataset.nkWall;
    else root.dataset.nkWall = active;
    return () => {
      delete root.dataset.nkWall;
    };
  }, [clientReady, active]);

  /* Which image is fetched first. The HTML is the whole wall, so this stays
     the first card of that wall. Pressing a chip later must not re-prioritise
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
     copied out of the address bar. replaceState rather than the router: this
     is the same page with a different filter, and a real navigation would
     refetch it and cost a flash. History is replaced, not pushed, so the back
     button still leaves the wall instead of walking back through filter states. */
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
            data-wall-filter="all"
            onClick={() => setPicked("all")}
          >
            {allLabel}
          </button>
          {kinds.map(({ kind, label }) => (
            <button
              key={kind}
              type="button"
              className="nk-chip"
              aria-pressed={active === kind}
              data-wall-filter={kind}
              onClick={() => setPicked(kind)}
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
              data-wall-kind={item.kind}
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

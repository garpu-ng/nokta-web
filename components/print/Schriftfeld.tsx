"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./Schriftfeld.module.css";

/* The live title block.

   Every technical drawing carries a Schriftfeld in its bottom-right corner: who
   drew it, which sheet of how many, at what scale, and where. This is that
   block, kept alive — it says which sheet you are holding, how far down it you
   have read (as a drawing scale, ticking through the standard steps the way an
   instrument does), and where the studio stands.

   It is notation, not copy: every value is a number, a path, a locale code or a
   coordinate, so it needs no dictionary entry in any language and adds no i18n
   key. aria-hidden and pointer-events none — a screen reader is told the same
   facts by the page itself, and the block can never be in the way of a click.
   It fades almost out when the hand comes near, so it never sits on top of
   something being read.

   Desktop only (≥1100px, CSS and the listeners agree on that). Under a
   reduced-motion request it still stands — it is information, not decoration —
   only the tick that marks a changed value is dropped. */

/** Where the studio is. Düsseldorf, to the arc-minute. */
const PLACE = "51°14′N 6°47′E";
/** The standard drawing scales, coarse to fine: the top of a page is a plan,
    the bottom is a detail. */
const SCALES = [500, 200, 100, 50, 20, 10, 5, 2, 1] as const;
/** The block fades out of the way inside this radius, in px. */
const NEAR = 120;
const DESKTOP = "(min-width: 1100px)";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** The sheet field: a work is one of the thirteen, anywhere else is a path. */
function sheet(pathname: string, sheets: string[]): string {
  const match = /^\/arbeiten\/(.+?)\/?$/.exec(pathname);
  if (match) {
    const i = sheets.indexOf(decodeURIComponent(match[1]));
    if (i >= 0) return `${pad(i + 1)} / ${pad(sheets.length)}`;
  }
  return pathname;
}

export default function Schriftfeld({
  locale,
  sheets,
}: {
  /** the current locale code — a code, not a word */
  locale: string;
  /** the wall's slugs in curated order; the sheet number is an index into it */
  sheets: string[];
}) {
  const pathname = usePathname();
  const blockRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const block = blockRef.current;
    const scale = scaleRef.current;
    if (!block || !scale) return;
    if (typeof window.matchMedia !== "function") return;

    const desktop = window.matchMedia(DESKTOP);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let scrollRaf = 0;
    let printed = "";
    let near = false;
    let box = { left: 0, top: 0, right: 0, bottom: 0 };

    const measure = () => {
      const r = block.getBoundingClientRect();
      box = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    };

    // How far down the sheet the reader is, expressed as the scale they are
    // reading at: the whole page at 1:500, the last line at 1:1.
    const readScale = () => {
      const runway = document.documentElement.scrollHeight - window.innerHeight;
      const p = runway > 4 ? Math.min(1, Math.max(0, window.scrollY / runway)) : 0;
      const step = Math.min(SCALES.length - 1, Math.floor(p * SCALES.length));
      const next = `1:${SCALES[step]}`;
      if (next === printed) return;
      printed = next;
      scale.textContent = next;
      if (still.matches) return;
      // The tick: the value is struck rather than swapped. Restarting the
      // animation needs the class off, a reflow read, then the class on.
      scale.classList.remove(styles.tick);
      void scale.offsetWidth;
      scale.classList.add(styles.tick);
    };

    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        readScale();
      });
    };

    // The block steps aside rather than blocking a line of text: within 120px
    // of the hand it drops to a ghost of itself.
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      const { clientX: x, clientY: y } = e;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const dx = Math.max(box.left - x, 0, x - box.right);
        const dy = Math.max(box.top - y, 0, y - box.bottom);
        const isNear = dx * dx + dy * dy < NEAR * NEAR;
        if (isNear === near) return;
        near = isNear;
        block.classList.toggle(styles.near, isNear);
      });
    };

    const onResize = () => {
      measure();
      readScale();
    };

    let attached = false;
    const sync = () => {
      if (desktop.matches === attached) return;
      attached = desktop.matches;
      if (attached) {
        measure();
        readScale();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("resize", onResize, { passive: true });
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("resize", onResize);
      }
    };
    sync();
    desktop.addEventListener("change", sync);

    return () => {
      desktop.removeEventListener("change", sync);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
    // The path is part of the block's content: a new route re-measures it.
  }, [pathname]);

  return (
    <div ref={blockRef} className={styles.block} aria-hidden="true">
      <div className={styles.row}>
        <span className={styles.word}>
          nokta<span className={styles.dot}>.</span>
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.sheet}>{sheet(pathname, sheets)}</span>
        {/* Server-rendered at the top of the sheet; the effect takes it from
            there. Without JS it simply states the scale you are reading at. */}
        <span ref={scaleRef} className={styles.scale}>
          1:{SCALES[0]}
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.locale}>{locale}</span>
        <span className={styles.place}>{PLACE}</span>
      </div>
    </div>
  );
}

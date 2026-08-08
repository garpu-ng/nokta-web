"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import styles from "./Reveal.module.css";

/* The site's one entrance primitive — a sheet being laid onto the wall.

   THE CONTRACT (in this order, it matters):
     1. Children render FINISHED. The server-rendered markup carries no
        pre-state at all, so without JS — and for anything already on screen
        when the page paints — the content simply *is* there. Nothing is ever
        hidden by markup we might fail to un-hide.
     2. JS arms the pre-state only for boxes that sit BELOW the fold at mount.
        Hiding something the reader has not seen yet is invisible; hiding
        something already painted would be a flash, so we never do it.
     3. An IntersectionObserver then plays the reveal once, and disconnects.
        One entrance per element per page view — nothing re-animates on the
        way back up.
     4. prefers-reduced-motion: reduce → step 2 never happens (and the CSS
        neutralises the pre-state as a second line of defence). Finished,
        instantly.

   Only transform / opacity / clip-path move, so a reveal can never shift the
   layout around it.

   The two state classes are put on the node imperatively rather than through
   React state: the pre-state is a fact about the viewport, not about the tree,
   and a wall of cards should not re-render once per card on the way
   down the page. React leaves the class attribute alone as long as the
   rendered className string doesn't change — and it never does here. */

type Props = {
  children: ReactNode;
  /** the wrapper tag — must be a real box (never display:contents) */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** stagger for this box, in ms — the caller decides the choreography */
  delay?: number;
  /** "rise": lift + fade (cards, rows, sections).
      "wipe": a soft clip-path opening from the bottom edge (image plates). */
  variant?: "rise" | "wipe";
};

/** Boxes whose top sits above this fraction of the viewport at mount are
    treated as "already seen" and left finished. */
const FOLD = 0.92;

export default function Reveal({
  children,
  as: Tag = "div",
  className,
  style,
  delay = 0,
  variant = "rise",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return; // finished, and it stays finished
    }
    if (typeof IntersectionObserver === "undefined") return;
    // Already painted where the reader can see it → never pull it back.
    if (el.getBoundingClientRect().top < window.innerHeight * FOLD) return;

    el.classList.add(styles.armed);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.classList.add(styles.shown);
          io.disconnect();
        }
      },
      // The bottom edge is pulled up a little so a card starts its entrance
      // just after it has cleared the fold, not the instant it grazes it.
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${styles[variant]}${className ? ` ${className}` : ""}`}
      style={delay ? { ...style, "--reveal-delay": `${delay}ms` } : style}
    >
      {children}
    </Tag>
  );
}

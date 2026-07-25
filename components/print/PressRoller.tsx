"use client";

import { useEffect, useState } from "react";
import styles from "./PressRoller.module.css";

/* The press roller — the site's page transition.

   Next 16's View Transitions integration is still flagged experimental and its
   own docs advise against production use (and React 19.2 stable ships no
   <ViewTransition>), so this is deliberately NOT built on it. Intercepting link
   clicks to orchestrate an exit would be worse: it would put a script between
   the reader and every navigation. So the transition is entry-only, which is
   also the honest reading of the metaphor — the outgoing sheet is simply taken
   off, and the incoming one comes off the press under the roller.

   app/template.tsx remounts this on every navigation, which is the whole
   mechanism: a module-level flag is raised by the first mount's effect, so the
   FIRST view of a session — the document load, where a black bar sweeping the
   screen would only be a delay in front of the content — plays nothing, and
   every client-side navigation after it rolls. The flag is only ever written
   from an effect, so it stays false on the server and the SSR markup (nothing)
   always matches what hydration renders.

   The bar stays mounted, parked off-screen right, for the life of the page.
   That is on purpose: base.css keys the incoming page's flat fade off its
   presence (`body:has(.nk-roller)`), and unmounting it would flip that rule
   back and restart the entrance. Parked, it is a 0-cost off-screen box.

   Reduced motion: the roller never renders, and the page arrives the way it
   does today. */

/** Raised once the first template mount has happened — on the client only. */
let rolled = false;

function wants(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function PressRoller() {
  // Read at mount, never updated: whether THIS navigation rolls is decided
  // once, before the incoming page paints.
  const [rolling] = useState(() => rolled && wants());

  useEffect(() => {
    rolled = true;
  }, []);

  if (!rolling) return null;
  // `nk-roller` is the global hook base.css matches on; the module class is
  // the paint.
  return <div className={`nk-roller ${styles.roller}`} aria-hidden="true" />;
}

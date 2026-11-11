/* The site-wide motion switch (WCAG 2.2.2 Pause, Stop, Hide).

   One fact, kept in one place: `data-motion="off"` on <html>. The header's
   MotionToggle writes it (and remembers it in localStorage), an inline script
   in app/layout.tsx restores it before the first paint, CSS in base.css stops
   every keyframe animation under it, and the canvases and looping clips read
   it here. An attribute rather than React state because the things that obey
   it are not in one tree: a plate's rAF loop, a <video>, a stylesheet.

   Client-only. Every function touches `document`, so call them from effects. */

export const MOTION_ATTR = "data-motion";
export const MOTION_KEY = "nk_motion";

/** Runs inline before the page paints (app/layout.tsx). Plain ES5 in a
    string, wrapped in try: storage can throw (Safari private mode, blocked
    cookies), and a failure here must never stop the page. */
export const MOTION_INIT_SCRIPT = `try{if(localStorage.getItem("${MOTION_KEY}")==="off")document.documentElement.setAttribute("${MOTION_ATTR}","off")}catch(e){}`;

/** The reader has switched motion off on this site. */
export function motionOff(): boolean {
  return document.documentElement.getAttribute(MOTION_ATTR) === "off";
}

/** The OS asks for less motion. Read once per mount, like every plate did. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Call `cb` whenever the switch changes. A MutationObserver on the attribute
    rather than a custom event, so it also hears a change made by anything
    else that sets it, and nobody has to remember to dispatch anything. */
export function watchMotion(cb: (off: boolean) => void): () => void {
  if (typeof MutationObserver === "undefined") return () => {};
  const mo = new MutationObserver(() => cb(motionOff()));
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [MOTION_ATTR],
  });
  return () => mo.disconnect();
}

/** Set the switch and remember it. */
export function setMotionOff(off: boolean): void {
  const root = document.documentElement;
  if (off) root.setAttribute(MOTION_ATTR, "off");
  else root.removeAttribute(MOTION_ATTR);
  try {
    if (off) localStorage.setItem(MOTION_KEY, "off");
    else localStorage.removeItem(MOTION_KEY);
  } catch {
    /* storage unavailable: the switch still holds for this page view */
  }
}

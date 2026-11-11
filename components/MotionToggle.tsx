"use client";

import { useSyncExternalStore } from "react";
import { motionOff, setMotionOff, watchMotion } from "@/lib/motion";
import styles from "./MotionToggle.module.css";

/* The switch that stops everything on the site that moves by itself: the
   plates, the looping clips, the marks and the moiré rules (WCAG 2.2.2).
   prefers-reduced-motion already did this for readers who set it in their
   system; this is for the reader who only wants it here, or only now.

   It owns no motion itself. It sets one attribute on <html> (lib/motion.ts)
   and everything that moves listens to that. The state is read through
   useSyncExternalStore with a server snapshot of "on", so hydration matches
   the server markup and the pressed state follows a moment later, from the
   attribute the inline script in app/layout.tsx restored before paint.

   One accessible name that does not change ("Bewegung anhalten") and
   aria-pressed for the state, which is how a toggle is announced. The visible
   word is the start of that name, so a voice command can say what it sees. */

const subscribe = (cb: () => void) => watchMotion(cb);
const getSnapshot = () => motionOff();
const getServerSnapshot = () => false;

export default function MotionToggle({
  label,
  name,
}: {
  /** the short visible word */
  label: string;
  /** the full accessible name; must begin with `label` */
  name: string;
}) {
  const off = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      className={`${styles.toggle}${off ? " " + styles.off : ""}`}
      aria-pressed={off}
      aria-label={name}
      onClick={() => setMotionOff(!off)}
    >
      {/* Shows what pressing will do: two bars while things move, a play
          triangle once they have stopped. Drawn, so no icon font. */}
      <svg
        className={styles.glyph}
        viewBox="0 0 10 10"
        aria-hidden="true"
        focusable="false"
      >
        {off ? (
          <path d="M2 1 L9 5 L2 9 Z" fill="currentColor" />
        ) : (
          <>
            <rect x="2" y="1" width="2" height="8" fill="currentColor" />
            <rect x="6" y="1" width="2" height="8" fill="currentColor" />
          </>
        )}
      </svg>
      <span className={styles.word}>{label}</span>
    </button>
  );
}

import type { ReactNode } from "react";
import styles from "./Backdrop.module.css";

/* A plate hung BEHIND a page rather than framed on it.

   Fixed to the viewport, not to the document: a backdrop spanning a three
   thousand pixel page would need a three thousand pixel canvas, and would
   cost roughly ten times what this does to say the same thing. Pinned to the
   viewport it is always exactly one screen, and the page slides over it —
   which also gives the reader the one thing a static background never does,
   a sense that the sheet is moving across something.

   Stacking: the masthead already declares `z-index: 2` in layout.module.css
   expressly so page content cannot cover it, and page content is the
   z-index-1 `.nk-page-fade`. This sits at 0 inside that, so it is under
   everything the page draws and under the masthead too.

   It is decoration and says so twice: aria-hidden here, and every plate
   marks its own canvas aria-hidden as well. */

export default function Backdrop({
  children,
  /** How far up the plate is allowed to come. Backdrops are quiet by rule. */
  dim = 0.22,
}: {
  children: ReactNode;
  dim?: number;
}) {
  return (
    <div className={styles.backdrop} style={{ opacity: dim }} aria-hidden="true">
      {children}
    </div>
  );
}

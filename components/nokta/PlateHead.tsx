import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import styles from "./PlateHead.module.css";

/* The masthead every page now wears: a generative plate with the page's own
   title cut out of it.

   A page used to open on a heading, and then — if it was lucky — on a piece
   of art underneath. It opens on one object instead. The plate is not a
   decoration behind the title and the title is not a caption on the plate:
   the art is knocked out around the letters, so neither can be removed
   without the other stopping making sense.

   Which plate is the page's own business — the raster on the homepage and
   /kontakt, the turning discs on /arbeiten, the ruled field on /studio. All
   this owns is the frame they hang in, the one proportion they all hang at,
   and the rule that the real heading survives.

   THE HEADING IS REAL. The canvas is decoration and hidden from assistive
   tech, so the h1 is rendered as text and hidden VISUALLY instead —
   off-screen, not display:none, which would take it out of the accessibility
   tree that is the only reason it is there. A page's title is the last thing
   on a site that may exist only as pixels: the document outline, and every
   crawler that has never run a canvas, still find it. */

export default function PlateHead({
  title,
  children,
}: {
  /** The page's heading, exactly as the plate is drawing it. */
  title: string;
  /** The plate. Give it the same string as `motto`. */
  children: ReactNode;
}) {
  return (
    <Reveal as="header" className={styles.head} variant="wipe">
      <div className={styles.plate}>{children}</div>
      <h1 className={styles.srOnly}>{title}</h1>
    </Reveal>
  );
}

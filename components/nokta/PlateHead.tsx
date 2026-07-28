import type { CSSProperties, ReactNode } from "react";
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
   /kontakt, the massing model on /arbeiten, the ruled field on /studio, the
   plotter on /prozess. All this owns is the frame they hang in and the rule
   that the real heading survives.

   THE HEADING IS REAL. The canvas is decoration and hidden from assistive
   tech, so the h1 is rendered as text and hidden VISUALLY instead —
   off-screen, not display:none, which would take it out of the accessibility
   tree that is the only reason it is there. A page's title is the last thing
   on a site that may exist only as pixels: the document outline, and every
   crawler that has never run a canvas, still find it. */

export default function PlateHead({
  title,
  ratio,
  children,
}: {
  /** The page's heading, exactly as the plate is drawing it. */
  title: string;
  /** Width ÷ height of the plate. Per page, because the plates are not
      interchangeable: a massing model wants height for its towers to rise
      into and a plotter wants room to wander, while the meeting raster was
      composed as a shallow band and its fringes bow and clump the moment it
      is given height it never asked for. Default 3. */
  ratio?: number;
  /** The plate. Give it the same string as `motto`. */
  children: ReactNode;
}) {
  return (
    <Reveal as="header" className={styles.head} variant="wipe">
      {/* Handed over as a custom property, not as an inline `aspect-ratio`.
          An inline declaration beats a stylesheet rule outright, including the
          phone media query below it — which would have held /kontakt's 4.44
          on a 350px screen and left the plate 79px tall with the title set to
          match. As a variable it feeds the default rule and the phone override
          still wins on source order, which is the behaviour wanted. */}
      <div
        className={styles.plate}
        style={ratio ? ({ "--nk-plate-ratio": String(ratio) } as CSSProperties) : undefined}
      >
        {children}
      </div>
      <h1 className={styles.srOnly}>{title}</h1>
    </Reveal>
  );
}

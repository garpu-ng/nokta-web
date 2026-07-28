import type { WorkKind } from "@/lib/works";
import styles from "./KindMark.module.css";

/* ── The three marks ──────────────────────────────────────────────────
   One drawn primitive per door on the homepage. Each is the material itself
   reduced until only its geometry is left — which is the whole post-Bauhaus
   move: don't illustrate the service, draw the shape the service makes.

     Visualisierung → concentric rings. A sphere has no outline; a rendered
       sphere is a stack of contour lines, and this is that stack, breathing.
     Editorial & Satz → a column of rules at varying measure. It is a page's
       grey value with the words taken out — a text block seen from far enough
       away that only the setting remains.
     Druck & CAD → an orthogonal grid with one diagonal running through it.
       Every plan ever drawn, at its smallest possible size.

   They animate on their own, slowly, and lean in when the door is reached
   for; the door owns the hover state and this file only says what "reached
   for" looks like. Stroke is currentColor, so a mark is always exactly the
   paper the door's type is set in. Decorative: the door already carries its
   own title, so the SVG is out of the accessibility tree. */

/* Only the three materials that have a door on the homepage. Derived from
   WorkKind rather than written out, so renaming a kind in lib/works.ts fails
   the build here instead of quietly rendering an empty frame. */
export type DoorKind = Extract<WorkKind, "rendering" | "editorial" | "cad">;

export default function KindMark({ kind }: { kind: DoorKind }) {
  return (
    <svg
      className={styles.mark}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
    >
      {kind === "rendering" && (
        <g className={styles.rings}>
          {/* Out of phase by construction: each ring is a step wider and
              starts a step later, so the stack reads as one wave leaving the
              centre rather than as five circles pulsing together. */}
          {[6, 12, 18, 24, 30].map((r, i) => (
            <circle
              key={r}
              cx="32"
              cy="32"
              r={r}
              style={{ animationDelay: `${i * -0.5}s` }}
            />
          ))}
        </g>
      )}

      {kind === "editorial" && (
        <g className={styles.lines}>
          {/* Measures chosen the way a real column falls: full, full, full,
              then a short last line where the paragraph breaks. */}
          {[44, 44, 44, 26, 44, 44, 32].map((w, i) => (
            <line
              key={i}
              x1="10"
              y1={12 + i * 6.5}
              x2={10 + w}
              y2={12 + i * 6.5}
              style={{ animationDelay: `${i * -0.36}s` }}
            />
          ))}
        </g>
      )}

      {kind === "cad" && (
        <g>
          <g className={styles.grid}>
            {[16, 26, 36, 46].map((v) => (
              <line key={`v${v}`} x1={v} y1="12" x2={v} y2="52" />
            ))}
            {[18, 28, 38, 48].map((h) => (
              <line key={`h${h}`} x1="12" y1={h} x2="52" y2={h} />
            ))}
          </g>
          {/* The section line, cutting the plan. Drawn as a dashed path whose
              offset animates, so it is plotted rather than simply present. */}
          <line
            className={styles.section}
            x1="12"
            y1="52"
            x2="52"
            y2="12"
            strokeWidth="2"
          />
        </g>
      )}
    </svg>
  );
}

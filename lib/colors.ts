// The studio's three colours, in one place. Since the Kolonnade redesign the
// page is always ink and the type is always paper, and the red is a mark (the
// dot after the wordmark, a closing period, a folio) and, at most once per
// page, a field.
//
// TypeScript-side mirror of the same three tokens in app/styles/tokens.css
// (--paper / --ink / --accent). Used where a colour has to be a literal value
// rather than a CSS variable: the generated OG cards (satori resolves no
// custom properties) and the inline SVG marks.

export const PAPER = "#e9e0ce";
export const INK = "#1a1a18";
export const RED = "#b83636";

/* ── The motto colours ────────────────────────────────────────────────
   The palette the old site wore: cobalt for the archviz work, the studio's
   own red for design and print, green for the line prints, plus the clay and
   slate of the earlier motto palette. They were retired with the segmented
   filter bar that quoted them, and are back for one job — the homepage's
   three doors, where each material is a solid field of its own colour.

   These are the motto values nudged down a few percent: paper body copy on
   the originals lands at 4.1–4.5:1, a hair under the 4.5 that 16px type
   needs, and a 1–6% darkening clears it without reading as another colour.
   Titles at 52px were fine either way (large type needs 3:1).

   Type-only import of WorkKind: erased at compile, so nothing here pulls the
   work list into a bundle that only wants a hex value. */
import type { WorkKind } from "./works";

export const KIND_FIELD: Record<WorkKind, string> = {
  rendering: "#4a5bbc", // cobalt — the archviz colour
  editorial: "#b63535", // the studio's red — design and print
  cad: "#59684e", // green — the line-print colour
  study: "#a85f45", // clay
  manual: "#485a6f", // slate
};

/* NOTE before either of the last two is ever spent as a FIELD carrying paper
   type: clay measures 3.65:1 against --paper, under the 4.5 that text under
   18px needs, and darkening it far enough to pass turns it brown. Slate
   clears it at 5.40 but sits 14° of hue from cobalt, so the two read as one
   colour at small sizes. The three above are safe — they were tuned to 4.5
   and measure 4.51–4.56. Only the homepage's doors and the /arbeiten plate
   spend any of these today, and both use the first three. */

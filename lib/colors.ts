// The studio's three colours, in one place. One studio, one accent: the page is
// always paper, the type is always ink, and the only colour on the site is the
// red — carried by a single mark (the dot after the wordmark, the closing period
// of the motto, a label's trailing point).
//
// TypeScript-side mirror of the same three tokens in app/styles/tokens.css
// (--paper / --ink / --accent). Used where a colour has to be a literal value
// rather than a CSS variable: the generated OG cards (satori resolves no
// custom properties) and the inline SVG marks.

export const PAPER = "#e9e0ce";
export const INK = "#1a1a18";
export const RED = "#b83636";

/* ── The filter's six colours ─────────────────────────────────────────
   The one palette outside the three above, and it is a quotation, not a
   theme: the old site's tab bar wore the three branch colours plus the clay
   and slate of the earlier motto palette, and "Alle" wore the home tab's ink.
   They are confined to the filter bar and to the one word they name — a
   card's kind stamp picks its colour up on hover, so pointing at a sheet says
   which register it belongs to. They never touch a surface, an image or a
   page. Kept here (rather than in the wall) because two components read them.

   Type-only import of WorkKind: erased at compile, so nothing in this module
   pulls the work list into a bundle that only wants a hex value. */
import type { WorkKind } from "./works";

export const TAB_COLORS: Record<WorkKind, string> = {
  rendering: "#4b5cbe", // cobalt — the archviz colour
  editorial: RED, // red — the design/print colour
  cad: "#5f6f53", // green — the line-print colour
  study: "#b0664a", // clay
  manual: "#4e6076", // slate
};

/** "Alle" — the old home tab. */
export const ALL_TAB_COLOR = INK;

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

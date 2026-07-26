// The studio's three colours, in one place. One studio, one accent: since the
// Kolonnade redesign the page is always ink and the type is always paper, and
// the only colour on the site is the red — a mark (the dot after the wordmark,
// a closing period, a folio) and, at most once per page, a field.
//
// TypeScript-side mirror of the same three tokens in app/styles/tokens.css
// (--paper / --ink / --accent). Used where a colour has to be a literal value
// rather than a CSS variable: the generated OG cards (satori resolves no
// custom properties) and the inline SVG marks.
//
// (History: a sixth-colour palette used to live here — the retired branch
// colours, quoted by the wall's old segmented filter bar and by the card's
// kind stamp on hover. The filter is hairline chips now and the kind stamp is
// simply paper, so nothing on the site spends those colours and they are gone
// with the bar they belonged to.)

export const PAPER = "#e9e0ce";
export const INK = "#1a1a18";
export const RED = "#b83636";

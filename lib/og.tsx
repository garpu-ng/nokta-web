// Shared renderer for the generated social cards (app + branch opengraph-image
// / twitter-image routes). One flat poster: the motto colour flooding the whole
// 1200×630 field, the "nokta.point." wordmark set large in paper, a tiny
// lowercase caption of the branch tagline, and crop marks tucked into the four
// corners — the print-shop registration language, at low opacity. Poster, not
// screenshot: no gradients, no shadows, no chrome.
//
// No binary assets: the image is built entirely from JSX + CSS by ImageResponse
// (satori under the hood), so nothing ships to the repo. It also uses no custom
// font files — satori's bundled default face carries the type. That means the
// wordmark is not literally Righteous and the caption is not literally Space
// Mono; the poster reads bold through scale + flat high-contrast colour instead,
// and letter-spacing + lowercasing evoke the mono caption. Wiring the real brand
// faces would mean adding woff binaries (or a build-time network fetch), which
// this deliberately avoids.

import { ImageResponse } from "next/og";
import { PAPER } from "@/lib/branches";

/** Standard OpenGraph / large-summary Twitter canvas. Sharing platforms crop
    anything off this 1.91:1 ratio, so every card is exactly this size. */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Corner crop marks: a thin L in each corner, inset from the trim edge, drawn
// in paper at low opacity. Absolutely positioned so they sit outside the flex
// flow of the wordmark/caption.
const MARK_LEN = 62; // arm length
const MARK_W = 2; // stroke width
const MARK_INSET = 46; // gap from the page edge
const MARK_OPACITY = 0.42;

/** The eight little bars (two per corner) that make up the crop marks. */
function cropMarks() {
  // Each corner is keyed by which edges it hugs; the arms share that anchor.
  const corners = [
    { key: "tl", v: { top: MARK_INSET, left: MARK_INSET }, h: { top: MARK_INSET, left: MARK_INSET } },
    { key: "tr", v: { top: MARK_INSET, right: MARK_INSET }, h: { top: MARK_INSET, right: MARK_INSET } },
    { key: "bl", v: { bottom: MARK_INSET, left: MARK_INSET }, h: { bottom: MARK_INSET, left: MARK_INSET } },
    { key: "br", v: { bottom: MARK_INSET, right: MARK_INSET }, h: { bottom: MARK_INSET, right: MARK_INSET } },
  ] as const;

  return corners.flatMap((c) => [
    // vertical arm
    <div
      key={`${c.key}-v`}
      style={{
        position: "absolute",
        width: MARK_W,
        height: MARK_LEN,
        background: PAPER,
        opacity: MARK_OPACITY,
        ...c.v,
      }}
    />,
    // horizontal arm
    <div
      key={`${c.key}-h`}
      style={{
        position: "absolute",
        width: MARK_LEN,
        height: MARK_W,
        background: PAPER,
        opacity: MARK_OPACITY,
        ...c.h,
      }}
    />,
  ]);
}

/** Render one social card. `wordmark` is the full lockup ("nokta.point.");
    `caption` the lowercase tagline; `background` the branch motto colour. */
export function renderOgImage(opts: {
  wordmark: string;
  caption: string;
  background: string;
}) {
  const { wordmark, caption, background } = opts;
  // The short home lockup ("nokta.") can run bigger than the branch lockups.
  const wordSize = wordmark.length > 8 ? 122 : 176;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          background,
          color: PAPER,
          padding: "96px",
        }}
      >
        {cropMarks()}

        <div
          style={{
            display: "flex",
            fontSize: wordSize,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {wordmark}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 42,
            fontSize: 30,
            letterSpacing: "0.32em",
            opacity: 0.74,
          }}
        >
          {caption}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

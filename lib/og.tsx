// Shared renderer for the generated social cards (app + branch opengraph-image
// / twitter-image routes). One flat poster: the motto colour flooding the whole
// 1200×630 field, the "nokta.point." wordmark set large in paper, and a tiny
// lowercase caption of the branch tagline. Poster, not screenshot: no
// gradients, no shadows, no chrome.
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

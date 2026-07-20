// Social card for nokta.line (/line) — the green CAD line-print branch. See
// app/opengraph-image.tsx for why the copy is pinned to the German source voice.

import { makeTranslate } from "@/lib/i18n";
import { DEFAULT_LOCALE } from "@/lib/locales";
import { BRANCH_BY_KEY } from "@/lib/branches";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

const t = makeTranslate(DEFAULT_LOCALE);

export const alt = t("meta.line.title");
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    wordmark: "nokta.line.",
    caption: t("branch.line.tag").toLowerCase(),
    background: BRANCH_BY_KEY.line.accent,
  });
}

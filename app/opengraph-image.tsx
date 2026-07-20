// Studio-wide default social card. Applies to every route that doesn't override
// it with its own opengraph-image (home, studio, kontakt, legal pages…). Ink
// field, "nokta." in paper, the brand progression as the caption.
//
// Static on purpose: it calls no request-time API (no cookies/headers), so Next
// prerenders it once at build and caches it. A crawler fetching this URL carries
// no locale cookie anyway, so the copy is pinned to the German source voice —
// nokta's primary voice — via makeTranslate(DEFAULT_LOCALE) rather than getT().

import { makeTranslate } from "@/lib/i18n";
import { DEFAULT_LOCALE } from "@/lib/locales";
import { INK } from "@/lib/branches";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

const t = makeTranslate(DEFAULT_LOCALE);

export const alt = t("meta.site.title");
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    wordmark: "nokta.",
    caption: t("footer.tag2").toLowerCase(),
    background: INK,
  });
}

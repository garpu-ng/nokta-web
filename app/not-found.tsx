import Link from "next/link";
import { getT } from "@/lib/i18n";
import Dot from "@/components/Dot";

// Root not-found — rendered inside the root layout for any unmatched route.
// The "404" is drawn as 4 · dot · 4, where the middle "0" is our brand dot
// (inline <Dot> SVG) and the two 4s are set in the display face. The
// .nk-404__dot CSS sets the accent, which the Dot's fill=currentColor picks
// up — the page's one red mark.
export default async function NotFound() {
  const t = await getT();
  return (
    <div className="nk-404">
      <div className="nk-404__mark" role="img" aria-label={t("notfound.aria")}>
        <span className="nk-404__digit" aria-hidden="true">4</span>
        <Dot className="nk-404__dot" />
        <span className="nk-404__digit" aria-hidden="true">4</span>
      </div>

      {/* The page's h1. It was a <p>, which left the 404 as the one route on
          the site with no heading at all — the mark above is an aria-label on
          a role="img", not a heading, so nothing named this page. */}
      <h1 className="nk-404__title">{t("notfound.title")}</h1>
      <p className="nk-404__text">{t("notfound.text")}</p>

      <Link href="/" className="nk-404__cta">
        {t("notfound.cta")}
      </Link>
    </div>
  );
}

import Link from "next/link";
import { getT } from "@/lib/i18n";
import Dot from "@/components/Dot";
import CropMarks from "@/components/print/CropMarks";

// Root not-found — rendered inside the root layout for any unmatched route.
// The "404" is drawn as 4 · dot · 4, where the middle "0" is our brand dot
// (inline <Dot> SVG) and the two 4s are set in the mono display face. A 404
// path maps to no branch (branchForPath → null), so the neutral paper theme
// keeps the dot reading ink-black on paper (the .nk-404__dot CSS sets an explicit
// ink colour, which the Dot's fill=currentColor resolves to).
export default async function NotFound() {
  const t = await getT();
  return (
    <div className="nk-404">
      {/* Trim marks around the 404 sheet — the 4·dot·4 mark carries the page,
          so the crop marks are the one quiet touch that ties it into the run. */}
      <CropMarks />

      <div className="nk-404__mark" role="img" aria-label={t("notfound.aria")}>
        <span className="nk-404__digit" aria-hidden="true">4</span>
        <Dot className="nk-404__dot" />
        <span className="nk-404__digit" aria-hidden="true">4</span>
      </div>

      <p className="nk-404__title">{t("notfound.title")}</p>
      <p className="nk-404__text">{t("notfound.text")}</p>

      <Link href="/" className="nk-404__cta">
        {t("notfound.cta")}
      </Link>
    </div>
  );
}

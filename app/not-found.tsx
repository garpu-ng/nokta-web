import Link from "next/link";
import { getT } from "@/lib/i18n";

// Root not-found — rendered inside the root layout for any unmatched route.
// The "404" is drawn as 4 · dot · 4, where the middle "0" is our black dot
// webp and the two 4s are set in the mono display face. A 404 path maps to no
// branch (branchForPath → null), so the neutral paper theme keeps the dot
// reading black on paper.
export default async function NotFound() {
  const t = await getT();
  return (
    <div className="nk-404">
      <div className="nk-404__mark" role="img" aria-label={t("notfound.aria")}>
        <span className="nk-404__digit" aria-hidden="true">4</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/nokta_dot_black.webp"
          alt=""
          aria-hidden="true"
          className="nk-404__dot"
        />
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

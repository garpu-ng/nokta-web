import type { Metadata } from "next";
import { getT } from "@/lib/i18n";
import Dot from "@/components/Dot";
import CropMarks from "@/components/print/CropMarks";
import Registration from "@/components/print/Registration";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("meta.kontakt.title") };
}

export default async function KontaktPage() {
  const t = await getT();
  return (
    <div className="wa-prozess-page wa-kontakt-page">

      {/* Trim marks framing the contact sheet — the shared press vocabulary. */}
      <CropMarks />

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="wa-prozess-header">
        <h1 className="wa-prozess-heading">{t("kontakt.heading")}</h1>
        <p className="wa-prozess-intro">{t("kontakt.intro")}</p>
      </div>

      {/* ── Animated dot ────────────────────────────────────────── */}
      <div className="wa-prozess-gif-wrap">
        {/* Studio contact address — kept in sync with the footer / impressum. The
            big ink dot gets a small registration mark on its upper-right shoulder,
            as if the sheet were aligned around the point. The mark is absolutely
            positioned, so it doesn't enlarge the link's hit area. */}
        <a className="wa-kontakt-dot-link" href="mailto:hallo@nokta-studio.de" aria-label={t("kontakt.mailAria")}>
          <Dot className="wa-kontakt-hero-gif" />
          <Registration className="wa-kontakt-registration" />
        </a>
      </div>

      {/* ── Contact info ────────────────────────────────────────── */}
      <div className="wa-kontakt-info">
        <p className="wa-prozess-intro" style={{ marginBottom: "2rem" }}>
          {t("kontakt.infoLead")}
        </p>
        <a href="mailto:hallo@nokta-studio.de" className="wa-kontakt-email">
          hallo@nokta-studio.de
        </a>
        <p className="wa-kontakt-address">
          nokta Studio<br />
          {t("kontakt.addr.region")}<br />
          {t("kontakt.addr.vat")}
        </p>
      </div>

    </div>
  );
}

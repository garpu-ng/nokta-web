import type { Metadata } from "next";
import { getT } from "@/lib/i18n";
import Dot from "@/components/Dot";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("meta.kontakt.title") };
}

export default async function KontaktPage() {
  const t = await getT();
  return (
    <div className="wa-prozess-page wa-kontakt-page">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="wa-prozess-header">
        <h1 className="wa-prozess-heading">{t("kontakt.heading")}</h1>
        <p className="wa-prozess-intro">{t("kontakt.intro")}</p>
      </div>

      {/* ── Animated dot ────────────────────────────────────────── */}
      <div className="wa-prozess-gif-wrap">
        {/* TODO: replace placeholder address (hallo@nokta.studio) — see README */}
        <a href="mailto:hallo@nokta.studio" aria-label={t("kontakt.mailAria")}>
          <Dot className="wa-kontakt-hero-gif" />
        </a>
      </div>

      {/* ── Contact info ────────────────────────────────────────── */}
      <div className="wa-kontakt-info">
        <p className="wa-prozess-intro" style={{ marginBottom: "2rem" }}>
          {t("kontakt.infoLead")}
        </p>
        <a href="mailto:hallo@waarchi.de" className="wa-kontakt-email">
          hallo@waarchi.de
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

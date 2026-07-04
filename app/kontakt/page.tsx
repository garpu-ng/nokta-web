import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt — WaArchi",
};

export default function KontaktPage() {
  return (
    <div className="wa-prozess-page wa-kontakt-page">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="wa-prozess-header">
        <h1 className="wa-prozess-heading">Kontakt</h1>
        <p className="wa-prozess-intro">
          Haben Sie ein Projekt in Planung? Wir freuen uns darauf, von Ihnen zu hören.
        </p>
      </div>

      {/* ── Logo GIF ────────────────────────────────────────────── */}
      <div className="wa-prozess-gif-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logogif2.gif" alt="WaArchi" className="wa-kontakt-hero-gif" />
      </div>

      {/* ── Contact info ────────────────────────────────────────── */}
      <div className="wa-kontakt-info">
        <p className="wa-prozess-intro" style={{ marginBottom: "2rem" }}>
          Für Anfragen, Angebote oder allgemeine Fragen — schreib uns einfach.
          Wir melden uns innerhalb von 24 Stunden.
        </p>
        <a href="mailto:hallo@waarchi.de" className="wa-kontakt-email">
          hallo@waarchi.de
        </a>
        <p className="wa-kontakt-address">
          WaArchi Studio<br />
          Nordrhein-Westfalen, Deutschland<br />
          USt-IdNr.: auf Anfrage
        </p>
      </div>

    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum · nokta",
};

export default function ImpressumPage() {
  return (
    <main className="wa-page">
      <h1>Impressum</h1>

      <p>Angaben gemäß § 5 TMG / § 18 MStV</p>

      <p>
        nokta Studio
        <br />
        [Vorname Nachname]
        <br />
        [Straße Hausnummer]
        <br />
        [PLZ Ort]
        <br />
        Nordrhein-Westfalen, Deutschland
      </p>

      <p>
        <strong>Kontakt</strong>
        <br />
        E-Mail: <a href="mailto:hallo@waarchi.de">hallo@waarchi.de</a>
        <br />
        Telefon: [Nummer]
      </p>

      <p>
        <strong>Umsatzsteuer-ID</strong>
        <br />
        USt-IdNr. gemäß § 27a UStG: [auf Anfrage]
      </p>

      <p>
        <strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</strong>
        <br />
        [Name, Anschrift wie oben]
      </p>

      <p style={{ opacity: 0.55, fontSize: "0.8rem", marginTop: "3rem" }}>
        Platzhalter: bitte vor Veröffentlichung durch die echten rechtlichen
        Angaben ersetzen.
      </p>
    </main>
  );
}

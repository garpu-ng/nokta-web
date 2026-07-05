import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz — nokta",
};

export default function DatenschutzPage() {
  return (
    <main className="wa-page">
      <h1>Datenschutz</h1>

      <p>
        <strong>1. Verantwortlicher</strong>
        <br />
        nokta Studio, [Name, Anschrift], Nordrhein-Westfalen. Kontakt:{" "}
        <a href="mailto:hallo@waarchi.de">hallo@waarchi.de</a>.
      </p>

      <p>
        <strong>2. Erhebung und Verarbeitung</strong>
        <br />
        Beim Besuch dieser Website werden durch den Hosting-Anbieter automatisch
        technische Zugriffsdaten (z. B. IP-Adresse, Zeitpunkt, aufgerufene Seite)
        verarbeitet, soweit dies zum Betrieb erforderlich ist.
      </p>

      <p>
        <strong>3. Kontaktaufnahme</strong>
        <br />
        Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir Ihre Angaben zur
        Bearbeitung der Anfrage auf Grundlage von Art. 6 Abs. 1 lit. b/f DSGVO.
      </p>

      <p>
        <strong>4. Ihre Rechte</strong>
        <br />
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung,
        Datenübertragbarkeit und Widerspruch sowie ein Beschwerderecht bei einer
        Aufsichtsbehörde.
      </p>

      <p style={{ opacity: 0.55, fontSize: "0.8rem", marginTop: "3rem" }}>
        Platzhalter — bitte vor Veröffentlichung durch eine vollständige,
        geprüfte Datenschutzerklärung ersetzen (Hosting, Cookies, ggf.
        Zahlungsdienstleister für nokta.line etc.).
      </p>
    </main>
  );
}

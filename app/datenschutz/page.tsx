import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz · nokta",
};

export default function DatenschutzPage() {
  return (
    <main className="wa-page">
      <h1>Datenschutz</h1>

      <p>
        <strong>1. Verantwortlicher</strong>
        <br />
        Kaan Özden — nokta studio, Messerstraße 31, 42657 Solingen,
        Deutschland. Kontakt:{" "}
        <a href="mailto:hallo@nokta-studio.de">hallo@nokta-studio.de</a>.
      </p>

      <p>
        <strong>2. Erhebung und Verarbeitung</strong>
        <br />
        Beim Besuch dieser Website werden durch den Hosting-Anbieter automatisch
        technische Zugriffsdaten (z. B. IP-Adresse, Zeitpunkt, aufgerufene Seite)
        verarbeitet, soweit dies zum Betrieb erforderlich ist. Die Website wird
        bei der Vercel Inc. gehostet; Rechtsgrundlage ist unser berechtigtes
        Interesse an einem sicheren und stabilen Betrieb (Art. 6 Abs. 1 lit. f
        DSGVO).
      </p>

      <p>
        <strong>3. Kontaktaufnahme</strong>
        <br />
        Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir Ihre Angaben zur
        Bearbeitung der Anfrage auf Grundlage von Art. 6 Abs. 1 lit. b/f DSGVO.
      </p>

      <p>
        <strong>4. Anfrageformular</strong>
        <br />
        Auf der Kontaktseite können Sie uns über ein Formular schreiben. Wir
        verarbeiten dabei die Angaben, die Sie selbst eintragen — Art der
        Anfrage, Name, E-Mail-Adresse und Ihre Nachricht — ausschließlich, um
        die Anfrage zu beantworten (Art. 6 Abs. 1 lit. b/f DSGVO). Die Angaben
        werden per E-Mail an unser Postfach zugestellt und nicht in einer
        Datenbank gespeichert. Zur Abwehr automatisierter Einsendungen wird die
        Zahl der Anfragen je IP-Adresse kurzzeitig im Arbeitsspeicher begrenzt;
        eine darüber hinausgehende Auswertung oder Protokollierung der
        Formularinhalte findet nicht statt. Ein Captcha-Dienst wird nicht
        eingesetzt. Sie können uns stattdessen jederzeit direkt an{" "}
        <a href="mailto:hallo@nokta-studio.de">hallo@nokta-studio.de</a>{" "}
        schreiben.
      </p>

      <p>
        <strong>5. Ihre Rechte</strong>
        <br />
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung,
        Datenübertragbarkeit und Widerspruch sowie ein Beschwerderecht bei einer
        Aufsichtsbehörde.
      </p>

    </main>
  );
}

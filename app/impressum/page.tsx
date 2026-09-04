import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum · nokta",
};

export default function ImpressumPage() {
  return (
    <main className="wa-page">
      <h1>Impressum</h1>

      <p>Angaben gemäß § 5 DDG und § 18 Abs. 2 MStV</p>

      <p>
        Kaan Özden — nokta studio
        <br />
        Messerstraße 31
        <br />
        42657 Solingen
        <br />
        Deutschland
      </p>

      <p>
        <strong>Kontakt</strong>
        <br />
        E-Mail: <a href="mailto:hallo@nokta-studio.de">hallo@nokta-studio.de</a>
        <br />
        Anfragen auch über das <Link href="/kontakt">Kontaktformular</Link>.
      </p>

      <p>
        <strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</strong>
        <br />
        Kaan Özden, Anschrift wie oben
      </p>

      <p>
        <strong>Verbraucherstreitbeilegung</strong>
        <br />
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungs&shy;verfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </main>
  );
}

// German — source of truth. Every other locale mirrors these keys; missing
// keys fall back to German at runtime (see lib/i18n.ts).
//
// Register (binding on every string in this file): say what it is, never why
// it is allowed. Facts read as confidence, arguments read as defence. No
// superlatives, no agency-speak, no defending the studio's breadth — the work
// argues. Self-initiated work is annotated "Eigenprojekt", nothing more.
const de: Record<string, string> = {
  // ── Metadata ──────────────────────────────────────────────────────
  "meta.site.title": "nokta — Designstudio, Düsseldorf",
  "meta.site.desc": "Designstudio in Düsseldorf. Wir zeichnen Gebäude, Bücher und Drucke — Visualisierung, Satz, Druckvorstufe und CAD-Pläne.",
  "meta.home.title": "nokta — Gebäude, Bücher, Drucke",
  "meta.studio.title": "Studio · nokta",
  "meta.studio.desc": "Das Studio hinter den Arbeiten: drei Leute in Düsseldorf. Architekturvisualisierung, Editorial und Satz, Druckproduktion und CAD-Pläne.",
  "meta.prozess.title": "Prozess · nokta",
  "meta.kontakt.title": "Kontakt · nokta",
  "meta.arbeiten.title": "Arbeiten · nokta",

  // ── Home ──────────────────────────────────────────────────────────
  // wall.label/aria head the one wall, which hangs at /arbeiten since
  // Kolonnade — the "home" prefix is where it used to hang.
  "home.wall.label": "Arbeiten",
  "home.wall.aria": "Alle Arbeiten",
  // ── Kolonnade: homepage hero, intro, the three service rows ───────
  "home.hero.lead1": "Nokta heißt Punkt",
  "home.hero.lead2": "Und mit einem Punkt hat alles begonnen",
  "home.intro.statement": "nokta ist ein Designstudio in Düsseldorf. Wir machen Architektur sichtbar — als Bild, als Buch, als Druck.",
  "home.intro.body": "Wir arbeiten für Architekturbüros, Verlage, Kulturinstitutionen und öffentliche Auftraggeber. Manche kommen mit einem fertigen Plan, andere mit einer Serviette. Beides ist ein Anfang: ein Punkt, aus dem eine Linie wird, aus der eine Form wird.",
  "home.reg.studio": "Studio",
  "home.figure.caption": "Abb. 01 — Interferenz. Zwei Wellenquellen, ein Raster bei 15°, ein Punkt.",
  "home.services.aria": "Leistungen",
  "home.svc.0.title": "Visualisierung",
  "home.svc.0.short": "Renderings, Clay-Renders und Studien — für Wettbewerb, Vermarktung und Genehmigung.",
  "home.svc.1.title": "Editorial & Satz",
  "home.svc.1.short": "Vom Manuskript bis zur Druckvorstufe: Raster, Typografie, Bildredaktion, Register.",
  "home.svc.2.title": "Druck & CAD",
  "home.svc.2.short": "Druckreife Dateien, CAD-Pläne und vektorisierte Liniendrucke — als Datei oder gerahmt in A1.",
  "home.selected": "Ausgewählte Arbeiten",
  "home.selected.all": "alle {count} arbeiten",
  // The two spreads' caption copy. The pair below them carries no body text —
  // title and annotation are the whole caption there.
  "home.work.teahouse.text": "Visualisierung eines japanisch inspirierten Teehauses im Garten. Privatkunde.",
  "home.work.abschlussbericht-ki-kommission.text": "216 Seiten, 8 Kapitel, 20 Handlungsempfehlungen — Layoutsystem bis zur druckreifen Datei. BMWE.",
  "home.contact.title": "Hast du einen Punkt, an dem wir anfangen?",
  "home.contact.body": "Zeig uns die Skizze, den Plan oder den unfertigen Gedanken. Wir melden uns mit den richtigen Fragen.",
  "home.contact.cta": "Projekt beginnen",

  // ── Arbeiten (the one wall + every detail page) ───────────────────
  // The annotation every work carries: kind stamp · year · client. Own work is
  // annotated "Eigenprojekt" and stands beside the commissions, unexplained.
  "work.own": "Eigenprojekt",
  "work.back": "Alle Arbeiten",
  "work.filter.all": "Alle",
  "work.kind.rendering": "Rendering",
  "work.kind.cad": "CAD-Druck",
  "work.kind.editorial": "Editorial",
  "work.kind.study": "Studie",
  "work.kind.manual": "Handbuch",
  "work.prev": "Vorherige Arbeit",
  "work.next": "Nächste Arbeit",
  "work.nstudie.lead": "Eine typografische Studie über das kleine n. Gezeichnet, gerastert, als Druck aufgelegt.",

  // ── Leistungen (ServiceIndex, /studio) ────────────────────────────
  // Four rows, each stated as a deliverable. Keys svc.1 and svc.2 (zero-indexed
  // — the rows displayed as folios 02 and 03) carry an evidence
  // line (see components/nokta/ServiceIndex.tsx) citing the flagship commission.
  "nokta.index.label": "Leistungen",
  "nokta.svc.0.title": "Architekturvisualisierung",
  "nokta.svc.0.text": "Modell, Licht, Bild. Aus Plänen und Skizzen entstehen Außen- und Innenansichten in Fotoqualität — erst Clay-Renders zur Abstimmung von Perspektive und Ausschnitt, dann die finalen Bilder in Druckauflösung.",
  "nokta.svc.1.title": "Editorial & Satz",
  "nokta.svc.1.text": "Vom Manuskript bis zur Druckvorstufe. Raster, Typografie, Bildredaktion, Register und Folios — für Broschüren, Berichte und Bücher.",
  "nokta.svc.1.evidence": "Abschlussbericht der KI-Kommission · 216 Seiten · 8 Kapitel",
  "nokta.svc.2.title": "Druckproduktion",
  "nokta.svc.2.text": "Papier, Bogen, Auflage. Druckreife Dateien mit Beschnitt, Farbraum und Veredelung, abgestimmt mit der Druckerei.",
  "nokta.svc.2.evidence": "216 Seiten druckreif · Beschnitt, Farbraum, Reihenfolge geprüft",
  "nokta.svc.3.title": "CAD-Pläne & Liniendrucke",
  "nokta.svc.3.text": "Aus echten Zeichnungen vektorisiert. Grundrisse, Ansichten und Schnitte als saubere Linie — als Datei oder als gerahmter A1-Druck.",

  // ── Fallstudie (Abschlussbericht KI-Kommission) ───────────────────
  "point.case.kicker": "editorial · druckvorstufe",
  "point.case.label": "216 Seiten, druckreif",
  "point.case.title": "Abschlussbericht · KI, Wettbewerb & Wettbewerbsfähigkeit",
  "point.case.lead": "Der Abschlussbericht der Kommission Wettbewerb & Künstliche Intelligenz — 216 Seiten Editorial, von der ersten Satzspalte bis zur druckreifen Datei.",
  "point.case.stripAria": "Sechs Seiten aus dem Abschlussbericht, horizontal scrollbar",
  "point.case.spread.cover.alt": "Titelseite des Abschlussberichts mit blau-grünem Farbverlauf, dem Titel „KI, Wettbewerb & Wettbewerbsfähigkeit“ und der vertikalen Jahreszahl 2026.",
  "point.case.spread.cover.caption": "titel · ein verlauf trägt die seite, kein bild",
  "point.case.spread.contents.alt": "Inhaltsverzeichnis mit großen nummerierten Kapitelüberschriften, gepunkteten Führungslinien und cyanfarbenen Wegweiser-Labels.",
  "point.case.spread.contents.caption": "inhalt · wegweiser durch 216 seiten",
  "point.case.spread.prinzipien.alt": "Seite „Prinzipien“ mit nummerierten Grundsätzen in klarer typografischer Hierarchie.",
  "point.case.spread.prinzipien.caption": "prinzipien · hierarchie durch nummern",
  "point.case.spread.empfehlung.alt": "Auftakt der „Handlungsempfehlung 11“: zweispaltiger wissenschaftlicher Text über einem großen Empfehlungsblock mit vertikaler Linie.",
  "point.case.spread.empfehlung.caption": "empfehlung 11 · displaygröße bricht die spalten",
  "point.case.spread.opinion.alt": "Meinungsseite „Opinion: Johannes Reck“ mit um 90 Grad gedrehtem Seitenlabel, kursivem Vorspann und gerahmtem Zitat.",
  "point.case.spread.opinion.caption": "opinion · stimmen bekommen ein eigenes register",
  "point.case.spread.termine.alt": "Terminübersicht mit Sitzungsdaten und einem Gruppenfoto der Kommission.",
  "point.case.spread.termine.caption": "termine · daten und gesichter der kommission",
  "point.case.facts.label": "Projektdaten",
  "point.case.facts.client.label": "Auftraggeber",
  "point.case.facts.client.value": "Kommission Wettbewerb & Künstliche Intelligenz, BMWE",
  "point.case.facts.year.label": "Jahr",
  "point.case.facts.year.value": "Berlin / Düsseldorf, April 2026",
  "point.case.facts.scope.label": "Umfang",
  "point.case.facts.scope.value": "216 Seiten · 8 Kapitel · 20 Empfehlungen",
  "point.case.facts.discipline.label": "Disziplin",
  "point.case.facts.discipline.value": "Editorial · Layout · Druckvorstufe",
  "point.case.facts.credit.label": "Gestaltung",
  "point.case.facts.credit.value": "Mert Büyüktüfekci (nokta)",
  "point.case.web": "kikommission.de",
  "point.case.webHint": "Dort steht der Report zum Download.",
  "point.case.narrative1": "Die Aufgabe: ein 216-seitiger Regierungsbericht mit acht Kapiteln, 20 Handlungsempfehlungen, Prinzipien, wissenschaftlichem Report und den Meinungen und Essays der Kommissionsmitglieder — als ein Dokument, das man von vorne bis hinten lesen kann, ohne sich zu verlaufen.",
  "point.case.narrative2": "nokta hat dafür das Layoutsystem gebaut: ein durchgehendes Raster mit nummerierten Kapiteln und Folios, cyanfarbene Wegweiser für die Textsorten, zweispaltiger Fließtext für die Wissenschaft, eigene Register für Meinung und Zitat. Am Ende steht die druckreife Datei — Beschnitt, Farbraum und Reihenfolge stimmen.",

  // ── Kunstplatte (n-Studie) ────────────────────────────────────────
  "point.plate.kicker": "hausschrift · studie",
  "point.plate.label": "System und eine Abweichung",
  "point.plate.spec": "n-studie · 536 × 918 px · ein akzent",
  "point.plate.alt": "Raster aus wiederholten fetten kursiven Kleinbuchstaben „n“, schwarz auf hellem Bogen, mit einem einzelnen „n“ in Kobaltblau, das aus dem Muster ausbricht.",
  "point.plate.text": "Ein Raster aus fetten, kursiven n, schwarz auf dem Bogen. Alles folgt dem System — bis auf ein einziges n in Kobalt, das ausschert.",

  // ── Hausmanual (Leuchtturm) ───────────────────────────────────────
  "point.manual.kicker": "hausmanual · regelwerk",
  "point.manual.label": "Leuchtturm",
  "point.manual.text": "Der Leuchtturm ist unser Hausmanual: Typografie-Regeln, Raster, Farbsystem und Druckstandards — alles, womit hier jede Arbeit anfängt. Zu kaufen gibt es ihn nicht; wir arbeiten daraus.",
  "point.manual.spec": "leuchtturm · hausinternes manual · fortlaufend ergänzt",
  "point.manual.alt": "Gescannter Umschlag des Hausmanuals „Leuchtturm“: körniges Schwarzweiß, oben ein schwarzer Balken mit „NOKTA STUDIO – LEUCHTTURM“ in gesperrter Monoschrift, darunter die fünf nokta-Glyphen vertikal gestapelt in Grautönen, leicht gedreht, dazu graue Eckfelder und eine sichtbare Falzlinie.",

  // ── Studio ────────────────────────────────────────────────────────
  "studio.heading": "Studio",
  "studio.caption": "designstudio · düsseldorf · nrw · zu dritt",
  "studio.services.note": "vier zeilen · je ein ergebnis",
  "studio.p1": "nokta ist ein Designstudio in Düsseldorf. Wir sind zu dritt und zeichnen Gebäude, Bücher und Drucke: Architekturvisualisierung, Editorial und Satz, Druckproduktion und CAD-Pläne.",
  "studio.p2": "Wir bauen unsere Werkzeuge und Abläufe selbst: Render-Setups, Satzvorlagen und Prüfschritte für die Druckvorstufe. Am Anfang eines Projekts liegen mehrere Varianten auf dem Tisch.",
  "studio.p3": "Angefangen haben wir mit Architekturvisualisierung; sie ist bis heute der größte Teil der Arbeit. Fotorealistische 3D-Renderings, innen und außen: Licht, Material, Raum. Das Projekt, wie es später aussieht — lange bevor der erste Stein liegt.",
  "studio.team": "Das Team",
  "studio.role.kaan": "Design · Konzept",
  "studio.role.mohammed": "3D · Visualisierung",
  "studio.role.mert": "Layout · Druck",
  // Placeholder caption on Mert's team card until his portrait clip lands.
  "studio.mert.placeholder": "portrait folgt",
  "studio.cta": "Projekt in Planung?",
  "studio.ctaProcess": "Unser Prozess",
  "studio.ctaWrite": "Schreib uns",

  // ── Prozess ───────────────────────────────────────────────────────
  "prozess.index.intro": "Vier Abläufe, einer je Material. Ausgeschrieben ist der erste — die Architekturvisualisierung, mit der bei uns die meisten Projekte anfangen.",
  "prozess.heading.line1": "Wie wir",
  "prozess.heading.line2": "arbeiten",
  "prozess.step.label": "Schritt",
  "prozess.ablauf.title": "Ablauf 01 · Architekturvisualisierung",
  "prozess.ablauf.note": "vier schritte · du entscheidest",
  "prozess.cta": "Klingt das nach deinem Projekt?",
  "nokta.svc.0.short": "Modell, Licht, Bild — innen und außen, in Druckauflösung.",
  "nokta.svc.1.short": "Raster, Typografie, Bildredaktion — vom Manuskript bis zur Vorstufe.",
  "nokta.svc.2.short": "Papier, Bogen, Auflage — abgestimmt mit der Druckerei.",
  "nokta.svc.3.short": "Grundrisse, Ansichten, Schnitte — als Datei oder gerahmt in A1.",
  "prozess.step.1.title": "Konzept & Referenzen",
  "prozess.step.1.text": "Am Anfang steht deine Idee. Du schickst uns Pläne, Skizzen und Referenzen, und wir klären gemeinsam, wie das Bild später wirken soll. So steht die Basis, bevor wir loslegen.",
  "prozess.step.2.title": "3D-Modellierung",
  "prozess.step.2.text": "Aus deinen Unterlagen bauen wir ein detailliertes 3D-Modell von Gebäude und Umgebung, mit sauberen Proportionen und Geometrien. Du bekommst erste Rohansichten („Clay Renders“), damit wir Perspektive und Bildausschnitt gemeinsam festlegen.",
  "prozess.step.3.title": "Materialien & Licht",
  "prozess.step.3.text": "Jetzt kommt Leben ins Modell. Wir legen fotorealistische Materialien an und setzen das Licht so, dass die Stimmung passt: mal das warme Licht eines Sommertags, mal die Dämmerung.",
  "prozess.step.4.title": "Finale & Post-Production",
  "prozess.step.4.text": "Nach deiner Freigabe rendern wir in hoher Auflösung. In der Post-Production ziehen wir Farben, Kontraste und Details nach, bis das Bild sitzt und dein Projekt genau so zeigt, wie es soll.",

  // ── Kontakt ───────────────────────────────────────────────────────
  "kontakt.heading": "Kontakt",
  "kontakt.intro": "Du hast ein Projekt in Planung? Wir freuen uns, von dir zu hören.",
  "kontakt.direct": "Direkt",
  "kontakt.form.step1": "01 · Worum geht es?",
  "kontakt.form.step2": "02 · Wer schreibt?",
  "kontakt.form.step3": "03 · Der Punkt, an dem wir anfangen",
  "kontakt.form.kind.0": "Visualisierung",
  "kontakt.form.kind.1": "Editorial",
  "kontakt.form.kind.2": "Druck",
  "kontakt.form.kind.3": "CAD-Plan",
  "kontakt.form.name": "Name",
  "kontakt.form.email": "E-Mail",
  "kontakt.form.message": "Skizze, Plan oder unfertiger Gedanke — beschreib es in zwei Sätzen.",
  "kontakt.form.submit": "Anfrage senden",
  "kontakt.form.sending": "Wird gesendet",
  "kontakt.form.sla": "Antwort innerhalb von 24 h",
  "kontakt.form.done.title": "Angekommen. Das ist der Punkt.",
  "kontakt.form.done.body": "Wir lesen mit und melden uns innerhalb von 24 Stunden — mit den richtigen Fragen, nicht mit einem Angebotsformular.",
  "kontakt.form.again": "Noch eine Anfrage",
  "kontakt.form.error": "Das hat nicht geklappt. Schreib uns direkt: hallo@nokta-studio.de",
  "kontakt.form.nojs": "Das Formular braucht JavaScript. Schreib uns direkt: hallo@nokta-studio.de",
  "kontakt.addr.region": "Nordrhein-Westfalen, Deutschland",
  "kontakt.addr.vat": "USt-IdNr.: auf Anfrage",
  "kontakt.mailAria": "E-Mail schreiben",

  // ── Liniendrucke — Passport, Spezifikation, Kauf (/arbeiten/[slug]) ─
  "line.tb.subject": "Motiv",
  "line.tb.city": "Stadt",
  "line.tb.price": "Preis",
  "line.spec.year": "Baujahr",
  "line.spec.architect": "Architekt",
  "line.spec.coords": "Koordinaten",
  "line.spec.technique": "Technik",
  "line.spec.techniqueVal": "Vektorisierte CAD-Zeichnung",
  "line.spec.format": "Format",
  "line.spec.formatVal": "A1 (594 × 841 mm), gerahmt",
  "line.detailLead": "Ein technischer Aufriss als Kunst. Jede Linie aus einer CAD-Zeichnung vektorisiert, sauber gesetzt, in A1 gedruckt und gerahmt.",
  "line.order": "Bestellen",
  "line.buy": "Kaufen",
  "line.altSuffix": "vektorisierter CAD-Liniendruck",
  "line.metaDescSuffix": "Vektorisierter CAD-Liniendruck, gedruckt in A1 und gerahmt.",

  // ── Projekte (Renderings) ─────────────────────────────────────────
  "projects.client.private": "Privatkunde",
  "projects.desc.sanktgores": "Fotorealistische Außenvisualisierung eines modernen Einfamilienhauses in NRW.",
  "projects.desc.teahouse": "Visualisierung eines japanisch inspirierten Teehauses im Garten.",
  "projects.desc.beatbuilding": "Visualisierung eines urbanen Kulturgebäudes.",
  "projects.desc.binome": "Innen- und Außenvisualisierung eines minimalistischen Wohnprojekts.",
  "projects.desc.ipehouse": "Visualisierung eines modernen Hauses mit Ipe-Holzfassade.",
  "projects.desc.velostation": "Architekturvisualisierung einer modernen Fahrradstation im urbanen Raum.",

  // ── Footer ────────────────────────────────────────────────────────
  // tag1 + tag2 stack in the colophon brand block; tag2 also becomes the root
  // social card caption (app/opengraph-image.tsx, lowercased).
  "footer.tag1": "Designstudio in Düsseldorf.",
  "footer.tag2": "Vom Punkt zur Linie zur Form.",
  "footer.col.seiten": "Seiten",
  "footer.col.rechtliches": "Rechtliches",
  "footer.col.social": "Social",
  "footer.link.arbeiten": "arbeiten",
  "footer.link.studio": "studio",
  "footer.link.prozess": "prozess",
  "footer.link.kontakt": "kontakt",
  "footer.link.impressum": "impressum",
  "footer.link.datenschutz": "datenschutz",
  "footer.disciplines": "Visualisierung · Editorial · Druck · CAD",

  // ── 404 / not-found ───────────────────────────────────────────────
  "notfound.aria": "404 — Seite nicht gefunden",
  "notfound.title": "Diesen Punkt haben wir nicht.",
  "notfound.text": "Diese Seite haben wir nicht im Programm. Tippfehler, alter Link oder einfach umgezogen. Vom Punkt zurück zum Anfang.",
  "notfound.cta": "Zurück zur Startseite",

  // ── Header nav / aria ─────────────────────────────────────────────
  "nav.home": "start.",
  "nav.studio": "studio.",
  "nav.prozess": "prozess.",
  "nav.contact": "kontakt.",
  "aria.home": "nokta, Startseite",
  "aria.punkt": "Der Punkt",
  "aria.mainNav": "Hauptnavigation",
  "aria.language": "Sprache wählen",
};

export default de;

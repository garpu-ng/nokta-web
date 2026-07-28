// English — mirrors the key set of messages/de.ts (German is the source of
// truth; a missing key falls back to German at runtime, see lib/i18n.ts).
//
// Same register as the German: say what it is, never why it is allowed. Facts,
// no defence, no agency-speak, no superlatives. Self-initiated work is
// annotated "Self-initiated", nothing more.
const en: Record<string, string> = {
  // ── Metadata ──────────────────────────────────────────────────────
  "meta.site.title": "nokta — design studio, Düsseldorf",
  "meta.site.desc": "Design studio in Düsseldorf. We draw buildings, books and prints — visualisation, typesetting, prepress and CAD plans.",
  "meta.home.title": "nokta — buildings, books, prints",
  "meta.studio.title": "Studio · nokta",
  "meta.studio.desc": "The studio behind the work: three people in Düsseldorf. Architectural visualisation, editorial and typesetting, print production and CAD plans.",
  "meta.kontakt.title": "Contact · nokta",
  "meta.arbeiten.title": "Work · nokta",

  // ── Home ──────────────────────────────────────────────────────────
  "home.wall.label": "Work",
  "home.wall.aria": "All work",
  // ── Kolonnade: homepage hero, intro, the three service rows ───────
  "home.hero.lead1": "Nokta means dot",
  "home.hero.lead2": "And it all began with a dot",
  "home.intro.statement": "nokta is a design studio in Düsseldorf. We make architecture visible — as an image, as a book, as a print.",
  "home.intro.body": "We work for architecture practices, publishers, cultural institutions and public clients. Some arrive with a finished plan, others with a napkin. Both are a beginning: a point that becomes a line, and a line that becomes a form.",
  "home.reg.studio": "Studio",
  "home.services.aria": "Services",
  "home.svc.0.title": "Visualisation",
  "home.svc.0.short": "Renderings, clay renders and studies — for competitions, marketing and planning permission.",
  "home.svc.1.title": "Editorial & Typesetting",
  "home.svc.1.short": "From manuscript to prepress: grid, typography, picture editing, indexes.",
  "home.svc.2.title": "Print & CAD",
  "home.svc.2.short": "Print-ready files, CAD plans and vectorised line prints — as a file or framed in A1.",
  "home.selected": "Selected work",
  "home.selected.all": "all {count} works",
  "home.work.teahouse.text": "Visualisation of a Japanese-inspired tea house in a garden. Private client.",
  "home.work.abschlussbericht-ki-kommission.text": "216 pages, 8 chapters, 20 recommendations — layout system through to the print-ready file. BMWE.",
  "home.contact.title": "Have a point to start from?",
  "home.contact.body": "Show us the sketch, plan or unfinished thought. We’ll come back with the right questions.",
  "home.contact.cta": "Start a project",

  // ── Work (the one wall + every detail page) ───────────────────────
  // The annotation every work carries: kind stamp · year · client. Own work is
  // annotated "Self-initiated" and stands beside the commissions, unexplained.
  "work.own": "Self-initiated",
  "work.back": "All work",
  "work.filter.all": "All",
  "work.kind.rendering": "Rendering",
  "work.kind.cad": "CAD print",
  "work.kind.editorial": "Editorial",
  "work.kind.study": "Study",
  "work.kind.manual": "Manual",
  "work.prev": "Previous work",
  "work.next": "Next work",
  "work.nstudie.lead": "A typographic study of the lowercase n. Drawn, set in a grid, issued as a print.",

  // ── Services (ServiceIndex, /studio) ──────────────────────────────
  // Four rows, each stated as a deliverable. Rows 1 and 2 carry an evidence
  // line (see components/nokta/ServiceIndex.tsx) citing the flagship commission.
  "nokta.index.label": "Services",
  "nokta.svc.0.title": "Architectural visualisation",
  "nokta.svc.0.text": "Model, light, image. Plans and sketches become exterior and interior views at photographic quality — first clay renders to settle perspective and framing, then the final images at print resolution.",
  "nokta.svc.1.title": "Editorial & typesetting",
  "nokta.svc.1.text": "From manuscript to prepress. Grid, typography, picture editing, indexes and folios — for brochures, reports and books.",
  "nokta.svc.1.evidence": "AI Commission final report · 216 pages · 8 chapters",
  "nokta.svc.2.title": "Print production",
  "nokta.svc.2.text": "Paper, sheet, print run. Print-ready files with bleed, colour space and finishing, agreed with the printer.",
  "nokta.svc.2.evidence": "216 pages print-ready · bleed, colour space, sequence checked",
  "nokta.svc.3.title": "CAD plans & line prints",
  "nokta.svc.3.text": "Vectorised from real drawings. Floor plans, elevations and sections as clean line — as a file or as a framed A1 print.",

  // ── Case study (AI Commission final report) ───────────────────────
  "point.case.kicker": "editorial · prepress",
  "point.case.label": "216 pages, print-ready",
  "point.case.title": "Final report · AI, Competition & Competitiveness",
  "point.case.lead": "The final report of the Commission on Competition & Artificial Intelligence — 216 pages of editorial, from the first column of text to the print-ready file.",
  "point.case.stripAria": "Six pages from the final report, scrollable horizontally",
  "point.case.spread.cover.alt": "Cover of the final report with a blue-to-green gradient, the title “AI, Competition & Competitiveness” and the vertical year 2026.",
  "point.case.spread.cover.caption": "cover · one gradient carries the page, no imagery",
  "point.case.spread.contents.alt": "Table of contents with large numbered chapter headings, dotted leaders and cyan wayfinding labels.",
  "point.case.spread.contents.caption": "contents · wayfinding through 216 pages",
  "point.case.spread.prinzipien.alt": "“Principles” page with numbered tenets in a clear typographic hierarchy.",
  "point.case.spread.prinzipien.caption": "principles · hierarchy through numbering",
  "point.case.spread.empfehlung.alt": "Opening of “Recommendation 11”: two-column scientific text above a large recommendation block with a vertical rule.",
  "point.case.spread.empfehlung.caption": "recommendation 11 · display size breaks the columns",
  "point.case.spread.opinion.alt": "Opinion page “Opinion: Johannes Reck” with a page label rotated 90 degrees, an italic lead and a boxed pull-quote.",
  "point.case.spread.opinion.caption": "opinion · voices get their own register",
  "point.case.spread.termine.alt": "Schedule overview with session dates and a group photo of the commission.",
  "point.case.spread.termine.caption": "dates · the commission’s sessions and faces",
  "point.case.facts.label": "Project data",
  "point.case.facts.client.label": "Client",
  "point.case.facts.client.value": "Commission on Competition & Artificial Intelligence, BMWE",
  "point.case.facts.year.label": "Year",
  "point.case.facts.year.value": "Berlin / Düsseldorf, April 2026",
  "point.case.facts.scope.label": "Scope",
  "point.case.facts.scope.value": "216 pages · 8 chapters · 20 recommendations",
  "point.case.facts.discipline.label": "Discipline",
  "point.case.facts.discipline.value": "Editorial · Layout · Prepress",
  "point.case.facts.credit.label": "Design",
  "point.case.facts.credit.value": "Mert Büyüktüfekci (nokta)",
  "point.case.web": "kikommission.de",
  "point.case.webHint": "The report is there to download.",
  "point.case.narrative1": "The brief: a 216-page government report with eight chapters, 20 recommendations, principles, a scientific report and the opinions and essays of the commission members — as one document you can read front to back without getting lost.",
  "point.case.narrative2": "nokta built the layout system for it: a continuous grid with numbered chapters and folios, cyan wayfinding for the text types, two-column body text for the science, distinct registers for opinion and quote. What ships at the end is the print-ready file — bleed, colour space and sequence all in order.",

  // ── Art plate (n study) ───────────────────────────────────────────
  "point.plate.kicker": "house type · study",
  "point.plate.label": "A system and one deviation",
  "point.plate.spec": "n study · 536 × 918 px · one accent",
  "point.plate.alt": "Grid of repeated bold italic lowercase letters “n”, black on a light sheet, with a single “n” in cobalt blue breaking out of the pattern.",
  "point.plate.text": "A grid of bold, italic n’s, black on the sheet. Everything follows the system — except a single cobalt n that steps out of line.",

  // ── House manual (Leuchtturm) ─────────────────────────────────────
  "point.manual.kicker": "house manual · rulebook",
  "point.manual.label": "Leuchtturm",
  "point.manual.text": "Leuchtturm is our house manual: typographic rules, the grid, the colour system and the print standards — everything every job here starts from. It isn’t for sale; we work from it.",
  "point.manual.spec": "leuchtturm · in-house manual · continually extended",
  "point.manual.alt": "Scanned cover of the house manual “Leuchtturm”: grainy black and white, a black bar at the top reading “NOKTA STUDIO – LEUCHTTURM” in spaced mono capitals, below it the five nokta glyphs stacked vertically in shades of grey, slightly rotated, with grey corner patches and a visible fold line.",

  // ── Studio ────────────────────────────────────────────────────────
  "studio.heading": "Studio",
  "studio.caption": "design studio · düsseldorf · nrw · three of us",
  "studio.services.note": "four lines · one deliverable each",
  "studio.p1": "nokta is a design studio in Düsseldorf. There are three of us, and we draw buildings, books and prints: architectural visualisation, editorial and typesetting, print production and CAD plans.",
  "studio.p2": "We build our own tools and workflows: render setups, typesetting templates and prepress checks. At the start of a project there are several versions on the table.",
  "studio.p3": "We started with architectural visualisation; it is still the largest part of the work. Photorealistic 3D renderings, interior and exterior: light, material, space. The project as it will look — long before the first stone is laid.",
  "studio.team": "The team",
  "studio.role.kaan": "Design · Concept",
  "studio.role.mohammed": "3D · Visualisation",
  "studio.role.mert": "Layout · Print",
  // Placeholder caption on Mert's team card until his portrait clip lands.
  "studio.mert.placeholder": "portrait to follow",
  "studio.cta": "Got a project in the works?",
  "studio.ctaWrite": "Write us",

  // ── Contact ───────────────────────────────────────────────────────
  "kontakt.heading": "Contact",
  "kontakt.intro": "Got a project in the works? We’d love to hear from you.",
  "kontakt.direct": "Direct",
  "kontakt.form.step1": "01 · What is it about?",
  "kontakt.form.step2": "02 · Who is writing?",
  "kontakt.form.step3": "03 · The point we start from",
  "kontakt.form.kind.0": "Visualisation",
  "kontakt.form.kind.1": "Editorial",
  "kontakt.form.kind.2": "Print",
  "kontakt.form.kind.3": "CAD plan",
  "kontakt.form.name": "Name",
  "kontakt.form.email": "Email",
  "kontakt.form.message": "A sketch, a plan or an unfinished thought — describe it in two sentences.",
  "kontakt.form.submit": "Send enquiry",
  "kontakt.form.sending": "Sending",
  "kontakt.form.sla": "Reply within 24 h",
  "kontakt.form.done.title": "Arrived. That is the point.",
  "kontakt.form.done.body": "We are reading, and we will get back to you within 24 hours — with the right questions, not with a quote form.",
  "kontakt.form.again": "Another enquiry",
  "kontakt.form.error": "That did not work. Write to us directly: hallo@nokta-studio.de",
  "kontakt.form.nojs": "The form needs JavaScript. Write to us directly: hallo@nokta-studio.de",
  "kontakt.addr.region": "North Rhine-Westphalia, Germany",
  "kontakt.addr.vat": "VAT ID: on request",
  "kontakt.mailAria": "Write an email",

  // ── Line prints — passport, specification, purchase (/arbeiten/[slug]) ─
  "line.tb.subject": "Subject",
  "line.tb.city": "City",
  "line.tb.price": "Price",
  "line.spec.year": "Year built",
  "line.spec.architect": "Architect",
  "line.spec.coords": "Coordinates",
  "line.spec.technique": "Technique",
  "line.spec.techniqueVal": "Vectorised CAD drawing",
  "line.spec.format": "Format",
  "line.spec.formatVal": "A1 (594 × 841 mm), framed",
  "line.detailLead": "A technical elevation as art. Every line vectorised from a CAD drawing, cleanly set, printed in A1 and framed.",
  "line.order": "Order",
  "line.buy": "Buy",
  "line.altSuffix": "vectorised CAD line print",
  "line.metaDescSuffix": "Vectorised CAD line print, printed in A1 and framed.",

  // ── Projects (renderings) ─────────────────────────────────────────
  "projects.client.private": "Private client",
  "projects.desc.sanktgores": "Photorealistic exterior visualisation of a modern single-family home in Germany.",
  "projects.desc.teahouse": "Visualisation of a Japanese-inspired garden tea house.",
  "projects.desc.beatbuilding": "Visualisation of an urban cultural building.",
  "projects.desc.binome": "Interior and exterior visualisation of a minimalist residential project.",
  "projects.desc.ipehouse": "Visualisation of a modern house with an ipe wood façade.",
  "projects.desc.velostation": "Architectural visualisation of a modern bike station in an urban setting.",

  // ── Footer ────────────────────────────────────────────────────────
  // tag1 + tag2 stack in the colophon brand block; tag2 also becomes the root
  // social card caption (app/opengraph-image.tsx, lowercased).
  "footer.tag1": "Design studio in Düsseldorf.",
  // The studio's line. One string, three places: the footer, the
  // generated social card, and the homepage plate it is knocked into.
  "studio.motto": "From the dot by way of the line to the form.",
  "footer.col.seiten": "Pages",
  "footer.col.rechtliches": "Legal",
  "footer.col.social": "Social",
  "footer.link.arbeiten": "work",
  "footer.link.studio": "studio",
  "footer.link.kontakt": "contact",
  "footer.link.impressum": "imprint",
  "footer.link.datenschutz": "privacy",
  "footer.disciplines": "Visualisation · Editorial · Print · CAD",

  // ── 404 / not-found ───────────────────────────────────────────────
  "notfound.aria": "404 — Page not found",
  "notfound.title": "This point isn't on our map.",
  "notfound.text": "We don’t carry this page. A typo, an old link, or it simply moved. From the point back to the start.",
  "notfound.cta": "Back to the homepage",

  // ── Header nav / aria ─────────────────────────────────────────────
  "nav.home": "home.",
  "nav.studio": "studio.",
  "nav.arbeiten": "work.",
  "nav.contact": "contact.",
  "aria.home": "nokta, home",
  "aria.punkt": "The dot",
  "aria.mainNav": "Main navigation",
  "aria.language": "Choose language",
};

export default en;

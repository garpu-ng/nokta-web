# nokta

Website des interdisziplinären Designstudios **nokta** — Design & Druck,
Architekturvisualisierung (nokta.cube) und CAD-Liniendrucke (nokta.line).
Next.js (App Router), Deploy über Vercel (Push auf `main` → Auto-Build).

---

## ✅ To-Do

Laufende offene Punkte, getrennt von den einzelnen Website-Builds. Erledigtes
abhaken (`[x]`), Neues unten anhängen.

- [ ] **Kontakt-Mailadresse:** `hallo@nokta-studio.de` überall vereinheitlicht
      (Footer, Kontakt, Impressum, Datenschutz); die Adresse ist aber angenommen —
      die **Mailbox muss noch echt werden** (registrieren/einrichten).
- [ ] **nokta.line — Checkout:** Stripe **Payment Links in `lib/prints.ts`
      eintragen** (`paymentLink` pro Druck). Solange leer, fällt der Button auf
      `/kontakt` zurück; sobald eine `buy.stripe.com`-URL drinsteht, ist der Druck
      live — kein Code nötig.
- [ ] **Impressum & Datenschutz:** echte, geprüfte Rechtstexte einsetzen
      (aktuell Platzhalter, nur Deutsch).
- [ ] **Social-Links:** Instagram / LinkedIn / Behance im Footer sind noch `#`.
- [ ] **Team / Mert:** Die Mert-Karte ist jetzt bewusst ein „portrait folgt"-
      Platzhalter (i18n, alle vier Sprachen). Echtes Portrait unter
      `public/flymemert.mp4` nachreichen und die Karte gegen die `<GifVideo>`-Zeile
      der anderen tauschen (Kommentar in `app/studio/page.tsx`).
- [ ] **Alt-Routen aufräumen:** `/arch` + `/nokta` existieren nur noch als
      `permanentRedirect`-Stubs auf `/cube` + `/point` — irgendwann entfernen.
- [ ] **Sprachumschalter:** „JA" wird am rechten Rand auf breiten Screens
      abgeschnitten (bestehend).
- [ ] **Lint:** zwei bestehende Lint-Fehler noch offen
      (`LanguageToggle.tsx:25`, `PunktEasterEgg.tsx:56`).
- [ ] **i18n / SEO:** optional eigene `/en`-URLs + `hreflang` (aktuell
      Cookie-basiert, eine URL pro Seite); ggf. Rechtstexte übersetzen.
- [ ] **Print-Master:** A1-Vektordateien liegen bewusst **nicht** im Repo
      (bezahltes Produkt) — Fulfilment-Quelle separat sichern.

---

## Entwicklung

```bash
npm install
npm run dev
```

Läuft auf [http://localhost:3000](http://localhost:3000).

**Deploy:** Commit/Push auf `main` — Vercel baut und veröffentlicht automatisch.

## Sprachen (i18n)

Cookie-basierter Umschalter (DE / EN / TR / JA) im Header. Alle Texte liegen in
`messages/{de,en,tr,ja}.ts` (flache Keys, **Deutsch als Fallback**). Locale wird
serverseitig aus dem Cookie gelesen (`lib/i18n.ts`) und setzt `<html lang>`.
Neue Texte immer zuerst in `messages/de.ts` anlegen, dann in den anderen Sprachen.

## Notizen

- Design-Tokens & Farbpalette: `app/styles/tokens.css` (fünf Markenfarben).
- Der Punkt im Header verlinkt auf ein Easter Egg unter `/punkt`.

# nokta

Website des interdisziplinären Designstudios **nokta** — Design & Druck,
Architekturvisualisierung (nokta.arch) und CAD-Liniendrucke (nokta.line).
Next.js (App Router), Deploy über Vercel (Push auf `main` → Auto-Build).

---

## ✅ To-Do

Laufende offene Punkte, getrennt von den einzelnen Website-Builds. Erledigtes
abhaken (`[x]`), Neues unten anhängen.

- [ ] **Kontakt-Mailadresse:** Platzhalter `hallo@nokta.studio` (mailto hinter dem
      schwarzen Dot) durch die echte Adresse ersetzen; mit `hallo@waarchi.de`
      vereinheitlichen.
- [ ] **nokta.line — Checkout:** echten Stripe-Checkout anbinden. Aktuell führt
      „Bestellen" nur zu `/kontakt`.
- [ ] **Impressum & Datenschutz:** echte, geprüfte Rechtstexte einsetzen
      (aktuell Platzhalter, nur Deutsch).
- [ ] **Social-Links:** Instagram / LinkedIn / Behance im Footer sind noch `#`.
- [ ] **Team:** Rollen/Personen bestätigen (Mert war ein Platzhalter).
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

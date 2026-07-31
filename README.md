# nokta

Website des Designstudios **nokta**, Düsseldorf. Ein Studio, eine Wand:
alle Arbeiten (Visualisierung, Editorial, Druck, CAD) auf einer Startseite,
jede Arbeit mit eigener Detailseite unter `/arbeiten/[slug]`.
Next.js (App Router), Deploy über Vercel (Push auf `main` → Auto-Build).

---

## ✅ To-Do

Laufende offene Punkte, getrennt von den einzelnen Website-Builds. Erledigtes
abhaken (`[x]`), Neues unten anhängen.

- [ ] **Kontakt-Mailadresse:** `hallo@nokta-studio.de` überall vereinheitlicht
      (Footer, Kontakt, Impressum, Datenschutz); die Adresse ist aber angenommen —
      die **Mailbox muss noch echt werden** (registrieren/einrichten).
- [ ] **Drucke — Checkout:** Stripe **Payment Links in `lib/prints.ts`
      eintragen** (`paymentLink` pro Druck). Solange leer, fällt der Button auf
      `/kontakt` zurück; sobald eine `buy.stripe.com`-URL drinsteht, ist der Druck
      live — kein Code nötig.
- [ ] **Impressum & Datenschutz:** echte, geprüfte Rechtstexte einsetzen
      (aktuell Platzhalter, nur Deutsch).
- [ ] **Social-Links:** Instagram / LinkedIn / Behance im Footer sind noch `#`.
- [x] **Team / Mert:** Erledigt. Alle drei Karten zeigen jetzt gezeichnete
      Portraits (`public/team/{kaan,mohammed,mert}.png`); der Platzhalter und
      die alten Clips (`flymekaan.mp4`, `flymehammed.mp4`) sind raus.
- [ ] **Team / einheitlicher Grund:** Kaans Portrait steht auf Tinte
      (`--ink`, aus dem Reveal-Clip), Mohammed und Mert stehen auf Weiß mit
      gezeichnetem Rahmen. Nebeneinander sind das zwei verschiedene Sorten
      Karte — entweder die beiden anderen auf Tinte nachziehen oder Kaan
      auf Weiß.
- [ ] **Alt-Routen aufräumen:** `/point`, `/cube`, `/line`, `/arch`, `/nokta`
      sind `permanentRedirect`-Stubs auf `/`; `/line/[slug]` + `/projekte/[slug]`
      leiten auf `/arbeiten/[slug]` — irgendwann entfernen, wenn nichts mehr
      auf die alten Pfade zeigt.
- [ ] **Sprachumschalter:** „JA" wird am rechten Rand auf breiten Screens
      abgeschnitten (bestehend).
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

- Design-Tokens & Farbpalette: `app/styles/tokens.css` (drei Farben: Papier,
  Tinte, der rote Akzent — dieselben Werte in `lib/colors.ts`).
- Der rote Punkt der Fußzeilen-Wortmarke verlinkt auf ein Easter Egg unter `/punkt`.
- **Kaans Portrait auf `/studio` bewegt sich.** `public/team/kaan-reveal.webp`
  ist ein **Sprite-Sheet mit 17 Bildern** (**nebeneinander**, verlustfrei
  WebP), das eine CSS-`steps()`-Animation durchschaltet — bewusst **kein
  Video**:
  als `<video>` lief es in Chromium und blieb in Safari schwarz, und ein
  Codec, der in einem nicht testbaren Browser stimmen muss, ist eine Wette.
  Verhalten kommt komplett aus CSS, **ohne JavaScript**: bei Hover läuft es
  **einmal** (`iteration-count: 1`), pausiert beim Verlassen auf dem
  erreichten Bild, macht beim erneuten Hover dort weiter — und bleibt am Ende
  auf dem letzten Bild stehen (`fill-mode: forwards`). Eine fertige Animation
  startet nicht neu, also pro Seitenaufruf genau einmal.
  Ohne echten Zeiger (Touch) oder bei `prefers-reduced-motion` läuft sie gar
  nicht: dann steht `public/team/kaan.png` da, und das **ist** das letzte Bild
  des Sheets. Umschaltung in CSS (`.clip` / `.still` in
  `app/studio/page.module.css`) — dadurch lädt ein Handy das Sheet nie
  (ein `background-image` in `display:none` wird nicht geholt).
  **Nebeneinander ist Absicht, nicht Geschmack:** ein Schritt landet in einer
  fluiden Box zwangsläufig auf einem Bruchteil-Pixel, das Sample greift also
  ein Pixel ins Nachbarbild. Nebeneinander stoßen die Bilder an ihren linken
  und rechten Rändern aneinander, und die sind in jedem Bild dieselbe reine
  Tinte — man sieht nichts. Untereinander stieß man an die Unterkante der
  Zeichnung, wo der Pulli aus dem Bild läuft: eine helle Linie, die mit jedem
  Schritt an- und ausging.
  **Neues Sheet = Bildzahl an drei Stellen anpassen:** `background-size`,
  `steps(...)` und ggf. `animation-duration`. Beim Skalieren die Werte auf den
  Farbumfang der Vorlage klemmen — Lanczos/Mitchell überschwingen an harten
  Kanten und legen sonst eine zu helle 1-px-Zeile an den Bildrand.

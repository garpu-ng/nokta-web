# nokta-web — Handoff / Project Notes

Current as of the **one-studio restructure** (branch `restructure/one-studio`,
2026-07-25). The earlier three-branch architecture this file used to describe
(point / cube / line, tab bar, colour flood) is gone; its history lives in git.

---

## 1. What this is

The website of **nokta** — a three-person design studio in Düsseldorf
(Kaan · Design & Konzept, Mohammed · 3D & Visualisierung, Mert · Layout &
Druck). *nokta* is Turkish for **dot**. Motto: **Vom Punkt zur Linie zur Form.**

One studio, one body of work: the home page states what the studio is and
shows all thirteen works on a single wall; every work has a detail page under
`/arbeiten/[slug]`. Modes of representation (Rendering, CAD-Druck, Editorial,
Studie, Handbuch) are **stamps on a piece and a filter over the whole — never
sections**. Architecture leads by ratio and running order (10 of 13 works),
not by a label.

Register rule for all copy, in every language: **say what it is, never why it
is allowed.** Facts, no defence, no superlatives, never "Student". Self-
initiated work is annotated `Eigenprojekt` and hangs as an equal.

Tech: **Next.js 16.2.1** (App Router, Turbopack), **React 19**, plain CSS
(tokens + CSS modules), TypeScript. Fonts self-hosted via `next/font`
(DM Sans, Space Mono, Righteous).

> ⚠️ **Read `AGENTS.md`** — this Next.js version has breaking changes vs older
> docs (`proxy.ts` not middleware, `preload` not `priority`, `params` is a
> Promise…). Consult `node_modules/next/dist/docs/` before writing code.

---

## 2. How to run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint       # 0 errors, 0 warnings — keep it that way
```

Requires Node 20+.

---

## 3. Git state

- Working branch: **`restructure/one-studio`** (the whole restructure, ~12
  commits on top of `main`). **Not merged / not pushed** — pending the
  client's visual sign-off (their acceptance criterion is screenshots, not a
  passing build).
- `main` = `origin/main` = the last pre-restructure state.
- Remote: `https://github.com/garpu-ng/nokta-web.git`.
- A failed earlier restructure attempt is parked at
  `archive/one-studio-2026-07-24` (and an older one at
  `archive/one-studio-failed`). Don't build on them.

---

## 4. Architecture

### The work model — `lib/works.ts` (single source of truth)
`Work = { slug, title, kind, year, client?, thumb, span, source }`.
`WORKS` is the **curated wall order** (architecture-led; the module throws at
import if three consecutive works share a kind or a slug repeats — a bad edit
fails the build). `kind` ∈ `rendering · cad · editorial · study · manual`,
with `drawing` / `collage` reserved in a comment for the academic material
(floor plans, isometrics, collages) that isn't compiled yet — adding a work is
one entry here + a thumb + a `lib/mediaSizes.ts` row, no layout change.
`source` points at `lib/projects.ts` (6 archviz projects), `lib/prints.ts`
(4 CAD prints, `paymentLink` still empty → buy button falls back to
`/kontakt`), or marks a bespoke piece (KI-Kommission report, n-Studie,
Leuchtturm). `client` absent ⇒ the UI annotates **Eigenprojekt**.

### Routes
| Route | What |
|---|---|
| `/` | statement hero (lead, mono sub-line, motto with the red dot as final period, `ProgressionMark`) → the wall (`WorkWall`) → `HomeContact` |
| `/arbeiten/[slug]` | one detail route for all 13 works: shared `ProjectHeader` (title + the same annotation as the wall card) + per-kind body — image stack (renderings), technical passport incl. price + buy (prints), `CaseStudy` (report), `ArtPlate` (n-Studie), `Leuchtturm` (manual, deliberately no CTA) — + prev/next crossing kinds |
| `/studio` | TeaserVideo, hero, team (Mert = deliberate "portrait folgt" placeholder), `ServiceIndex` (4 studio-wide service rows), CTA |
| `/prozess`, `/kontakt`, `/impressum`, `/datenschutz` | as before (legal pages are still placeholder text, German only) |
| `/punkt` | easter egg; its door is the red period of the footer wordmark |
| `/point` `/cube` `/line` `/arch` `/nokta` `/arbeiten` | `permanentRedirect("/")` |
| `/line/[slug]`, `/projekte/[slug]` | `permanentRedirect("/arbeiten/[slug]")` (same slugs) |
| `sitemap.ts` / `robots.ts` / `app/icon.png` | file-convention metadata routes |

### The annotation (brief-critical)
`workAnnotation()` in `components/work/WorkAnno.tsx` renders
`Kind · Jahr · Client-oder-Eigenprojekt` — the **identical** line on every
wall card and every detail header. Prints carry price **only** on their own
page. No price, no "kaufen", no cart on the wall.

### Colour & styling
Three tokens in `app/styles/tokens.css`: `--paper #e9e0ce`, `--ink #1a1a18`,
`--accent #b83636`. Always paper pages, ink type; the accent is the studio's
red **mark** (wordmark dot, motto period, label points) — never a surface,
with one named exception: the home contact band's disc, the brand dot at
scale. The same values live in `lib/colors.ts` for code that needs literals
(OG cards, inline SVG). No themes, no `data-branch`, no proxy/middleware.
`globals.css` imports `tokens.css` → `base.css` (reset + `.nk-mono-caption`,
`.nk-grain`, `.nk-page-fade`) → `nokta.css` (page layouts). Components carry
colocated `*.module.css`.

### i18n
Cookie-based (`nk_lang`), German is the source: `messages/{de,en,tr,ja}.ts`,
flat keys, **exact key parity enforced** (a compare script is the gate; the
lookup falls back en→de→key so a missing key renders visibly as the key).
`getT()` in `lib/i18n.ts` is server-only. The motto template keeps literal
`{point} {line} {form}` tokens in every locale — `app/page.tsx` splits on
them. Client components receive **pre-translated strings as props**.

### Social cards
`lib/socialMeta.ts` (metadata merges shallowly in Next — always compose
through it) + `lib/og.tsx` render the root card; work detail pages override
`openGraph.images` with the work's thumb.

---

## 5. TODO (carried forward)

- [ ] **Contact mailbox** — `hallo@nokta-studio.de` is unified everywhere but
      the mailbox itself still has to be registered/set up.
- [ ] **Stripe links** — paste the 100-€ Payment Link URLs into `paymentLink`
      in `lib/prints.ts` (one per print); each print goes live the moment its
      URL is set, no code change.
- [ ] **Vercel + domain** — repo not connected yet; `metadataBase` is
      `https://www.nokta-studio.de`.
- [ ] **Legal texts** — Impressum/Datenschutz are placeholders, German only.
- [ ] **Social links** — footer Instagram/LinkedIn/Behance are `#`.
- [ ] **Mert's portrait** — swap the placeholder card for the `<GifVideo>` row
      once `public/flymemert.mp4` exists (comment in `app/studio/page.tsx`).
- [ ] **Language toggle** — "JA" clips at the right edge on wide screens
      (pre-existing).
- [ ] **OG display font** — the generated cards render in `next/og`'s default
      face, not Righteous/Space Mono (would need shipping woff binaries).
- [ ] **The academic slot** — when the floor plans / isometrics / collages are
      compiled, add them as `drawing` / `collage` works in `lib/works.ts`.

---

## 6. Related

- **This repo:** `github.com/garpu-ng/nokta-web`
- **waarchi (frozen; the archviz work's previous home):**
  `github.com/garpu-ng/waarchi-revamp` — still deployed on Vercel
  (`waarchi.kaanmaan.cv`); local Linux backups in `/home/kaan/backups/`.

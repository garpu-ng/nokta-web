# One-Studio Restructure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dissolve the three branch sections (/point, /cube, /line) into one studio with a single body of work: the home page states what nokta is and shows all thirteen pieces on one wall; every piece gets an identically annotated detail page under `/arbeiten/[slug]`; the branch navigation, colour flood and per-branch theming are removed.

**Architecture:** A new `lib/works.ts` is the single curated list (order, kind, span) uniting the existing `lib/projects.ts` + `lib/prints.ts` data with three first-class studio pieces (KI-Kommission report, n-Studie, Leuchtturm). The home page becomes statement + wall + contact. One dynamic route `/arbeiten/[slug]` renders a per-kind body (image stack / print passport / case study / plate) under a shared work header with identical annotation. The chrome loses TabBar/BranchReveal/proxy/data-branch; paper background site-wide; the red dot `#b83636` is the only accent.

**Tech Stack:** Next.js 16.2.1 (App Router, `proxy.ts` convention, `preload` not `priority`, params-as-Promise), React 19, plain CSS (tokens + CSS modules), flat-key i18n in `messages/{de,en,tr,ja}.ts` (German source, exact key parity).

**Verification:** This repo has no test suite and the client's acceptance criterion is explicit: screenshots at desktop and phone width, reviewed by a human. Per task: `npm run build` must pass. At the end: production server + Playwright screenshots of every page at 1440×900 and 390×844.

**The brief (register rules — bind every copy decision):**
- Say what it is. Never why it is allowed. Facts read as confidence; arguments read as defence.
- ✗ "Architektur und Design waren nie getrennt." ✓ "Wir zeichnen Gebäude, Bücher und Drucke."
- ✗ "Ein Regierungsbericht und ein Teehaus. Dasselbe Werkzeug." ✓ "216 Seiten · 8 Kapitel · 20 Empfehlungen. Satz und Druckvorstufe."
- Never the word "Student/studentisch" or any apology for self-initiated work. Own work is annotated `Eigenprojekt`, nothing more.
- No prices, no "kaufen", no cart on the wall. Price and checkout are facts on a print's own page.
- The motto stays everywhere it is: "Vom Punkt zur Linie zur Form."

---

## Current state (inventoried 2026-07-24, HEAD 932ed89)

- Branch layer = 4 cooperating pieces: `proxy.ts` (sends `x-nk-pathname`) → `app/layout.tsx` (bakes `data-branch` into `<html>`) → `components/TabBar.tsx` (4 tabs, dispatches `nk:reveal`) → `components/BranchReveal.tsx` (colour flood, owns `data-branch` after hydration). Theme surface: 4 `:root[data-branch=…]` blocks in `app/styles/tokens.css`.
- Pages: `/` (manifesto + 3 branch cards), `/point` (NoktaHero, CaseStudy, ArtPlate, Leuchtturm, ServiceIndex, NoktaBand), `/cube` (ArchHero+CubeLogo3D, DotField, PosterWall, PerspectiveGrid), `/line` (LineHero, PlotLine, PrintCatalogue, LineBand), `/line/[slug]` (print passport + buy), `/projekte/[slug]` (image stack), `/studio`, `/kontakt`, `/prozess`, legal, `/punkt`, redirect stubs `/arch` `/nokta`.
- i18n: 181 flat keys × 4 locales, exact parity, `getT()` server-side, German fallback.
- Dead code: `components/Carousel.tsx` (+ its only reason for `app/styles/arch.css` and `app/styles/waarchi.css`), `components/nokta/ColorStrip.tsx` (+ key `nokta.strip.label`), key `aria.punkt`.
- Known red lint: `components/LanguageToggle.tsx:25`, `components/PunktEasterEgg.tsx:56` (only two errors).
- Gotchas: metadata merges shallowly (use `lib/socialMeta.ts`); image intrinsics must be registered in `lib/mediaSizes.ts`; `ProjectHeader` hardcodes back link `/cube`; BranchReveal also owns scroll-to-top on navigation (Next's `data-scroll-behavior="smooth"` on `<html>` covers route-transition scrolling once BranchReveal is gone — verify in screenshots); `three` dependency exists only for `arch/CubeLogo3D`.

---

## Design decisions (locked)

1. **Home = statement + wall.** No separate index route. First screen: factual statement, motto, and the top of the wall. `HomeContact` stays at the bottom.
2. **Detail routes:** `/arbeiten/[slug]` for all thirteen. Old `/projekte/[slug]` and `/line/[slug]` become `permanentRedirect` stubs (slugs unchanged). `/point`, `/cube`, `/line`, `/arch`, `/nokta` → `permanentRedirect("/")`.
3. **Kinds are stamps + a filter, never sections.** `WorkKind = "rendering" | "cad" | "editorial" | "study" | "manual"`. The vocabulary deliberately has room for future academic kinds (`"drawing"`, `"collage"`) — that is the "open slot": adding a work is one entry in `lib/works.ts` + one thumb + one mediaSizes row, no layout change.
4. **Identical annotation everywhere:** `Kind-Stamp · Jahr · Client-oder-Eigenprojekt` on every card and every detail header. Prints carry price **only** on their detail page.
5. **One accent.** The red `#b83636` becomes `--accent`. Cobalt `#4b5cbe` and green `#5f6f53` retire from theming (they may survive *inside* artwork SVGs where they are part of a drawing, but not as page/section colours). Paper background site-wide; `data-branch` theming deleted.
6. **Motto treatment:** all words ink; the sentence-ending period is the red dot (`.nk-dot`-style). `ProgressionMark` stays on the home hero, recoloured: red start dot, ink line, ink cube.
7. **Curated wall order** (architecture leads by ratio; report sits beside the teahouse; never three renderings in a row — spans are 12-col grid widths, phone is one column):

| # | slug | kind | span |
|---|------|------|------|
| 1 | sanktgores | rendering | 7 |
| 2 | abschlussbericht-ki-kommission | editorial | 5 |
| 3 | teahouse | rendering | 5 |
| 4 | eiffel | cad | 3 |
| 5 | beatbuilding | rendering | 7 |
| 6 | n-studie | study | 4 |
| 7 | binome | rendering | 6 |
| 8 | chrysler | cad | 3 |
| 9 | ipehouse | rendering | 7 |
| 10 | leuchtturm | manual | 4 |
| 11 | empire-state | cad | 3 |
| 12 | velostation | rendering | 6 |
| 13 | osaka | cad | 3 |

   (Executor may fine-tune spans against real thumbnails/aspect ratios for an even wall — the *order* is fixed.)
8. **ServiceIndex moves to `/studio`** and is rewritten to cover the whole studio (4 factual rows spanning visualisation, editorial/satz, druckvorstufe, CAD-drucke). `TeaserVideo` moves to `/studio` (brand film belongs with the studio, not above the work).
9. **Components that die:** TabBar, BranchReveal, Carousel, ColorStrip, NoktaHero, NoktaBand, ArchHero, CubeLogo3D (and the `three` dependency), DotField, PerspectiveGrid, PosterWall, LineHero, PlotLine, PrintCatalogue, LineBand, BranchCardMark. **Components that live on:** CaseStudy, ArtPlate, Leuchtturm, ServiceIndex (moved), ProgressionMark (recoloured), ProjectHeader (generalised), Registration, PlotterReveal, WordmarkHeadline (if a hero wants it), Footer (rebuilt columns), Dot, GifVideo, TeaserVideo (moved), HomeContact, LanguageToggle, PunktEasterEgg (untouched easter egg).
10. **`lib/branches.ts` dies.** `PAPER`, `INK` move to a new `lib/colors.ts` together with `RED = "#b83636"`. `proxy.ts` is deleted (its only job was the pathname header).
11. **OG cards:** root card stays. Per-branch OG routes die with their routes. `/arbeiten/[slug]` sets `openGraph.images = [work thumb]` on top of `socialMetadata(...)`.
12. **Register:** German is written first (Task 7 contains the actual copy contract); en/tr/ja follow with exact key parity.

---

### Task 1: The work model — `lib/works.ts`

**Files:**
- Create: `lib/works.ts`
- Read for reference: `lib/projects.ts`, `lib/prints.ts`, `lib/mediaSizes.ts`

- [ ] **Step 1: Write `lib/works.ts`** — the single curated source for the wall and the detail routes:

```ts
import { PROJECTS, type Project } from "./projects";
import { PRINTS, type Print } from "./prints";

export type WorkKind =
  | "rendering" // archviz
  | "cad"       // CAD line prints (for sale)
  | "editorial" // editorial / layout / prepress
  | "study"     // self-initiated studies
  | "manual";   // in-house manuals
// Reserved for the academic slot (floor plans, isometrics, collages) — add
// entries with these kinds when the material is compiled; no layout change needed:
// | "drawing" | "collage"

export type Work = {
  slug: string;
  /** display title (proper names stay untranslated) */
  title: string;
  kind: WorkKind;
  year: string;
  /** client name; omit for own work → the UI annotates "Eigenprojekt" */
  client?: string;
  /** wall thumbnail (must exist in lib/mediaSizes.ts) */
  thumb: string;
  /** 12-col grid span on the wall (desktop); phone is always one column */
  span: 3 | 4 | 5 | 6 | 7;
  /** where the detail body comes from */
  source:
    | { type: "project"; project: Project }
    | { type: "print"; print: Print }
    | { type: "piece" }; // editorial / study / manual — bespoke detail bodies
};
```

Then the curated list — order and spans exactly as in Design decision 7. Project entries derive `title`, `client`, `year`, `thumb` from the `Project`; print entries from the `Print` (`thumb` = `print.image`; prints have **no** `client` → Eigenprojekt; year on a print's annotation is the *edition* year `"2025"`, not the building year — the building year stays a passport fact on the detail page). The three pieces are defined inline:
  - `abschlussbericht-ki-kommission` — title `Abschlussbericht KI-Kommission`, kind `editorial`, year `2026`, client `BMWE`, thumb `/point/abschlussbericht/01.webp` (use the real first-spread filename found in `public/point/abschlussbericht/`).
  - `n-studie` — title `n-Studie`, kind `study`, year `2025`, no client, thumb `/point/n-study.png`.
  - `leuchtturm` — title `Leuchtturm`, kind `manual`, year `2025`, no client, thumb `/point/leuchtturm-cover.webp`.
  - (Check the real years in the existing `point.*` message copy — if CaseStudy facts state different years, use those.)

Export `WORKS: Work[]`, `getWork(slug)`, `prevNext(slug)` → `{ prev?: Work; next?: Work }` over the curated order (no wrap-around).

- [ ] **Step 2: Sanity-check the curated order in code.** Add a module-level dev assertion (plain code, runs at import): no three consecutive works of the same kind, all slugs unique — `throw new Error` on violation so a bad edit fails the build.

- [ ] **Step 3: `npm run build`** — expect success (nothing imports works.ts yet; the assertion runs when Task 2 wires it).

- [ ] **Step 4: Commit** — `feat: add the one-studio work model (lib/works.ts)`

---

### Task 2: Wall components — card, annotation, filter

**Files:**
- Create: `components/work/WorkCard.tsx` + `WorkCard.module.css`
- Create: `components/work/WorkAnno.tsx` (tiny, shared by card + detail header)
- Create: `components/work/WorkWall.tsx` + `WorkWall.module.css` (client component: holds the filter state; the wall markup itself stays simple)
- Reference for tone: `components/line/PrintCatalogue.tsx` (card restraint), `components/arch/PosterWall.module.css` (grid feel), `.nk-mono-caption` in `app/styles/base.css`

- [ ] **Step 1: `WorkAnno`** — one line, mono caption voice: `{kindLabel} · {year} · {client ?? t("work.own")}`. Takes pre-translated strings as props (server pages call `getT()`; `WorkWall` is a client component, so translate *before* passing down).

- [ ] **Step 2: `WorkCard`** — `next/image` thumb (intrinsics via `getMediaSize`), title, `WorkAnno`. Whole card is a `<Link href={/arbeiten/${slug}}>`. No price anywhere. Restrained hover (existing site vocabulary: subtle scale/frame, nothing branded).

- [ ] **Step 3: `WorkWall`** — renders the filter row + a 12-col CSS grid of `WorkCard`s with per-work `span`. Filter row: `Alle` + one stamp per kind present in `WORKS` (labels passed in pre-translated). Client-side `useState<WorkKind | null>`; non-matching cards get `display: none` (CSS class, not unmount — keeps images cached). Initial state = all works → without JS the full wall renders and the filter row is inert. Filter buttons are real `<button>`s with `aria-pressed`. **Phone: single column, spans ignored (media query), filter row horizontally scrollable if needed.**

- [ ] **Step 4: `npm run build`** — components compile (not yet mounted).

- [ ] **Step 5: Commit** — `feat: add wall components (WorkCard, WorkAnno, WorkWall)`

---

### Task 3: Home = statement + wall + contact

**Files:**
- Rewrite: `app/page.tsx`
- Modify: `components/home/ProgressionMark.tsx` (recolour via existing `colors` prop — red point, ink line, ink cube)
- Modify: `app/styles/nokta.css` (retire `.nk-branch-grid`/`.nk-branch-card*`; add/adjust home statement styles; keep `.nk-pillar` only if the new hero wants it — a paper hero is also fine, ink on paper)
- Delete: `components/home/BranchCardMark.tsx` + module css
- Keys used (created in Task 7; until then German fallback strings may be added directly to `messages/de.ts` as placeholders with the *final* copy from Task 7's table): `home.lead`, `home.sub`, `home.motto`, `home.wall.aria`, `work.own`, `work.filter.all`, `work.kind.{rendering,cad,editorial,study,manual}`
- [ ] **Step 1: Rebuild `app/page.tsx`:**
  1. Statement hero (paper, ink type): `h1` = `t("home.lead")`, a mono-caption sub-line = `t("home.sub")`, the motto line with the red dot as final period, `ProgressionMark` slim underneath.
  2. The wall: heading is **not** "Projekte" or any category — a plain `Arbeiten` section label in mono caption is enough; then `<WorkWall …/>` with pre-translated labels.
  3. `HomeContact` unchanged at the bottom.
  `TeaserVideo` import is removed from home (it returns on `/studio` in Task 5).
- [ ] **Step 2: `npm run build` + `npm run dev`** — eyeball `/` renders: statement, 13 cards in curated order, filter toggles, contact. (The old chrome/tabs still exist above it — they die in Task 5; ignore them here.)
- [ ] **Step 3: Commit** — `feat: home becomes statement + the one wall`

---

### Task 4: `/arbeiten/[slug]` — one detail route, per-kind bodies

**Files:**
- Create: `app/arbeiten/[slug]/page.tsx` (+ `page.module.css` if needed)
- Modify: `components/ProjectHeader.tsx` (generalise: props `{ title, anno, backHref="/", backLabel }`; remove hardcoded `/cube`)
- Reuse bodies: `components/nokta/CaseStudy.tsx`, `ArtPlate.tsx`, `Leuchtturm.tsx`; the image-stack markup from `app/projekte/[slug]/page.tsx`; the passport layout from `app/line/[slug]/page.tsx`
- Reference: `lib/socialMeta.ts` (metadata merges shallowly!), `lib/mediaSizes.ts`

- [ ] **Step 1: Build the route.** `generateStaticParams` over `WORKS`; `notFound()` on unknown slug. Shared frame: generalised `ProjectHeader` (title + `WorkAnno` line, back link `/` labelled `t("work.back")`), body by `work.source.type`/`kind`:
  - **project** → the image stack from the old `/projekte/[slug]` (same `.wa-image-window` classes, `preload={i===0}`).
  - **print** → the passport: framed artwork, `<dl>` spec table (subject/city/building-year/architect/coordinates/technique/format), price stated as fact (`100 € · inkl. Rahmen A1` style — reuse existing `line.*` keys), buy button = existing logic (`paymentLink` → Stripe, else `/kontakt`).
  - **piece** → by slug: `abschlussbericht-ki-kommission` mounts `CaseStudy`; `n-studie` mounts `ArtPlate` plus a short factual lead (`work.nstudie.lead`, Task 7); `leuchtturm` mounts `Leuchtturm` (deliberately no CTA — keep it that way).
  Bottom: prev/next over `prevNext(slug)` — titles as labels, crossing kinds (this is the "one body" made navigable).
- [ ] **Step 2: Metadata.** `generateMetadata`: title `` `${work.title} · nokta` ``, description from the work (for pieces use their existing `point.*`/new keys; for projects `projects.desc.{slug}`; for prints `line.metaDescSuffix` pattern), `socialMetadata({ …, path: /arbeiten/${slug} })` **plus** `openGraph.images = [work.thumb]` merged on top.
- [ ] **Step 3: `npm run build`** then spot-check in dev: `/arbeiten/sanktgores`, `/arbeiten/eiffel`, `/arbeiten/abschlussbericht-ki-kommission`, `/arbeiten/n-studie`, `/arbeiten/leuchtturm`.
- [ ] **Step 4: Commit** — `feat: /arbeiten/[slug] — one detail route for every kind of work`

---

### Task 5: Remove the branch layer; rebuild chrome on paper

**Files:**
- Rewrite: `app/layout.tsx` (drop `headers()`/`NK_PATHNAME_HEADER`/`data-branch`; header = brand row + primary nav `Studio · Prozess · Kontakt` + `LanguageToggle`; keep fonts, metadata, Footer; keep `data-scroll-behavior="smooth"`)
- Modify: `app/layout.module.css` (tab-sticky styles go; brand row becomes the only header)
- Delete: `components/TabBar.tsx` + module, `components/BranchReveal.tsx` + module, `proxy.ts`
- Create: `lib/colors.ts` → `export const PAPER = "#e9e0ce"; export const INK = "#1a1a18"; export const RED = "#b83636";`
- Delete: `lib/branches.ts` (after re-pointing every importer — grep for `lib/branches`)
- Modify: `app/styles/tokens.css` — delete all 4 `[data-branch]` blocks; `--brand-bg` stays paper; rename accent usage to `--accent: #b83636` (grep `--brand-accent` users and update)
- Modify: `components/Footer.tsx` — columns become: Seiten (Arbeiten `/`, Studio, Prozess, Kontakt) · Rechtliches (Impressum, Datenschutz) · contact block. No `BRANCHES` import.
- Modify: `app/studio/page.tsx` — `TeaserVideo` on top, `ServiceIndex` section added (import moves from the dead `/point`)
- Impacted pages: any page reading `branch.*` taglines via layout (`taglines` object dies)

- [ ] **Step 1: Build `lib/colors.ts`; re-point importers of `lib/branches` (grep first — known: layout, TabBar, BranchReveal, Footer, page.tsx (home, done in Task 3), `lib/og.tsx` root card uses `INK`).**
- [ ] **Step 2: Rewrite layout + header; delete TabBar/BranchReveal/proxy; purge tokens.css.** Impressum/Datenschutz leave the header (they stay in the footer).
- [ ] **Step 3: Footer + studio page changes.**
- [ ] **Step 4: `npm run build`** — expect zero references to `lib/branches`, `data-branch`, `nk:reveal`. `npm run dev`: every page paper-backed, header shows logo + 3 links + language toggle, navigation scrolls to top (Next handles it — verify by navigating from a scrolled wall).
- [ ] **Step 5: Commit** — `feat: one paper chrome — remove tabs, flood and branch theming`

---

### Task 6: Redirects for every old path

**Files:**
- Rewrite as stubs: `app/point/page.tsx`, `app/cube/page.tsx`, `app/line/page.tsx` → `permanentRedirect("/")` (delete their sibling `opengraph-image.tsx`/`twitter-image.tsx` files and any now-unused hero components' imports)
- Rewrite as stub: `app/line/[slug]/page.tsx` → `permanentRedirect(\`/arbeiten/${slug}\`)` (params is a Promise — await it); delete its `page.module.css` once the passport layout lives in `/arbeiten`
- Rewrite as stub: `app/projekte/[slug]/page.tsx` → `permanentRedirect(\`/arbeiten/${slug}\`)`
- Modify: `app/arch/page.tsx`, `app/nokta/page.tsx` → `permanentRedirect("/")`

- [ ] **Step 1: Write all six stubs.**
- [ ] **Step 2: `npm run build`; in dev verify** `/point → /`, `/cube → /`, `/line → /`, `/line/eiffel → /arbeiten/eiffel`, `/projekte/teahouse → /arbeiten/teahouse`, `/arch → /`, `/nokta → /`.
- [ ] **Step 3: Commit** — `feat: redirect the branch-era paths into the one studio`

---

### Task 7: The German copy layer (source of truth)

**Files:**
- Modify: `messages/de.ts` only (other locales in Task 8)
- Reference: the register rules at the top of this plan; existing good copy (`line.*` passport labels, `prozess.*` steps, `point.case.*` facts) stays

- [ ] **Step 1: Remove dead keys** — all `branch.*`; `arch.*` (index page copy); `line.lead` (index); `nokta.hero*`/`nokta.band*`/`nokta.strip.label` (die with their components — grep each `nokta.*` key's usage before deleting; `nokta.svc.*` **stays**, it moved to /studio); `home.lead.body` + `home.motto.{point,line,form}` + `home.contact.*` (replaced or kept — see step 2); `meta.{nokta,arch,line}.title`.
- [ ] **Step 2: Add the new keys with exactly this copy** (fine-tuning allowed, register is not negotiable):

```
"meta.site.title": "nokta — Designstudio, Düsseldorf",
"meta.site.desc": "Designstudio in Düsseldorf. Wir zeichnen Gebäude, Bücher und Drucke — Visualisierung, Satz, Druckvorstufe und CAD-Pläne.",
"home.lead": "Wir zeichnen Gebäude, Bücher und Drucke.",
"home.sub": "Designstudio · Düsseldorf",
"home.motto": "Vom Punkt zur Linie zur Form",   // rendered with the red dot as the final period
"home.wall.label": "Arbeiten",
"home.wall.aria": "Alle Arbeiten",
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
```

  `home.contact.*` keys stay (the section survives). Studio services (`nokta.svc.0..3`) are **rewritten** to span the studio factually — four rows in the pattern *what · for whom stays implicit · stated as deliverable*, e.g. `Architekturvisualisierung — Modell, Licht, Bild.` / `Editorial & Satz — vom Manuskript bis zur Druckvorstufe.` / `Druckproduktion — Bogen, Papier, Auflage.` / `CAD-Pläne & Liniendrucke — aus echten Zeichnungen vektorisiert.` (executor refines wording; no superlatives, no justification).
- [ ] **Step 3: Grep-audit**: every `t("…")` key used in `app/` + `components/` exists in `de.ts`; list dynamically-composed prefixes and check them by hand: `work.kind.{k}`, `nokta.svc.{0..3}.*`, `point.case.*`, `prozess.step.*`, `projects.cat.*`, `projects.desc.*`, `line.*` passport keys.
- [ ] **Step 4: `npm run build` + eyeball dev in German.**
- [ ] **Step 5: Commit** — `feat: the copy layer says what it is (German source)`

---

### Task 8: en / tr / ja — real translations, exact parity

**Files:**
- Modify: `messages/en.ts`, `messages/tr.ts`, `messages/ja.ts`

- [ ] **Step 1:** Mirror the exact key set of `de.ts` in each locale — remove the keys Task 7 removed, translate the keys Task 7 added/changed. Real translations, not transliterations; the register rules apply in every language (facts, no defence). Proper names (`nokta`, work titles, `Leuchtturm`, `n-Studie`) stay; `work.own`: en `Self-initiated`, tr `Kendi projemiz`, ja `自主プロジェクト` (translator refines). The motto is already translated in each locale — keep those translations.
- [ ] **Step 2: Parity check (hard gate):** run a Node one-liner comparing sorted key sets of all four files — zero missing, zero extra, in every pair.
- [ ] **Step 3: `npm run build`; spot-check EN and JA in dev (cookie `nk_lang`).**
- [ ] **Step 4: Commit** — `feat: en/tr/ja follow the German source, exact parity`

---

### Task 9: Cleanup, OG, lint, favicon

**Files:**
- Delete: `components/Carousel.tsx`, `app/styles/arch.css`, `app/styles/waarchi.css` (update `app/globals.css` imports), `components/nokta/ColorStrip.tsx` + module, `components/arch/*` (all four + modules + `/nokta_cube_logo.glb`/`svg` if unreferenced), `components/line/*` (all four + modules), `components/nokta/NoktaHero.tsx`/`NoktaBand.tsx` + modules, `components/home/BranchCardMark.*` (if not already gone in Task 3), `components/BranchShell.module.css` (unless `/arbeiten` reuses it — then rename properly)
- Modify: `package.json` — remove `three` + `@types/three` (`npm uninstall three @types/three`)
- Modify: OG routes — delete `app/{point,cube,line}/opengraph-image.tsx` + `twitter-image.tsx` (with Task 6's stubs these dirs hold only the redirect); root card caption updated to the new studio line (`lib/og.tsx` callers)
- Fix lint: `components/LanguageToggle.tsx:25` (extract the cookie write into a module-level helper function outside the component, or a one-line `eslint-disable-next-line react-hooks/immutability` with a comment naming the false positive), `components/PunktEasterEgg.tsx:56` (`eslint-disable-next-line react-hooks/set-state-in-effect` with the standard mounted-gate justification)
- Favicon: move `public/favicon.png` → `app/icon.png` (Next 16 file convention)

- [ ] **Step 1: Deletions + dependency removal; grep before each delete** (`Carousel`, `ColorStrip`, `arch/`, `line/` components must have zero importers by now).
- [ ] **Step 2: Lint fixes; `npm run lint`** → **0 errors** (first green lint in the repo).
- [ ] **Step 3: `npm run build`** → success; bundle no longer contains three.js.
- [ ] **Step 4: Commit** — `chore: drop the dead branch-era code, green lint, real favicon`

---

### Task 10: Visual verification (the acceptance gate)

**Files:**
- Create (scratchpad, NOT committed): screenshot script using Playwright against the production server

- [ ] **Step 1:** `npm run build && npm run start` (port 3000, background).
- [ ] **Step 2:** Screenshot **every** page, full-page, at `1440×900` and `390×844`: `/`, `/arbeiten/sanktgores`, `/arbeiten/abschlussbericht-ki-kommission`, `/arbeiten/eiffel`, `/arbeiten/n-studie`, `/arbeiten/leuchtturm`, `/studio`, `/prozess`, `/kontakt`, `/impressum`, `/404-nonexistent` (not-found page). Plus `/` with cookie `nk_lang=en` and `nk_lang=ja` (parity spot check).
- [ ] **Step 3: Review the screenshots** against the brief: statement first screen; 13 pieces, curated order; never 3 renderings in a row visually; identical annotations; no price on the wall; price stated as fact on print pages; no branch colours as page washes; red dot as the accent; phone layout single column, filter usable; header/footer coherent; all four languages sane.
- [ ] **Step 4: Fix what the screenshots catch, re-shoot, repeat until clean.**
- [ ] **Step 5:** Leave the production server running; send the screenshots to the client. **No push to main** — everything stays on `restructure/one-studio` until visual sign-off.

# Styling-Layer Refactor Implementation Plan (REVISED)

> **For agentic workers:** Execute task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decompose the monolithic 1278-line `globals.css` into a clean global layer +
colocated CSS Modules for the nokta surface, remove the unused Tailwind/postcss layer, and
keep the rendered look byte-for-byte identical. **`mir.css` (127 KB live Webflow CSS) is
load-bearing and stays.**

**Architecture — two worlds:**
- **nokta side** (`.nk-*`, `.wa-*`, `.carousel-*`, `.project-*`): our own CSS, decoupled from
  mir.css → migrate to **CSS Modules** (colocated per component/page).
- **archviz side** (`.work-section`, `.work_list`, `.work_item`, `.work-link`, `.work-project`):
  augments Webflow global classes defined in `mir.css` → **must stay global**; extracted into a
  documented `app/styles/waarchi.css`.

**Tech Stack:** Next 16.2.1 (App Router, Turbopack), React 19, TS, CSS Modules (native).
Tailwind + postcss removed. `mir.css` kept (loaded via `<link>` in layout).

**Verification model (no unit tests):** each checkpoint is green when `npm run build`
succeeds, `npm run lint` is unchanged-or-better, and affected routes render identically to
`backup/pre-refactor-2026-07-06` (visual spot-check via the running dev server + browser).
**Bulk commit only** — one commit at the very end; do NOT commit per task.

---

## Target file structure

```
public/mir.css                       ← KEEP (127KB live Webflow CSS; loaded via <link>)
app/
  styles/
    tokens.css   ← :root design tokens + :root[data-branch=…] theme overrides
    base.css     ← our reset/overrides on top of mir.css (* font !important, html, body
                   with the legit mir-beating !important) + global utils (.nk-dot,
                   .nk-page-fade, @keyframes nk-fade-in)
    waarchi.css  ← archviz rules coupled to mir.css Webflow classes (work-section/…,
                   project-image-main, project-card) — GLOBAL, documented "keep global"
  globals.css    ← @import fonts; @import tokens; @import base; @import waarchi;  (~5 lines)
  layout.tsx     + layout.module.css   ← header chrome (nk-brandbar/tabsticky/brand/utility)
  page.tsx       + page.module.css     ← landing (.nk-landing*, .nk-branch-grid, .nk-branch-card*)
  nokta/  line/  studio/  kontakt/  impressum/  datenschutz/  → each + page.module.css
  arch/          + page.module.css     ← ONLY the ours-only bits (.wa-grid-column); work_*/
                   work-section stay global (waarchi.css). Mixed classNames OK.
  prozess/       + page.module.css     ← .wa-prozess-* (ours) → module
  projekte/[slug]/ + page.module.css   ← .wa-project-images/.wa-image-window/.wa-project-img (ours)
components/
  Footer.tsx        + Footer.module.css
  TabBar.tsx        + TabBar.module.css
  BranchReveal.tsx  + BranchReveal.module.css
  ProjectHeader.tsx + ProjectHeader.module.css      ← .wa-project-* (ours) → module
  Carousel.tsx      + Carousel.module.css            ← .carousel-* (ours) → module; drop w-dyn-item
  WorkGrid.tsx      → KEEP global classes (work-section/work_list/work-link/project-*),
                      because they match mir.css. NO module. Just drop dead w-dyn-* is optional.
lib/  (unchanged)
```

**Dead rules to delete (verified not in any TSX markup):** `.wa-divider`, `.wa-divider::before`,
`.wa-divider::after`, `.wa-divider-label`, `.intro-text`, `.nav.dropdown.smaller.big`,
`.new-logo.w-inline-block`. Also `.wa-logo` (verify unused first).

---

## Task 0: Baseline — DONE
- [x] build green (17 routes); lint = 1 warning (mir.css `no-css-tags`, pre-existing, KEEP —
      changing mir.css load method risks cascade order; leave the warning).
- [x] backup pushed (`backup/pre-refactor-2026-07-06`, `8a2b0e6`).

## Task 1: Global layer split (tokens / base / waarchi) — CHECKPOINT A
**Files:** create `app/styles/tokens.css`, `base.css`, `waarchi.css`; rewrite `app/globals.css`.
- [ ] `tokens.css`: `:root{…tokens…}` (globals.css L8–19) + the four `:root[data-branch=…]`
      blocks (L23–42), verbatim.
- [ ] `base.css`: `*{font-family…!important}` (L44–47), `html{…}` (L50–55), `body{…}` (L57–69,
      keep the `!important` — it beats mir.css), and global utils `.nk-dot` (L729–732),
      `.nk-page-fade`+`@keyframes nk-fade-in` (L749–768). Verbatim.
- [ ] `waarchi.css`: the mir.css-coupled arch rules verbatim — `.work-section.top.work-new`
      (L102–106), `.work-link`/`.work-link.big` (L183–191), `.project-image-main` (+hover)
      (L194–210), `.project-card.new`/`.project-card .project-name` (L213–219), and the mobile
      `.work_list.new`/`.work_item` (L640–648) + small-phone `.work_list.new` (L718–722).
      Add a top comment: "These augment Webflow classes defined in public/mir.css — keep GLOBAL."
- [ ] `globals.css` → just: `@import url(fonts);` `@import "./styles/tokens.css";`
      `@import "./styles/base.css";` `@import "./styles/waarchi.css";` — nothing else yet; leave
      the remaining (nk-/wa-) rules **in place below the imports** temporarily (migrated in
      Tasks 2–4). Delete the dead rules listed above now.
- [ ] **Verify (CHECKPOINT A):** `npm run build`; dev-server render `/` + `/arch` + `/prozess`
      identical (grid, carousel, colours, fonts). lint unchanged.

## Task 2: Modularize components — CHECKPOINT B
Order: Footer → BranchReveal → TabBar (+ layout.module.css header chrome) → ProjectHeader →
Carousel. For each: create `<Name>.module.css` with that component's rules (renamed to
camelCase local keys, `var(--…)` kept), wire `className={styles.x}`, delete those rules from
`globals.css`. Notes:
- **Footer**: `.nk-footer*` (L1180–1272) + mobile (L1274–1278).
- **BranchReveal**: `.nk-reveal` (L738–745).
- **TabBar**: `.nk-tabbar*`/`.nk-tab2*` (L844–910) + mobile (L1152–1165). Drop the styleless
  `nk-tab2--active` className from TSX (no rule exists; aria-selected carries state).
- **layout.module.css**: header chrome `.nk-brandbar/.nk-tabsticky/.nk-topbar-inner/.nk-topbar-row/
  .nk-utility/.nk-util/.nk-brand/.nk-brand-dot` (L773–840). Wire in `app/layout.tsx`.
- **ProjectHeader**: `.wa-project-header`(+ h1), `.wa-project-meta`(+ the `.wa-project-header
  .wa-project-meta` variant), `.wa-back`, `.wa-project-sticky`(+`--visible`), `.wa-project-sticky-title`,
  `.wa-project-sticky-meta` (L528–594) + mobile `.wa-project-sticky` (L710–714). Keep `var(--on-brand)`.
- **Carousel**: `.carousel-inner/.carousel-track(+:hover)/.carousel-card(+img)/.carousel-card-label`
  + `@keyframes scroll-left` (L138–180) + mobile `.carousel-inner` (L651–653). Drop `w-dyn-item`
  from markup. Verify the carousel still has height (check `/arch` — if height came from an inline
  style keep it; do NOT introduce a new height).
- [ ] **Verify (CHECKPOINT B):** build; render every route (Footer everywhere; tabs tall on `/`,
      reclined + hover-grow elsewhere; click a tab → colour-flood still fires; `/arch` carousel +
      `/projekte/<slug>` sticky header) — identical. lint unchanged.

## Task 3: Modularize pages — CHECKPOINT C
For each page: create `page.module.css`, move its ours-only rules from `globals.css`, rewrite
classNames to `styles.*`, delete moved rules. **Keep global** any `work_*`/`work-section` classes
in `/arch` markup (they live in waarchi.css) — mix `className={`work-link ${styles.x}`}` as needed.
- [ ] `/` landing: `.nk-landing*`, `.nk-branch-grid`, `.nk-branch-card*` (L913–993) + mobile
      (L1167–1174 shared grid rule — split per page or repeat).
- [ ] `/nokta`: `.nk-branch*` shell (L996–1035) + `.nk-service*` (L1123–1149). `/line`: `.nk-branch*`
      shell + `.nk-print*`/`.nk-btn` (L1037–1121). The shared `.nk-branch*` shell → put in a shared
      `components/BranchShell.module.css` imported by both (or repeat if <15 lines).
- [ ] `/studio`: `.wa-studio*`, `.wa-team*` (incl. Mert card) (L222–339) + mobile (L656–674).
- [ ] `/kontakt`: `.wa-kontakt*` (L373–424) + `.wa-page*` (L342–370) + mobile (L704–707, 696–701).
- [ ] `/impressum` + `/datenschutz`: `.wa-page*` — give each its own module (repeat the ~30 lines;
      do not re-globalize).
- [ ] `/prozess`: `.wa-prozess*` (L427–525) + mobile (L677–701). `/arch`: `.wa-grid-column` (L95–99)
      → module (`.intro-text` already deleted as dead).
- [ ] **Verify (CHECKPOINT C):** build; render all 17 routes desktop + 767px; `globals.css` now
      = only the `@import`s. lint unchanged.

## Task 4: Remove unused Tailwind + postcss — CHECKPOINT D
**Files:** `package.json`, delete `postcss.config.mjs`.
- [ ] Remove `@tailwindcss/postcss` + `tailwindcss` from devDependencies; delete `postcss.config.mjs`.
- [ ] `rm -rf node_modules .next && npm install`.
- [ ] **Verify (CHECKPOINT D):** `npm run build` succeeds without postcss/tailwind; render spot-check.

## Task 5: Docs
- [ ] `HANDOFF.md`: remove the non-existent `SideNav.tsx` reference; update the "Key CSS anchors"
      list to the new files (`app/styles/*.css` + per-unit `*.module.css`); note Tailwind removed;
      keep the (correct) mir.css description. Confirm the mir.css/theming explanation still holds.

## Task 6: Final verification + bulk commit
- [ ] `npm run build` ✓; `npm run lint` (still the single mir.css warning — acceptable/expected).
- [ ] Click through every route desktop + 767px; trigger colour-flood on each tab; confirm sticky
      tabs, hover, footer, Mert card — identical to backup.
- [ ] Single bulk commit on `main` (Co-Authored-By trailer). Leave push to the user unless asked.

---

## Self-Review
- **Coverage:** monolith split → Task 1; module migration → Tasks 2–3; Tailwind purge → Task 4;
  mir.css correctly KEPT (revision); dead-rule purge → Task 1; docs → Task 5.
- **Risk controls:** arch/Webflow classes stay global (waarchi.css) so mir.css coupling is intact;
  every checkpoint builds + renders before proceeding; `!important` mir-overrides preserved.
- **No placeholders:** every task cites exact source line ranges + class names.

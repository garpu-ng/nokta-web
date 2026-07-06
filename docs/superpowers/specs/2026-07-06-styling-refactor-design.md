# nokta-web — Styling-Layer Refactor (Design)

**Date:** 2026-07-06
**Strategy:** Refactor in place (keep the React/`lib` layer; overhaul the styling layer)
**Backup:** `backup/pre-refactor-2026-07-06` on GitHub (commit `8a2b0e6`) — full pre-refactor snapshot.

---

## REVISION (2026-07-06, during execution)

**Correction:** `public/mir.css` is **NOT** an empty/dead file. It is **127 KB of live,
minified Webflow CSS** (the earlier "0-byte" reading was a `wc -l` artifact — the file has
no newlines). It defines the Webflow reset + the 12-column `.work_list` grid,
`.work-section`, `.work-link`, `.work_item`, etc. — the structural backbone of the
**archviz pages**. Deleting it would break `/arch`, `/projekte/*`, `/prozess`.

**Consequences for this design:**
- **`mir.css` stays.** It is load-bearing, not dead. (Properly replacing it is a separate,
  larger project — out of scope here.)
- The `!important` overrides commented "beats/override mir.css" are **legitimate** and stay —
  they override real Webflow defaults (`body{background:#fff}`, `html{font-family:sans-serif}`,
  fixed `line-height`, etc.).
- The codebase is **two worlds**: (a) the **nokta side** (`.nk-*`, `.wa-*`) — our own CSS,
  decoupled from mir.css → these become **CSS Modules**; (b) the **archviz side**
  (WorkGrid/Carousel/arch/project/prozess) — built on Webflow global classes from mir.css →
  its class names **must stay global**, so these rules are extracted into a documented global
  `app/styles/waarchi.css` rather than modularized.
- Still valid and safe: removing unused Tailwind + postcss, splitting the monolith, fixing
  the dead `SideNav` doc reference and dead orphan classes (`.wa-divider*`, `.intro-text`,
  `.nav.dropdown*`, `.new-logo*`).

Sections below are superseded by this revision where they conflict (notably §3 structure adds
`waarchi.css`; §5 does NOT delete mir.css).

---

## 1. Problem / Motivation

The site *looks* vibe-coded but the diagnosis is narrower than that:

- **The TypeScript/React layer is clean and stays.** `lib/branches.ts` is a proper
  single-source-of-truth (tabs, theming, landing cards all derive from one list).
  `TabBar`, `BranchReveal`, `Footer` are small, focused, well-commented client
  components. Data (`projects.ts`, `prints.ts`) is separated from presentation.
- **The mess is the styling layer:**
  1. One monolithic **1278-line `globals.css`** mixing three concerns — design
     tokens (`:root`), legacy waarchi styles (`.wa-*`, `.nav.dropdown…`), and new
     nokta chrome (`.nk-*`). Two-plus naming eras coexisting.
  2. **Tailwind 4 is installed but 100% unused** — zero `@tailwind`/`@theme`/`@apply`
     anywhere. A build dependency that pays for nothing and misrepresents the project.
  3. **`public/mir.css` is an empty (0-byte) file** still `<link>`ed on every page,
     and `globals.css` carries `!important` hacks + comments ("beats mir.css",
     "override mir.css") that now fight a ghost.
  4. **Docs drift:** `HANDOFF.md` documents a `SideNav.tsx` that does not exist.

**Goal:** state-of-the-art, elegant, clean, expandable styling architecture, with the
rendered look kept **byte-for-byte identical** (this is a structure change, not a redesign).

**Non-goals (explicitly out of scope):** no content-model change (lib data files stay
as-is), no visual redesign, no new features, no React/routing rewrite.

## 2. Chosen Approach: CSS Modules + a global token layer

Rationale specific to this site:

- **The per-branch theming is the crown jewel and stays global.** `data-branch` on
  `<html>` reskins the whole page via CSS variables. That lives in `tokens.css`; every
  module reads `var(--brand-accent)` etc. Tailwind would fight this runtime-attribute
  pattern; CSS Modules embraces it.
- **Local scoping ends the naming war.** A component's styles live in
  `Component.module.css` beside it and cannot collide. `.wa-*` / `.nk-*` / `.carousel-*`
  eras collapse into scoped, rename-free class names.
- **Colocation = the requested expandability.** Add a page → add its folder + module.
  Delete a feature → delete one folder. Nothing to hunt for in a 1278-line file.
- **Drops the dead Tailwind dependency** — one less thing lying about how the project works.
- **Zero new dependencies; native to Next 16 App Router.** Lowest risk — matches
  "refactor in place."

Approaches considered and rejected:
- **Commit to Tailwind 4** — modern, but fights the CSS-variable theming core and would
  rewrite every class into utility soup for little gain on a small design-forward site.
- **Organized global CSS (`@layer`/`@import`)** — smallest change, but keeps everything
  global; doesn't deliver colocation or delete-safety, so it under-serves "expandable."

## 3. Target Structure

```
app/
  layout.tsx
  page.tsx            + page.module.css      ← each page owns a module
  arch/page.tsx       + page.module.css
  line/page.tsx       + page.module.css
  nokta/page.tsx      + page.module.css
  studio/page.tsx     + page.module.css
  prozess/page.tsx    + page.module.css
  kontakt/page.tsx    + page.module.css
  impressum/…  datenschutz/…  projekte/[slug]/…
  styles/
    tokens.css        ← :root vars + [data-branch] theme overrides (the colour wash)
    base.css          ← reset, font import, html/body, shared typography
    globals.css       ← @imports tokens + base; ~30 lines, not 1278
components/
  TabBar.tsx          + TabBar.module.css
  BranchReveal.tsx    + BranchReveal.module.css
  Footer.tsx          + Footer.module.css
  Carousel.tsx        + Carousel.module.css
  WorkGrid.tsx        + WorkGrid.module.css
  ProjectHeader.tsx   + ProjectHeader.module.css
lib/                  (unchanged — already clean)
```

**Kept global (not modularized), by design:**
- `tokens.css` — the `:root` design tokens and `:root[data-branch="…"]` theme overrides.
  These are inherently global (they theme the whole document) and are read by every module.
- `base.css` — reset, `@import` Jost font, `html`/`body`, base typography that isn't
  owned by any single component.

## 4. Theming Core (keep, formalize)

The mechanism is unchanged and remains the architectural centerpiece:
- `BranchReveal` sets `data-branch` on `<html>` (instant, or after the colour-flood).
- `tokens.css` defines `--brand-bg` / `--brand-accent` (and neutrals `--paper`, `--ink`)
  under `:root` and overrides them per `:root[data-branch="nokta|arch|line|home"]`.
- Modules never hardcode brand colours; they consume `var(--brand-accent)` etc.
- `lib/branches.ts` stays the single source of truth for branch data (colours in JS must
  keep matching the `[data-branch]` values in CSS — this coupling is documented in both files).

## 5. Cleanup List (concrete)

| Item | Action |
|---|---|
| `public/mir.css` (empty 0-byte) + its `<link>` in `layout.tsx` | **Delete** both |
| `!important` hacks + "beats/override mir.css" comments in CSS | **Remove** — they fight a ghost file |
| Webflow leftovers (`w-dyn-item`, `w-inline-block`) in `Carousel`/`arch` markup | **Strip** |
| ~3 orphaned `.wa-*` classes (defined, never referenced in TSX) | **Delete** |
| `@tailwindcss/postcss` + `tailwindcss` deps + `postcss.config.mjs` | **Remove** (verify Next 16 build works without postcss config) |
| `HANDOFF.md` `SideNav.tsx` reference + other drift | **Fix** to match reality |

Note: `carousel-*`, `work-*`, `wa-grid-column`, `project-image-main` are **live**
(archviz pages) — they get *renamed into their component modules*, not deleted.

## 6. Migration Order (site stays green throughout)

Each step is independently verifiable in the browser; there is no big-bang broken state.

1. **Extract tokens + base.** Pull `:root`/`[data-branch]` into `tokens.css`, reset/base
   into `base.css`; slim `globals.css` to imports. Look must be **identical**. Verify.
2. **Migrate components to modules, one at a time** — TabBar → Footer → BranchReveal →
   Carousel → WorkGrid → ProjectHeader. After each: verify render is identical, remove the
   now-migrated rules from `globals.css`.
3. **Migrate pages to modules, one at a time** — `/`, `/arch`, `/line`, `/nokta`,
   `/studio`, `/prozess`, `/kontakt`, `/projekte/[slug]`, legal pages. Verify each.
4. **Delete dead layer** — `mir.css` + `<link>`, Tailwind deps + postcss config, Webflow
   classes, orphaned `.wa-*`, ghost `!important` hacks — once nothing references them.
5. **Fix docs** — update `HANDOFF.md` to match the new structure and reality.

## 7. Verification (per step + final)

- After every step: `npm run dev` renders **identically** to the backup (spot-check each
  branch page + the colour-flood transition + sticky tabs + mobile breakpoint at 767px).
- `npm run build` succeeds (Turbopack, Next 16).
- `npm run lint` clean.
- Final: full click-through of all routes and both breakpoints; diff the rendered look
  against the `backup/pre-refactor-2026-07-06` branch.

## 8. Risks & Mitigations

- **Look regressions during CSS moves** → migrate one unit at a time, verify each; the
  backup branch is the reference.
- **Removing Tailwind/postcss breaks the build** → confirm Next 16 builds with no postcss
  config before deleting; that deletion is its own verifiable step.
- **CSS specificity/order changes** (esp. the documented end-of-file left-gutter padding
  that must win) → preserve cascade intent when relocating; verify the desktop left-gutter
  clearance still holds.
- **JS/CSS colour coupling** (`lib/branches.ts` vs `[data-branch]`) → keep both in sync;
  document the contract in each file.

## 9. Definition of Done

- No `globals.css` over ~30 lines; styles colocated as modules.
- Tailwind, postcss config, and `mir.css` removed; no ghost-fighting `!important`.
- Every route renders identically to the backup at desktop and mobile.
- `build` + `lint` clean.
- `HANDOFF.md` matches the new structure.
- Adding a new page/component is: create folder + `.module.css` — no central file to edit.

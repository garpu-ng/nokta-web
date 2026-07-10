# nokta.arch Poster-Wall Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/arch` from a generic image grid into a sequence of "posters" — cream-dominant compositions with hard cobalt planes, a chunky soft-serif display voice, generative dot fields, and a perspective grid — per the client's moodbook.

**Architecture:** New self-contained components under `components/arch/` (hero, perspective grid, dot field, poster wall), composed by `app/arch/page.tsx`. The existing Webflow-derived `WorkGrid` is retired once the poster wall replaces it. All decorative SVG is deterministic (SSR-stable), aria-hidden, and reduced-motion-aware. Display typography (Fraunces) is added via `next/font` but scoped to /arch via a CSS variable so the rest of the site is untouched.

**Tech Stack:** Next.js 16.2.1 (App Router), React 19, plain CSS modules, next/font, inline SVG. No new dependencies.

---

## Design language (translated from the moodbook)

The moodbook is NOT 1920s-ornament art deco — it's flat Matisse cut-outs, generative dot matrices, postmodern poster grids, chunky retro serifs, xerox grain, and vast cream negative space with one saturated plane per composition. Concretely:

| Moodbook signal | Design token / device |
|---|---|
| Cream ground everywhere (all 8 images) | `--paper #e9e0ce` becomes the DOMINANT surface on /arch; cobalt becomes shape, not field |
| Hard cobalt diagonal plane + tiny figure (collage images) | Hero composition: paper sheet cut by a cobalt diagonal, tiny scale-figure silhouette |
| Cobalt one-point perspective grid poster | `PerspectiveGrid` SVG band — literal architecture/drafting nod |
| Dot-matrix drape with single red thread | `DotField` generative SVG — nokta = dot; red thread = brand accent |
| FLOR chunky soft serif + spinning organic mark | Fraunces (variable: SOFT/WONK/opsz axes) as /arch display face |
| Tiny grotesk/mono captions (FLOR, ホログラム) | Space Mono micro-captions, already in the stack |
| Xerox grain | `.nk-grain` SVG-noise overlay utility, 2–3% opacity |
| Matisse cut-out figures | Scale-figure silhouette in hero; organic blob language already exists (Dot.tsx) |

**Colors:** existing tokens only — `--paper #e9e0ce`, `--ink #1a1a18`, arch cobalt `#4b5cbe`, nokta red `#b83636` (as the "thread" accent). No new colors.

**Page rhythm (top to bottom):**
1. `ArchHero` — poster 1: paper field, cobalt diagonal plane, huge Fraunces "nokta.arch.", mono caption, tiny figure at the diagonal's edge.
2. Intro lead (existing i18n copy) on paper.
3. `DotField` — poster 2: ink dot drape on paper with red center thread, as a section divider.
4. `PosterWall` — the six projects as an editorial poster wall (mixed widths, ghost numerals, rotated mono captions, Fraunces titles under true-color renders).
5. `PerspectiveGrid` — poster 3: full-bleed cobalt band, white grid receding to a vanishing point, drawn in on scroll; closing tagline + contact link.

**Deliberate decisions (flag to client if they disagree):**
- The page still FLOODS cobalt on tab click (system unchanged), but the content sits on a full-height paper sheet, so cream dominates and cobalt lives at the margins + in the planes. This preserves the active-tab/flood mechanic.
- Renders stay TRUE COLOR (they're the product; no duotone falsification). The poster treatment lives in the matting, typography, numerals, and captions around them.
- Fraunces is /arch-only for now (via `--display-font` consumed only by arch styles). If the client loves it, promoting it site-wide is a later one-liner.

---

## File structure

- Create: `components/arch/ArchHero.tsx` + `ArchHero.module.css` — hero poster (server component)
- Create: `components/arch/DotField.tsx` + `DotField.module.css` — deterministic generative dot drape (server component)
- Create: `components/arch/PerspectiveGrid.tsx` + `PerspectiveGrid.module.css` — cobalt grid band with scroll draw-in (client component, IntersectionObserver)
- Create: `components/arch/PosterWall.tsx` + `PosterWall.module.css` — project wall (server component)
- Modify: `app/arch/page.tsx` — compose the five sections
- Modify: `app/layout.tsx` — add Fraunces via next/font (variable `--font-fraunces`)
- Modify: `app/styles/tokens.css` — `--display-font` token
- Modify: `app/styles/base.css` — `.nk-grain` utility
- Modify: `messages/de.ts`, `messages/en.ts`, `messages/tr.ts`, `messages/ja.ts` — new `arch.*` keys
- Delete (Task 5): `components/WorkGrid.tsx`; prune `work_*`/`project-*` rules from `app/styles/arch.css` and `waarchi.css` if /arch was their last consumer (grep first — Carousel and project detail pages have their own classes)

Out of scope (follow-up plans): project detail pages (`/projekte/[slug]`), other branch pages, home page.

---

### Task 0: Foundation — Fraunces, display token, grain utility

**Files:**
- Modify: `app/layout.tsx` (font consts block)
- Modify: `app/styles/tokens.css`
- Modify: `app/styles/base.css`

- [ ] **Step 1: Add Fraunces to the next/font block in `app/layout.tsx`**

Below the existing `jost`/`spaceMono` consts (keep the house comment style):

```tsx
import { Jost, Space_Mono, Fraunces } from "next/font/google";

// Display face for the /arch poster redesign — variable font with the
// soft/wonk axes that give it the chunky retro-serif voice of the moodbook.
// Self-hosted like the others (GDPR: no runtime Google Fonts requests).
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
});
```

Add `fraunces.variable` to the `<html>` className list.

- [ ] **Step 2: Add the display token in `app/styles/tokens.css`**

```css
/* Display face — currently consumed only by the /arch poster styles. */
--display-font: var(--font-fraunces), Georgia, serif;
```

- [ ] **Step 3: Add the grain utility in `app/styles/base.css`**

```css
/* ── Xerox-grain overlay ─────────────────────────────────────────────
   Adds print texture to poster surfaces (moodbook: photocopy grain).
   Pure CSS overlay — an SVG feTurbulence noise tile as a data URI,
   so no network request and no JS. Apply to positioned containers. */
.nk-grain {
  position: relative;
}
.nk-grain::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 240px 240px;
}
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint`
Expected: build passes; lint shows only the 2 pre-existing problems (LanguageToggle, PunktEasterEgg).

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/styles/tokens.css app/styles/base.css
git commit  # "Add Fraunces display font and grain utility for /arch redesign" + standard footer
```

---

### Task 1: ArchHero — the diagonal-plane poster

**Files:**
- Create: `components/arch/ArchHero.tsx`
- Create: `components/arch/ArchHero.module.css`
- Modify: `app/arch/page.tsx`
- Modify: `messages/{de,en,tr,ja}.ts`

- [ ] **Step 1: Add i18n keys (German first, then en/tr/ja)**

```ts
// messages/de.ts
"arch.hero.caption": "architekturvisualisierung · düsseldorf",
"arch.hero.claim": "Räume, bevor es sie gibt.",
// en: "architectural visualization · düsseldorf" / "Spaces, before they exist."
// tr: "mimari görselleştirme · düsseldorf" / "Mekânlar, var olmadan önce."
// ja: "建築ビジュアライゼーション · デュッセルドルフ" / "まだ存在しない空間を。"
```

- [ ] **Step 2: Create `components/arch/ArchHero.tsx`**

```tsx
import { getT } from "@/lib/i18n";
import styles from "./ArchHero.module.css";

/* Poster 1 — vast paper field, one hard cobalt plane cutting the top-right
   corner (moodbook: collage with the tiny swimmer), the wordmark set huge in
   the display face, a Space Mono micro-caption, and a tiny scale figure
   standing at the plane's edge. The figure is a decorative inline SVG
   silhouette (aria-hidden) so we own the asset outright. */
export default async function ArchHero() {
  const t = await getT();
  return (
    <section className={`${styles.hero} nk-grain`}>
      {/* Cobalt plane — clip-path polygon, no image. */}
      <div className={styles.plane} aria-hidden="true" />
      {/* Tiny scale figure at the plane's edge. */}
      <svg
        className={styles.figure}
        viewBox="0 0 20 44"
        aria-hidden="true"
      >
        <path
          d="M10 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-4 10h8l2 14h-3v20h-3V28h-2v16H5V24H2l4-14Z"
          fill="var(--ink)"
        />
      </svg>
      <h1 className={styles.title}>
        nokta.arch<span className={styles.titleDot}>.</span>
      </h1>
      <p className={styles.caption}>{t("arch.hero.caption")}</p>
      <p className={styles.claim}>{t("arch.hero.claim")}</p>
    </section>
  );
}
```

- [ ] **Step 3: Create `components/arch/ArchHero.module.css`**

```css
/* Hero poster. The page body behind is flooded cobalt (--brand-bg); this
   section is the paper sheet, so cream dominates and the cobalt shows as
   the diagonal plane + the page margins around the sheet. */
.hero {
  position: relative;
  overflow: hidden;
  background: var(--paper);
  min-height: min(78svh, 820px);
  padding: clamp(3rem, 9svh, 6rem) clamp(20px, 5vw, 48px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* Hard-edged cobalt plane cutting the top-right corner (tunable). */
.plane {
  position: absolute;
  inset: 0;
  background: var(--brand-accent);
  clip-path: polygon(58% 0, 100% 0, 100% 52%);
}

/* Tiny scale figure standing near the plane's lower edge. */
.figure {
  position: absolute;
  top: 34%;
  right: 26%;
  width: clamp(10px, 1.2vw, 18px);
  height: auto;
}

.title {
  /* Display face: soft, slightly wonky, very heavy — the FLOR voice. */
  font-family: var(--display-font) !important;
  font-variation-settings: "SOFT" 80, "WONK" 1, "opsz" 144;
  font-weight: 900;
  font-size: clamp(3.2rem, 10vw, 9rem);
  line-height: 0.9;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 0;
  position: relative;
  max-width: 9ch;
}
.titleDot {
  color: var(--brand-accent);
}

.caption {
  font-family: var(--mono-font) !important;
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: lowercase;
  color: var(--ink);
  opacity: 0.7;
  margin: 1.2rem 0 0;
  position: relative;
}

.claim {
  font-size: clamp(1rem, 1.8vw, 1.3rem);
  color: var(--ink);
  opacity: 0.85;
  max-width: 34ch;
  line-height: 1.5;
  margin: 0.6rem 0 0;
  position: relative;
}

@media (max-width: 767px) {
  .hero { min-height: 64svh; }
  .plane { clip-path: polygon(40% 0, 100% 0, 100% 34%); }
  .figure { top: 22%; right: 30%; }
}
```

Note for the implementer: `* { font-family }` no longer exists (removed with mir.css), but Jost is set on `body` — the `!important` on `.title`/`.caption` is NOT needed; test without it first (class specificity beats body). Remove the `!important`s if plain rules win.

- [ ] **Step 4: Wire into `app/arch/page.tsx`** (replace the current `.nk-branch` header block with `<ArchHero />`; keep the lead paragraph — move `branch.arch.desc` into a paper intro block below the hero, styles in PosterWall task).

- [ ] **Step 5: Verify**

Run: `npm run build && npm start` then `curl -s localhost:3000/arch | grep -c "nokta.arch"`
Expected: build passes; hero markup present; visually check `http://localhost:3000/arch` if a browser is available.

- [ ] **Step 6: Commit**

```bash
git add components/arch/ app/arch/page.tsx messages/
git commit  # "Add /arch hero poster: paper field, cobalt plane, display type" + footer
```

---

### Task 2: DotField — generative dot drape

**Files:**
- Create: `components/arch/DotField.tsx`
- Create: `components/arch/DotField.module.css`
- Modify: `app/arch/page.tsx`

- [ ] **Step 1: Create `components/arch/DotField.tsx`**

Deterministic (seeded PRNG — Math.random would break SSR/hydration and reproducibility):

```tsx
import styles from "./DotField.module.css";

/* Poster 2 — a field of ink dots that hangs straight at the top and drapes
   into waves toward the bottom (moodbook: dot-matrix drape), with the center
   column set in the brand red as a single "thread". Deterministic: seeded
   mulberry32 PRNG, so the SVG is identical on every render (SSR-stable).
   ~1,100 dots ≈ 40 KB of SVG — acceptable for the one page that uses it. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLS = 56;
const ROWS = 20;
const W = 1120;
const H = 460;
const R = 3.4; // dot radius

export default function DotField() {
  const rand = mulberry32(9);
  const dots: { x: number; y: number; red: boolean }[] = [];
  const phase = Array.from({ length: COLS }, () => rand() * Math.PI * 2);
  const center = Math.floor(COLS / 2);
  for (let row = 0; row < ROWS; row++) {
    const depth = row / (ROWS - 1);           // 0 top → 1 bottom
    const sag = depth * depth;                // drape grows quadratically
    for (let col = 0; col < COLS; col++) {
      const x0 = (col + 0.5) * (W / COLS);
      const y0 = (row + 0.5) * (H / ROWS);
      const wave = Math.sin(x0 / 90 + phase[col] * 0.35) * 26 * sag;
      const fall = Math.cos(col / 3.1) * 18 * sag;
      dots.push({ x: x0 + wave * 0.3, y: y0 + wave + fall, red: col === center });
    }
  }
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg}>
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x.toFixed(1)}
            cy={d.y.toFixed(1)}
            r={R}
            fill={d.red ? "#b83636" : "var(--ink)"}
            opacity={d.red ? 0.9 : 0.82}
          />
        ))}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Create `DotField.module.css`**

```css
.wrap {
  background: var(--paper);
  padding: clamp(2rem, 6svh, 4rem) clamp(20px, 5vw, 48px) 0;
}
.svg {
  display: block;
  width: 100%;
  height: auto;
  max-width: 1100px;
  margin: 0 auto;
}
```

- [ ] **Step 3: Place `<DotField />` between the intro block and the poster wall in `app/arch/page.tsx`.**

- [ ] **Step 4: Verify** — `npm run build`; curl `/arch`, expect `<circle` count > 1000; confirm the served HTML is byte-identical across two curls (determinism).

- [ ] **Step 5: Commit** — "Add generative dot-drape divider to /arch" + footer.

---

### Task 3: PosterWall — the project wall

**Files:**
- Create: `components/arch/PosterWall.tsx`
- Create: `components/arch/PosterWall.module.css`
- Modify: `app/arch/page.tsx`
- Modify: `messages/{de,en,tr,ja}.ts`

- [ ] **Step 1: i18n keys**

```ts
// de
"arch.wall.label": "Ausgewählte Arbeiten",
"arch.wall.viewProject": "Projekt ansehen",
// en: "Selected work" / "View project" — tr: "Seçilmiş işler" / "Projeyi gör"
// ja: "選定作品" / "プロジェクトを見る"
```

- [ ] **Step 2: Create `components/arch/PosterWall.tsx`**

```tsx
import Link from "next/link";
import Image from "next/image";
import { PROJECTS } from "@/lib/projects";
import { getT } from "@/lib/i18n";
import styles from "./PosterWall.module.css";

/* Poster wall — each project is a matted "print": true-color render (the
   product is never tinted), Fraunces title below, Space Mono meta rotated
   along the side, a huge ghost numeral behind. Rows alternate wide/narrow
   (7/5 columns) for editorial rhythm instead of the old uniform squares. */
export default async function PosterWall() {
  const t = await getT();
  return (
    <section className={styles.wall}>
      <h2 className={styles.label}>{t("arch.wall.label")}</h2>
      <div className={styles.grid}>
        {PROJECTS.map((p, i) => (
          <Link
            key={p.slug}
            href={`/projekte/${p.slug}`}
            className={`${styles.poster} ${i % 4 === 1 || i % 4 === 2 ? styles.narrow : styles.wide}`}
          >
            <span className={styles.numeral} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={styles.meta}>
              {p.year} · {p.category}
            </span>
            <span className={styles.frame}>
              <Image
                src={p.thumb}
                alt={p.title}
                width={800}
                height={800}
                sizes="(max-width: 767px) 100vw, (min-width: 768px) 50vw"
                className={styles.img}
              />
            </span>
            <span className={styles.title}>
              {p.title}
              <span className={styles.dotAccent}>.</span>
            </span>
            <span className={styles.client}>
              {p.client === "Privatkunde" ? t("projects.client.private") : p.client}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `PosterWall.module.css`** (key rules; implementer tunes numbers against the real thumbs)

```css
.wall {
  background: var(--paper);
  padding: clamp(2rem, 6svh, 4rem) clamp(20px, 5vw, 48px) clamp(4rem, 10svh, 7rem);
  max-width: 1100px;
  margin: 0 auto;
}

.label {
  font-family: var(--mono-font);
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink);
  border-bottom: 1px solid var(--ink);
  padding-bottom: 0.9rem;
  margin: 0 0 3rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: 1.5rem;
  row-gap: clamp(3rem, 8svh, 5rem);
}

.poster {
  position: relative;
  display: block;
  text-decoration: none;
  color: var(--ink);
}
.wide   { grid-column: span 7; }
.narrow { grid-column: span 5; padding-top: clamp(2rem, 6svh, 4rem); } /* staggered baseline */

/* Ghost numeral behind the print (postmodern scale clash). */
.numeral {
  position: absolute;
  top: -0.35em;
  left: -0.05em;
  z-index: 0;
  font-family: var(--display-font);
  font-variation-settings: "SOFT" 80, "WONK" 1;
  font-weight: 900;
  font-size: clamp(4rem, 8vw, 7.5rem);
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--ink) 38%, transparent);
}

/* Rotated mono caption along the print's left edge. */
.meta {
  position: absolute;
  left: -1.6rem;
  bottom: 5.5rem;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-family: var(--mono-font);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.55;
}

.frame {
  position: relative;
  z-index: 1;
  display: block;
  outline: 1px solid var(--ink);
  overflow: hidden;
}
.img {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.6s ease;
}
.poster:hover .img { transform: scale(1.03); }

.title {
  position: relative;
  z-index: 1;
  display: block;
  font-family: var(--display-font);
  font-variation-settings: "SOFT" 80, "WONK" 1;
  font-weight: 700;
  font-size: clamp(1.4rem, 2.6vw, 2rem);
  line-height: 1.05;
  margin-top: 0.9rem;
}
.dotAccent { color: var(--brand-accent); }
.poster:hover .dotAccent { color: #b83636; } /* the red thread answers on hover */

.client {
  display: block;
  font-family: var(--mono-font);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.55;
  margin-top: 0.35rem;
}

@media (max-width: 767px) {
  .wide, .narrow { grid-column: span 12; padding-top: 0; }
  .meta { position: static; writing-mode: horizontal-tb; transform: none; display: block; margin-bottom: 0.5rem; }
}
```

- [ ] **Step 4: Replace `<WorkGrid />` with `<PosterWall />` in `app/arch/page.tsx`** (drop the `wa-grid-column` wrapper — PosterWall brings its own).

- [ ] **Step 5: Verify** — build + lint; curl `/arch`: six `/projekte/` links, no `work-section`; thumbs served via next/image srcset.

- [ ] **Step 6: Commit** — "Replace /arch work grid with editorial poster wall" + footer.

---

### Task 4: PerspectiveGrid — the cobalt closing band

**Files:**
- Create: `components/arch/PerspectiveGrid.tsx`
- Create: `components/arch/PerspectiveGrid.module.css`
- Modify: `app/arch/page.tsx`
- Modify: `messages/{de,en,tr,ja}.ts`

- [ ] **Step 1: i18n keys**

```ts
// de
"arch.grid.tagline": "Ihr Projekt, im Raum gedacht.",
"arch.grid.cta": "Projekt anfragen",
// en: "Your project, thought in space." / "Start a project"
// tr: "Projeniz, mekân olarak düşünüldü." / "Proje başlat"
// ja: "あなたのプロジェクトを、空間で考える。" / "プロジェクトの相談"
```

- [ ] **Step 2: Create `components/arch/PerspectiveGrid.tsx`**

Client component: builds the SVG lines deterministically, draws them in when scrolled into view (IntersectionObserver), skips animation under reduced motion.

```tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./PerspectiveGrid.module.css";

/* Poster 3 — full-bleed cobalt band with a white one-point-perspective floor
   grid (moodbook: the blue hologram poster; also literally an architect's
   perspective construction). Lines draw in once the band scrolls into view;
   under prefers-reduced-motion they render complete immediately. */
const W = 1600;
const H = 640;
const VPX = W / 2;   // vanishing point
const VPY = -140;
const HORIZON = 240; // y where the floor starts

function floorLines(): string[] {
  const d: string[] = [];
  // Receding verticals: fan out from the vanishing point through the bottom edge.
  for (let i = -10; i <= 10; i++) {
    const xb = VPX + i * 170;
    d.push(`M ${VPX} ${VPY} L ${xb} ${H}`);
  }
  // Horizontals: geometric spacing away from the horizon (perspective depth).
  let y = HORIZON, step = 14;
  while (y < H + 60) {
    d.push(`M 0 ${y.toFixed(1)} L ${W} ${y.toFixed(1)}`);
    step *= 1.38;
    y += step;
  }
  return d;
}

export default function PerspectiveGrid({
  tagline,
  cta,
}: {
  tagline: string;
  cta: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && (setDrawn(true), io.disconnect()),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const lines = floorLines();
  return (
    <div ref={ref} className={`${styles.band} nk-grain`}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} aria-hidden="true" preserveAspectRatio="xMidYMax slice">
        {lines.map((d, i) => (
          <path
            key={i}
            d={d}
            className={`${styles.line}${drawn ? " " + styles.lineDrawn : ""}`}
            style={{ transitionDelay: `${i * 28}ms` }}
          />
        ))}
      </svg>
      <div className={styles.content}>
        <p className={styles.tagline}>{tagline}</p>
        <Link href="/kontakt" className={styles.cta}>{cta}</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `PerspectiveGrid.module.css`**

```css
.band {
  position: relative;
  background: var(--brand-accent);
  overflow: hidden;
  min-height: clamp(340px, 52svh, 560px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.line {
  fill: none;
  stroke: var(--paper);
  stroke-width: 2;
  /* Draw-in: dashoffset sweep, staggered per line via inline delay. */
  stroke-dasharray: 1800;
  stroke-dashoffset: 1800;
  opacity: 0.9;
  transition: stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1);
}
.lineDrawn { stroke-dashoffset: 0; }

@media (prefers-reduced-motion: reduce) {
  .line { transition: none; stroke-dashoffset: 0; }
}

.content {
  position: relative;
  text-align: center;
  padding: clamp(3rem, 10svh, 6rem) clamp(20px, 5vw, 48px);
}
.tagline {
  font-family: var(--display-font);
  font-variation-settings: "SOFT" 80, "WONK" 1;
  font-weight: 700;
  font-size: clamp(1.8rem, 4.5vw, 3.4rem);
  color: var(--paper);
  margin: 0 0 1.6rem;
  text-shadow: 0 0 24px rgba(26, 26, 24, 0.25);
}
.cta {
  display: inline-block;
  font-family: var(--mono-font);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--paper);
  border: 1px solid var(--paper);
  padding: 12px 26px;
  text-decoration: none;
  transition: background-color 0.25s ease, color 0.25s ease;
}
.cta:hover { background: var(--paper); color: var(--brand-accent); }
```

- [ ] **Step 4: Add `<PerspectiveGrid tagline={t("arch.grid.tagline")} cta={t("arch.grid.cta")} />` as the last section in `app/arch/page.tsx`** (full-bleed: place it OUTSIDE the paper max-width column).

- [ ] **Step 5: Verify** — build; curl `/arch`: band markup + ~35 `<path` elements present; reduced-motion CSS block in built stylesheet.

- [ ] **Step 6: Commit** — "Add perspective-grid closing band to /arch" + footer.

---

### Task 5: Retire WorkGrid + prune dead Webflow CSS

**Files:**
- Delete: `components/WorkGrid.tsx`
- Modify: `app/styles/arch.css`, `app/styles/waarchi.css`, `app/styles/nokta.css` (`.wa-grid-column` if unused)

- [ ] **Step 1: Grep for remaining consumers**

Run: `grep -rn "WorkGrid\|work-section\|work_list\|work_item\|work-link\|work-project\|project-image-main\|project-card\|project-name" app/ components/ --include="*.tsx"`
Expected: zero hits after Task 3 (Carousel uses `carousel-*` classes — keep those; `wa-grid-column` may still be used by other routes — check before removing).

- [ ] **Step 2: Delete `components/WorkGrid.tsx`; remove the now-dead `work_*`/`project-*` rule blocks from `app/styles/arch.css` and the matching augmentation rules from `waarchi.css`, keeping the carousel rules.** Update both file header comments (provenance history stays, present-tense claims go).

- [ ] **Step 3: Verify** — `npm run build && npm run lint`; curl `/arch` and one `/projekte/[slug]` (detail pages have their own `wa-project-*` classes in nokta.css — must be unaffected).

- [ ] **Step 4: Commit** — "Retire WorkGrid and dead Webflow grid CSS" + footer.

---

### Task 6: Final QA sweep

- [ ] **Step 1: Full-page pass** — `npm start`; curl `/`, `/arch`, `/nokta`, `/line`, `/prozess`, `/kontakt`, one project page: all 200, no dead references.
- [ ] **Step 2: Check both language variants** (`de`, `en` cookie) render the new keys.
- [ ] **Step 3: Reduced-motion audit** — built CSS contains the PerspectiveGrid guard; DotField/hero are static (nothing to guard).
- [ ] **Step 4: Mobile audit** — hero clip-path, poster wall single-column stack, grid band legibility at 375px width.
- [ ] **Step 5: Lint + build one last time; commit any fixes; hand back for review + push.**

---

## Self-review notes

- Spec coverage: hero ✅ (Task 1), dot field ✅ (Task 2), poster wall ✅ (Task 3), perspective band ✅ (Task 4), grain+type foundation ✅ (Task 0), cleanup ✅ (Task 5), QA ✅ (Task 6).
- Types: `PROJECTS`/`Project` from `lib/projects.ts` used as-is; no schema changes. `PosterWall` uses `width/height` + `sizes` (thumbs are square 800×800 nominal — implementer must read real dimensions from `lib/mediaSizes.ts` if present there, else measure).
- Known judgment calls the implementer must NOT change without flagging: true-color renders, cobalt flood retained, Fraunces scoped to /arch.

# nokta-web — Handoff / Project Notes

Current as of **2026-07-31**, on `main`. The one-studio restructure and the
Kolonnade redesign that followed it are both merged; earlier states of this
file described a three-branch site (point / cube / line) and then a paper-ground
one. Both are gone — their history lives in git.

---

## 1. What this is

The website of **nokta** — a three-person design studio in Düsseldorf
(Kaan · Design & Konzept, Mohammed · 3D & Visualisierung, Mert · Layout &
Druck). *nokta* is Turkish for **dot**. Motto: **Vom Punkt über die Linie zur
Form.**

One studio, one body of work. The homepage is a numbered register — 01 the
claim, 02 three doors into the work, 03 four selected works — and the full
thirteen-work wall lives at `/arbeiten`. Every work has a detail page under
`/arbeiten/[slug]`. Modes of representation (Rendering, CAD-Druck, Editorial,
Studie, Handbuch) are **stamps on a piece and a filter over the whole — never
sections**. The wall stands on one of them at a time: there is no "Alle" chip,
because a rendering, a line print and a 216-page report are not one view.
Architecture leads by ratio and running order, not by a label.

Register rule for all copy, in every language: **say what it is, never why it
is allowed.** Facts, no defence, no superlatives, never "Student". Self-
initiated work is annotated `Eigenprojekt` and hangs as an equal.

Tech: **Next.js 16.2.1** (App Router, Turbopack), **React 19**, plain CSS
(tokens + CSS modules), TypeScript. Fonts self-hosted via `next/font`
(DM Sans for everything read, Syne for everything announced). There is no
third face: **nothing on the site is set in mono** — Space Mono used to carry
every folio, count, spec line and caption, and those lines now keep their
size, tracking and case in DM Sans. No other runtime dependencies — `three`
was dropped when the last WebGL plate was retired.

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
npx tsc --noEmit   # clean — there is no npm script for it
```

Requires Node 20+.

### Environment

The inquiry form is the site's only conversion path and it needs two variables
to work at all. Without them `/api/kontakt` answers **503** and the form shows
its error panel — by design, so an inquiry is refused honestly rather than
swallowed, but it means **an unconfigured deployment has no working contact
route**.

```bash
KONTAKT_API_KEY=...   # Resend API key
KONTAKT_FROM="nokta Website <formular@nokta-studio.de>"   # verified sender
KONTAKT_TO=...        # optional; defaults to hallo@nokta-studio.de
```

There is no `.env.example` in the repo — `.gitignore` excludes `.env*`.

---

## 3. Git state

- `main` = `origin/main`, and contains everything: the one-studio restructure,
  Kolonnade, and the audit fixes of 2026-07-28.
- `restructure/one-studio` is fully merged and spent. The two archive branches
  (`archive/one-studio-2026-07-24`, `archive/one-studio-failed`) are dead
  earlier attempts — don't build on them.
- `claude/upload-files-github-ry2uzv` is the one unmerged remote branch
  (a single commit adding dot-animation assets).
- Remote: `https://github.com/garpu-ng/nokta-web.git`.

---

## 4. Architecture

### The work model — `lib/works.ts` (single source of truth)
`Work = { slug, title, kind, year, client?, thumb, span, lift?, source }`.
`WORKS` is the **curated wall order** (architecture-led; the module throws at
import if three consecutive works share a kind or a slug repeats — a bad edit
fails the build). `kind` ∈ `rendering · cad · editorial · study · manual`,
with `drawing` / `collage` reserved in a comment for the academic material
that isn't compiled yet — adding a work is one entry here + a thumb + a
`lib/mediaSizes.ts` row, no layout change.
`source` points at `lib/projects.ts` (6 archviz projects), `lib/prints.ts`
(4 CAD prints, `paymentLink` still empty → buy button falls back to
`/kontakt`), or marks a bespoke piece (KI-Kommission report, n-Studie,
Leuchtturm). `client` absent ⇒ the UI annotates **Eigenprojekt**.

### Routes
| Route | What |
|---|---|
| `/` | teaser film → 01 statement + interference plate → 02 three doors → 03 two spreads + a pair + the way on → `HomeContact` |
| `/arbeiten` | the wall: one material at a time, `?kind=` (server-read, and kept in the URL as you click); no kind ⇒ the first in wall order. Two-up contact sheet, no "Alle" |
| `/arbeiten/[slug]` | one detail route for all 13: shared `ProjectHeader` + per-kind body — image stack (renderings), technical passport incl. price + buy (prints), `CaseStudy` (report), `ArtPlate` (n-Studie), `Leuchtturm` (manual) — + prev/next crossing kinds |
| `/studio` | hero, team (three drawn portraits; Kaan's is a hover-once CSS sprite reveal — see README), `ServiceIndex` (4 deliverable rows, the one paper section), CTA |
| `/kontakt` | `InquiryForm` + a rail carrying the direct address |
| `/impressum`, `/datenschutz` | **placeholder text, German only** — see §5 |
| `/punkt` | easter egg; its door is the red period of the footer wordmark |
| `/point` `/cube` `/line` `/arch` `/nokta` | `permanentRedirect("/")` |
| `/prozess`, `/prozess/3d` | `permanentRedirect("/studio")` |
| `/line/[slug]`, `/projekte/[slug]` | `permanentRedirect("/arbeiten/[slug]")` (same slugs) |
| `sitemap.ts` / `robots.ts` / `app/icon.png` | file-convention metadata routes |

### The annotation (brief-critical)
`workAnnotation()` in `components/work/WorkAnno.tsx` renders
`Kind · Jahr · Client-oder-Eigenprojekt` — the **identical** line on every
wall card and every detail header. Prints carry price **only** on their own
page. No price, no "kaufen", no cart on the wall.

### Colour & styling
`app/styles/tokens.css` holds the palette. Since Kolonnade the sheet is turned
over: the page is **ink** (`--ink #1a1a18`) and the type is **paper**
(`--paper #e9e0ce`). Paper survives as a *field* for the one section still
printed the old way round (the Leistungen register on `/studio`, and the
`CaseStudy` body). `--accent #b83636` is the studio's red: a mark — a dot, a
folio, a closing period — and at most **one field per page**.

Two further tokens exist because the mark red cannot set words:
`--accent-on-ink #d16161` (4.64:1) and `--accent-on-paper #ae3232` (4.85:1).
`--accent` itself is 3.00:1 on ink and 4.43:1 on paper — fine for a mark or
large display type, under AA the moment it sets an 11px line. **Use `--accent`
for marks, the two tints for words.**

`lib/colors.ts` carries the same three core values as literals for code that
needs them (OG cards, inline SVG) — keep them in sync. `KIND_FIELD` there
holds the three door colours, deliberately darkened so 16px paper copy clears
4.5:1 on them; they land at 4.51–4.56, which leaves **no room for opacity** on
anything set on a door.

`globals.css` imports `tokens.css` → `base.css` (reset, `.nk-caption`,
`.nk-chip`, `.nk-sr-only`, `.nk-grain`, `.nk-page-fade`, the focus ring,
`.nk-skip`) → `nokta.css` (page layouts). Components carry colocated
`*.module.css`. `.nk-chip` is the one chip the site has — the material filter
on `/arbeiten` and the subject row on `/kontakt` are the same object, hairline
outline with a creme fill on the chosen one.

### Motion
`components/Reveal.tsx` is the one entrance primitive, and its contract
matters: children render **finished**, JS arms a pre-state only for boxes
below the fold at mount, an IntersectionObserver plays it once, and
`prefers-reduced-motion` skips the whole thing. Nothing is ever hidden by
markup that JS might fail to un-hide.

The generative plates (`InterferenceField`, `DiscField`, `RidgeField`) all run
through `components/nokta/plate/mountPlate.ts`, which owns the backing store,
the resize, the visibility-gated loop, **one static frame under
prefers-reduced-motion**, and teardown. A plate only supplies `resize()` and
`draw(t)`.

### i18n
Cookie-based (`nk_lang`), German is the source: `messages/{de,en,tr,ja}.ts`,
flat keys, **177 keys per locale**. The lookup falls back en→de→key, so a
missing key renders visibly as the key.
`getT()` in `lib/i18n.ts` is server-only; client components receive
pre-translated strings as props.

> **There is no parity script.** Earlier versions of this file called one "the
> gate"; it has never existed in git history. Parity is currently exact, and
> it is maintained by hand. This one-liner checks it:
>
> ```bash
> node -e 'const f=require("fs");const k=n=>new Set([...f.readFileSync(`messages/${n}.ts`,"utf8").matchAll(/^\s{2}"([^"]+)":/gm)].map(m=>m[1]));const de=k("de");for(const l of ["en","tr","ja"]){const o=k(l);const miss=[...de].filter(x=>!o.has(x)),ext=[...o].filter(x=>!de.has(x));console.log(l,o.size,miss.length||ext.length?{miss,ext}:"ok")}'
> ```

There are **no `{point}/{line}/{form}` motto tokens** — earlier notes described
a template `app/page.tsx` split on. It does not exist and never runs; the motto
is passed whole. The only templated key is `home.selected.all`, carrying
`{count}`.

### Social cards
`lib/socialMeta.ts` (metadata merges shallowly in Next — always compose
through it) + `lib/og.tsx` render the root card; work detail pages override
`openGraph.images` with the work's thumb.

---

## 5. Open work

**Blocking a real launch:**

- [ ] **Impressum + Datenschutz are literal placeholders.** `[Vorname
      Nachname]`, `[Straße Hausnummer]`, `[PLZ Ort]`, `Telefon: [Nummer]`,
      `[Name, Anschrift]` — both pages render square brackets and then admit
      it in visible German. § 5 DDG makes the Impressum mandatory; this is
      direct Abmahnung exposure. Both pages are also hardcoded German with no
      `t()` calls, so they serve German under `<html lang="ja">`.
- [ ] **`USt-IdNr.: auf Anfrage`** (`kontakt.addr.vat`, all four locales) —
      state the number or delete the line.
- [ ] **Contact mailbox** — `hallo@nokta-studio.de` is unified everywhere but
      the mailbox itself still has to be registered.
- [ ] **`KONTAKT_API_KEY` / `KONTAKT_FROM`** — unset, so the form 503s. See §2.
- [ ] **Vercel + domain** — repo not connected; `metadataBase` is
      `https://www.nokta-studio.de`.

**Known gaps:**

- [ ] **No hreflang, no locale URLs.** i18n is cookie-only and the sitemap
      lists 20 German-only URLs, so a crawler — which carries no cookie — only
      ever indexes German. The EN/TR/JA translations are complete and
      unreachable from search. Architectural: it needs locale paths.
- [ ] **Nothing is CDN-cacheable.** `getLocale()` reads `cookies()` in the root
      layout, so all content routes render dynamically and
      `generateStaticParams` in `app/arbeiten/[slug]` is inert.
- [ ] **No CTA on work detail pages.** `HomeContact` renders on the homepage
      only; a rendering's detail page — the page that convinces an
      Architekturbüro — ends in prev/next.
- [ ] **Stripe links** — paste the 100-€ Payment Link URLs into `paymentLink`
      in `lib/prints.ts`; each print goes live the moment its URL is set, no
      code change. Until then the button says "Bestellen" and opens the generic
      inquiry form, which orders nothing.
- [ ] **Social links** — footer Instagram/LinkedIn/Behance are `#`.
- [x] **Mert's portrait** — done. All three cards carry a drawn portrait from
      `public/team/`; the waiting plate and the two flying-head clips are gone.
- [x] **The homepage crops portrait work** — fixed. `.plate` used to be a fixed
      560px landscape window with `object-fit: cover`. It now cuts every plate
      to its work's own ratio (`aspect-ratio: var(--nk-ratio)`, `contain`), the
      same thing the `/arbeiten` wall does; nothing on the homepage is cropped.
- [ ] **Paper on the red field is 4.43:1** — the contact band's body copy and
      both CTA buttons ("Schreib uns", "Anfrage senden") sit just under AA.
      Deepening `--accent` to `#ae3232` fixes all three at once and is a
      one-token change, but it alters the studio red on its largest surface —
      a design decision, deliberately left open.
- [ ] **~1 MB of orphaned assets** under `public/prozess/` (the route is a
      redirect), plus byte-identical duplicates: `01.jpg` == `thumb.jpg` in
      beatbuilding, sanktgores and ipehouse.
- [ ] **OG display font** — generated cards render in `next/og`'s default face,
      not Syne (would need shipping woff binaries).
- [ ] **The academic slot** — when the floor plans / isometrics / collages are
      compiled, add them as `drawing` / `collage` works in `lib/works.ts`.

---

## 6. Related

- **This repo:** `github.com/garpu-ng/nokta-web`
- **waarchi (frozen; the archviz work's previous home):**
  `github.com/garpu-ng/waarchi-revamp` — still deployed on Vercel
  (`waarchi.kaanmaan.cv`); local Linux backups in `/home/kaan/backups/`.

// The one body of work — the single curated source for the wall on the home
// page and for every detail page under /arbeiten/[slug].
//
// Architecture leads by ratio and by running order. The modes of representation
// (rendering, CAD print, editorial, study, manual) are stamps and a filter,
// never sections: the order below deliberately alternates them.
//
// Adding a work is one entry here + one thumbnail + one row in
// lib/mediaSizes.ts. No layout change is needed.

import { PROJECTS, type Project } from "./projects";
import { PRINTS, type Print } from "./prints";

export type WorkKind =
  | "rendering" // archviz
  | "cad" // CAD line prints (for sale)
  | "editorial" // editorial / layout / prepress
  | "study" // self-initiated studies
  | "manual"; // in-house manuals
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
  /** vertical drop (rem) on the desktop wall — the works hang at varied
      heights like sheets pinned by hand; the phone column ignores it */
  lift?: number;
  /** where the detail body comes from */
  source:
    | { type: "project"; project: Project }
    | { type: "print"; print: Print }
    | { type: "piece" }; // editorial / study / manual — bespoke detail bodies
};

/** The year the print series was drawn and published. A print's annotation
    carries this, not the building's completion year — that one stays a passport
    fact on the print's own detail page. */
const PRINT_EDITION_YEAR = "2025";

function fromProject(slug: string, span: Work["span"], lift?: number): Work {
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) throw new Error(`works.ts: no project "${slug}" in lib/projects.ts`);
  return {
    slug: project.slug,
    title: project.title,
    kind: "rendering",
    year: project.year,
    client: project.client,
    thumb: project.thumb,
    span,
    lift,
    source: { type: "project", project },
  };
}

function fromPrint(slug: string, span: Work["span"], lift?: number): Work {
  const print = PRINTS.find((p) => p.slug === slug);
  if (!print) throw new Error(`works.ts: no print "${slug}" in lib/prints.ts`);
  return {
    slug: print.slug,
    title: print.title,
    kind: "cad",
    year: PRINT_EDITION_YEAR,
    // No client: the edition is the studio's own work → annotated "Eigenprojekt".
    thumb: print.image,
    span,
    lift,
    source: { type: "print", print },
  };
}

/* The wall, in reading order. Spans are 12-col grid widths on desktop; the
   phone renders one column and ignores them. Widths follow the thumbnails'
   ratios — the two near-square archviz thumbs (teahouse 1415×1415, binome
   1150×1281) carry a column more than the plan's baseline so they hold their
   own beside the tall portrait sheets, and the four CAD prints stand at span 4
   so the drawings read (velostation gives up its width to close the final
   4+4+4 row). Lifts hang the sheets at varied heights (hand-pinned, not a
   rigid grid); tune them per row-neighbour so no two adjacent tops align. */
export const WORKS: Work[] = [
  fromProject("sanktgores", 7, 0),
  {
    slug: "abschlussbericht-ki-kommission",
    title: "Abschlussbericht KI-Kommission",
    kind: "editorial",
    year: "2026",
    client: "BMWE",
    thumb: "/point/abschlussbericht/cover.webp",
    span: 5,
    lift: 3.5,
    source: { type: "piece" },
  },
  fromProject("teahouse", 6, 0),
  fromPrint("eiffel", 4, 4.5),
  fromProject("beatbuilding", 7, 2),
  {
    slug: "n-studie",
    title: "n-Studie",
    kind: "study",
    year: "2025",
    thumb: "/point/n-study.png",
    span: 4,
    lift: 0,
    source: { type: "piece" },
  },
  fromProject("binome", 7, 0),
  fromPrint("chrysler", 4, 5.5),
  fromProject("ipehouse", 7, 1.5),
  {
    slug: "leuchtturm",
    title: "Leuchtturm",
    kind: "manual",
    year: "2025",
    thumb: "/point/leuchtturm-cover.webp",
    span: 4,
    lift: 4,
    source: { type: "piece" },
  },
  fromPrint("empire-state", 4, 0),
  fromProject("velostation", 4, 3),
  fromPrint("osaka", 4, 6),
];

/** The five kinds, as a runtime set — the type alone cannot be checked
    against a URL. Used to decide whether /arbeiten?kind=… named a real
    material before it is handed to the wall as a filter. */
const KINDS = new Set<string>([
  "rendering",
  "cad",
  "editorial",
  "study",
  "manual",
]);

export function isWorkKind(value: unknown): value is WorkKind {
  return typeof value === "string" && KINDS.has(value);
}

export function getWork(slug: string): Work | undefined {
  return WORKS.find((w) => w.slug === slug);
}

/** The neighbours of a work in the curated order — deliberately crossing kinds.
    No wrap-around: the first work has no `prev`, the last no `next`. */
export function prevNext(slug: string): { prev?: Work; next?: Work } {
  const i = WORKS.findIndex((w) => w.slug === slug);
  if (i < 0) return {};
  return {
    prev: i > 0 ? WORKS[i - 1] : undefined,
    next: i < WORKS.length - 1 ? WORKS[i + 1] : undefined,
  };
}

/* ── Curation guards ──────────────────────────────────────────────────
   Plain module-level code: it runs the moment anything imports the wall, so a
   bad edit fails the build instead of quietly breaking the running order. */
const seen = new Set<string>();
for (const work of WORKS) {
  if (seen.has(work.slug)) throw new Error(`works.ts: duplicate slug "${work.slug}"`);
  seen.add(work.slug);
}
for (let i = 2; i < WORKS.length; i++) {
  if (WORKS[i].kind === WORKS[i - 1].kind && WORKS[i].kind === WORKS[i - 2].kind) {
    throw new Error(
      `works.ts: three "${WORKS[i].kind}" works in a row at "${WORKS[i].slug}" — ` +
        "the wall must never read as a section",
    );
  }
}

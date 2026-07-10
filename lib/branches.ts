// The three disciplines of nokta. Everything (header tabs, theming, landing
// cards) is derived from this list so a branch is defined in exactly one place.

export type BranchKey = "home" | "nokta" | "arch" | "line";

export type Branch = {
  key: BranchKey;
  /** wordmark shown in the header tab + landing, e.g. "arch" */
  label: string;
  /** full route */
  path: string;
  /** one-line discipline */
  tagline: string;
  /** short description for the landing card */
  desc: string;
  /** deep "motto" colour — used for the tab, active state, buttons, accents */
  accent: string;
  /** muted page wash for this branch (matches the CSS [data-branch] value) */
  bg: string;
};

export const BRANCHES: Branch[] = [
  {
    key: "nokta",
    label: "nokta",
    path: "/nokta",
    tagline: "Layout · Design · Druck",
    desc:
      "Branding, Editorial, Layout und Druck. Mit eigenen Tools testen wir schnell viele Richtungen und finden das, was sitzt.",
    accent: "#904422", // red
    bg: "#904422",
  },
  {
    key: "arch",
    label: "arch",
    path: "/arch",
    tagline: "Architekturvisualisierung",
    desc:
      "Fotorealistische 3D-Renderings für Architekten, Bauträger und Privatpersonen. Mit eigenem Setup kommen wir schnell zu vielen Varianten.",
    accent: "#384ed1", // blue
    bg: "#384ed1",
  },
  {
    key: "line",
    label: "line",
    path: "/line",
    tagline: "2D · Vektor · CAD-Kunstdrucke",
    desc:
      "Ikonische Bauwerke als CAD-Liniendruck. Aus echten Zeichnungen vektorisiert, in A1 gedruckt und gerahmt.",
    accent: "#5f744e", // green
    bg: "#5f744e",
  },
];

export const BRANCH_BY_KEY = Object.fromEntries(
  BRANCHES.map((b) => [b.key, b]),
) as Record<BranchKey, Branch>;

/** The home tab — black, lives at "/". Not a discipline, so it's kept out of
    BRANCHES (which drives the landing cards) but sits first in the tab bar. */
export const HOME_TAB: Branch = {
  key: "home",
  label: "home",
  path: "/",
  tagline: "Übersicht",
  desc: "",
  accent: "#1a1a18",
  bg: "#1a1a18",
};

/** Everything shown in the top tab bar, in order. */
export const TABS: Branch[] = [HOME_TAB, ...BRANCHES];

/** Map any pathname to the branch that owns it (or null for a neutral page). */
export function branchForPath(pathname: string): BranchKey | null {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/nokta")) return "nokta";
  if (pathname.startsWith("/line")) return "line";
  // arch owns its own route plus the ported archviz project + process pages
  if (
    pathname.startsWith("/arch") ||
    pathname.startsWith("/projekte") ||
    pathname.startsWith("/prozess")
  )
    return "arch";
  // studio / kontakt are studio-wide → keep the neutral core theme
  return null;
}

/** Paper (warm off-white cream) and ink (near-black) — the two text colours we
    flip between so labels stay legible on any fill. Keep in sync with tokens.css. */
export const PAPER = "#e8ded3";
export const INK = "#1a1a18";

/** Pick the legible text colour for a given background fill: ink on light
    fills, paper on dark ones (WCAG relative luminance, threshold ~0.25). Used
    so the tab labels and landing-card hovers read on any palette. */
export function inkOn(hex: string): string {
  const h = hex.replace("#", "");
  const toLin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const r = toLin(parseInt(h.slice(0, 2), 16) / 255);
  const g = toLin(parseInt(h.slice(2, 4), 16) / 255);
  const b = toLin(parseInt(h.slice(4, 6), 16) / 255);
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.25 ? INK : PAPER;
}

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
      "Von der ersten Skizze bis zur Druckvorlage — Branding, Editorial und Layout mit Sinn für Komposition.",
    accent: "#ae6a4e", // clay
    bg: "#ae6a4e",
  },
  {
    key: "arch",
    label: "arch",
    path: "/arch",
    tagline: "Architekturvisualisierung",
    desc:
      "Fotorealistische 3D-Renderings für Architekten, Bauträger und Privatpersonen aus NRW.",
    accent: "#5c6e82", // slate blue
    bg: "#5c6e82",
  },
  {
    key: "line",
    label: "line",
    path: "/line",
    tagline: "2D · Vektor · CAD-Kunstdrucke",
    desc:
      "Technische Zeichnungen als Kunst — gerahmte CAD-Liniendrucke ikonischer Bauwerke.",
    accent: "#6e7a54", // drafting green
    bg: "#6e7a54",
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

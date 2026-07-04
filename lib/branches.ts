// The three disciplines of nokta. Everything (header tabs, theming, landing
// cards) is derived from this list so a branch is defined in exactly one place.

export type BranchKey = "nokta" | "arch" | "line";

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
  /** deep "motto" colour — used for the dot, active tab, buttons, accents */
  accent: string;
};

export const BRANCHES: Branch[] = [
  {
    key: "nokta",
    label: "nokta",
    path: "/nokta",
    tagline: "Layout · Design · Druck",
    desc:
      "Von der ersten Skizze bis zur Druckvorlage — Branding, Editorial und Layout mit Sinn für Komposition.",
    accent: "#B0664A", // clay
  },
  {
    key: "arch",
    label: "arch",
    path: "/arch",
    tagline: "Architekturvisualisierung",
    desc:
      "Fotorealistische 3D-Renderings für Architekten, Bauträger und Privatpersonen aus NRW.",
    accent: "#4E6076", // slate blue
  },
  {
    key: "line",
    label: "line",
    path: "/line",
    tagline: "2D · Vektor · CAD-Kunstdrucke",
    desc:
      "Technische Zeichnungen als Kunst — gerahmte CAD-Liniendrucke ikonischer Bauwerke.",
    accent: "#5E6B4E", // drafting green
  },
];

export const BRANCH_BY_KEY = Object.fromEntries(
  BRANCHES.map((b) => [b.key, b]),
) as Record<BranchKey, Branch>;

/** Map any pathname to the branch that owns it (or null for the core landing). */
export function branchForPath(pathname: string): BranchKey | null {
  if (pathname === "/") return null;
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

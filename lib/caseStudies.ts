// Two applications of visualisations that already exist. Each page says how
// the images can be used. It does not say a client used them that way, and it
// does not name a client.
//
// sanktgores: a pale-brick house in NRW, 2024, six images, five exterior and
// one interior. That is the housing project for the developer page (exposé
// and sales, while there are only plans).
// velostation: a timber bicycle station, 2022, two interiors. It is the one
// public building in the set, so it carries the page for architecture
// practices (competitions and planning submissions). No project text calls
// itself a competition.

import { PROJECTS, type Project } from "./projects";

/** Who the page speaks to. The copy lives under `case.<audience>.*`. */
export type CaseAudience = "bt" | "arch";

export type CaseStudy = {
  slug: string;
  audience: CaseAudience;
  /** Text link on /arbeiten. No image, so the wall stays as it is. */
  arbeitenKey: string;
  /** The audience page that already exists. */
  audienceHref: string;
  audienceLabelKey: string;
  project: Project;
};

const DEFINITIONS: {
  slug: string;
  audience: CaseAudience;
  arbeitenKey: string;
  audienceHref: string;
  audienceLabelKey: string;
}[] = [
  {
    slug: "sanktgores",
    audience: "bt",
    arbeitenKey: "arbeiten.case.bt",
    audienceHref: "/fuer-bautraeger",
    audienceLabelKey: "bt.heading",
  },
  {
    slug: "velostation",
    audience: "arch",
    arbeitenKey: "arbeiten.case.arch",
    audienceHref: "/3d-visualisierung",
    audienceLabelKey: "viz.heading",
  },
];

export const CASE_STUDIES: CaseStudy[] = DEFINITIONS.map((def) => {
  const project = PROJECTS.find((item) => item.slug === def.slug);
  if (!project) throw new Error(`caseStudies.ts: no project "${def.slug}"`);
  return { ...def, project };
});

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((item) => item.slug === slug);
}

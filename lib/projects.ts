// The archviz projects: slugs, clients, and the image stacks their detail
// pages render. Wall placement (span/lift) is curated in lib/works.ts, and the
// reader-facing descriptions are locale copy (messages/*, projects.desc.*) —
// neither belongs to this record.
export type Project = {
  slug: string;
  title: string;
  client: string;
  year: string;
  thumb: string;
  images: string[];
};

export const PROJECTS: Project[] = [
  {
    slug: "sanktgores",
    title: "Sanktgores Residence",
    client: "Privatkunde",
    year: "2024",
    thumb: "/projects/sanktgores/thumb.jpg",
    images: [
      "/projects/sanktgores/01.jpg",
      "/projects/sanktgores/02.jpg",
      "/projects/sanktgores/03.jpg",
      "/projects/sanktgores/04.jpg",
      "/projects/sanktgores/05.jpg",
      "/projects/sanktgores/06.jpg",
    ],
  },
  {
    slug: "teahouse",
    title: "Teahouse",
    client: "Privatkunde",
    year: "2024",
    thumb: "/projects/teahouse/thumb.jpg",
    images: [
      "/projects/teahouse/01.jpg",
      "/projects/teahouse/02.jpg",
      "/projects/teahouse/03.jpg",
      "/projects/teahouse/04.jpg",
      "/projects/teahouse/05.jpg",
      "/projects/teahouse/06.jpg",
      "/projects/teahouse/07.jpg",
    ],
  },
  {
    slug: "beatbuilding",
    title: "Beat Building",
    client: "Architekturbüro",
    year: "2023",
    thumb: "/projects/beatbuilding/thumb.jpg",
    images: [
      "/projects/beatbuilding/01.jpg",
      "/projects/beatbuilding/02.jpg",
      "/projects/beatbuilding/03.jpg",
      "/projects/beatbuilding/04.jpg",
    ],
  },
  {
    slug: "binome",
    title: "Binome",
    client: "Binome Architekten",
    year: "2023",
    thumb: "/projects/binome/thumb.jpg",
    images: [
      "/projects/binome/01.jpg",
      "/projects/binome/02.jpg",
      "/projects/binome/03.jpg",
      "/projects/binome/04.jpg",
      "/projects/binome/05.jpg",
      "/projects/binome/06.jpg",
    ],
  },
  {
    slug: "ipehouse",
    title: "IPE House",
    client: "Privatkunde",
    year: "2023",
    thumb: "/projects/ipehouse/thumb.jpg",
    images: [
      "/projects/ipehouse/01.jpg",
      "/projects/ipehouse/02.jpg",
      "/projects/ipehouse/03.jpg",
      "/projects/ipehouse/04.jpg",
    ],
  },
  {
    slug: "velostation",
    title: "Velostation",
    client: "Stadtplanung NRW",
    year: "2022",
    thumb: "/projects/velostation/thumb.jpg",
    images: [
      "/projects/velostation/01.jpg",
      "/projects/velostation/02.jpg",
    ],
  },
];

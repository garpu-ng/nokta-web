export type Project = {
  slug: string;
  title: string;
  client: string;
  year: string;
  category: string;
  description: string;
  thumb: string;
  images: string[];
  span: 3 | 4 | 6 | 12; // grid-column span in 12-col grid
};

export const PROJECTS: Project[] = [
  {
    slug: "sanktgores",
    title: "Sanktgores Residence",
    client: "Privatkunde",
    year: "2024",
    category: "Wohnbau",
    description: "Fotorealistische Außenvisualisierung eines modernen Einfamilienhauses in NRW.",
    thumb: "/projects/sanktgores/thumb.jpg",
    span: 6,
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
    category: "Gartenarchitektur",
    description: "Stimmungsvolle Visualisierung eines japanisch inspirierten Teehauses.",
    thumb: "/projects/teahouse/thumb.jpg",
    span: 6,
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
    category: "Gewerbebau",
    description: "Visualisierung eines urbanen Kulturgebäudes mit markanter Fassade.",
    thumb: "/projects/beatbuilding/thumb.jpg",
    span: 6,
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
    category: "Wohnbau",
    description: "Innen- und Außenvisualisierung eines minimalistischen Wohnprojekts.",
    thumb: "/projects/binome/thumb.jpg",
    span: 6,
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
    category: "Wohnbau",
    description: "Elegante Visualisierung eines modernen Hauses mit Ipe-Holzfassade.",
    thumb: "/projects/ipehouse/thumb.jpg",
    span: 6,
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
    category: "Infrastruktur",
    description: "Architekturvisualisierung einer modernen Fahrradstation im urbanen Raum.",
    thumb: "/projects/velostation/thumb.jpg",
    span: 6,
    images: [
      "/projects/velostation/01.jpg",
      "/projects/velostation/02.jpg",
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

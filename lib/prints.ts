// nokta.line catalogue — framed CAD line-art prints of iconic buildings.
// Display artwork lives in /public/line/<slug>.webp (a screen-resolution
// preview on white paper — the print-ready vector master is kept out of the
// public bundle since the prints are a paid product). Metadata
// (year/architect/coordinates) mirrors the title block drawn on each print.

export type Print = {
  slug: string;
  title: string;
  /** city, shown as the subtitle */
  subtitle: string;
  /** year the building was completed */
  year: number;
  architect: string;
  /** coordinates as engraved on the print */
  coordinates: string;
  /** price in EUR */
  price: number;
  /** display artwork (webp, white paper) under /public */
  image: string;
};

export const PRINTS: Print[] = [
  {
    slug: "eiffel",
    title: "Tour Eiffel",
    subtitle: "Paris",
    year: 1889,
    architect: "Gustave Eiffel",
    coordinates: "48° 51 30 N · 2° 17 40 O",
    price: 100,
    image: "/line/eiffel.webp",
  },
  {
    slug: "chrysler",
    title: "Chrysler Building",
    subtitle: "New York",
    year: 1930,
    architect: "William Van Alen",
    coordinates: "40° 45 5.78 N · 73° 58 31.27 W",
    price: 100,
    image: "/line/chrysler.webp",
  },
  {
    slug: "empire-state",
    title: "Empire State Building",
    subtitle: "New York",
    year: 1931,
    architect: "Shreve, Lamb & Harmon",
    coordinates: "40° 44 54 N · 73° 59 09 W",
    price: 100,
    image: "/line/empire-state.webp",
  },
  {
    slug: "osaka",
    title: "Ōsaka-jō",
    subtitle: "Osaka",
    year: 1583,
    architect: "Toyotomi Hideyoshi",
    coordinates: "34° 41 14 N · 135° 31 33 O",
    price: 100,
    image: "/line/osaka.webp",
  },
];

export function getPrint(slug: string): Print | undefined {
  return PRINTS.find((p) => p.slug === slug);
}

// nokta.line catalogue. Placeholder set — swap titles/prices freely and drop
// real line-art files into /public/line/<slug>.svg (or .png) when ready.

export type Print = {
  slug: string;
  title: string;
  subtitle: string;
  /** price in EUR */
  price: number;
  /** optional artwork path under /public; falls back to a drafting placeholder */
  image?: string;
};

export const PRINTS: Print[] = [
  { slug: "eiffel", title: "Tour Eiffel", subtitle: "Paris", price: 100 },
  { slug: "empire-state", title: "Empire State Building", subtitle: "New York", price: 100 },
  { slug: "brooklyn-bridge", title: "Brooklyn Bridge", subtitle: "New York", price: 100 },
  { slug: "colosseo", title: "Colosseo", subtitle: "Roma", price: 100 },
];

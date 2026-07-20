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
  /**
   * Stripe Payment Link for this print's checkout.
   *
   * These are fixed-price (100 €) Payment Links created by hand in the Stripe
   * dashboard (Products → Payment Links) — no backend, no webhook, no server
   * route. Paste the generated `https://buy.stripe.com/…` URL here to take a
   * print live; leave it `undefined` while no link exists yet.
   *
   * When set, the detail page's buy button becomes a real external checkout
   * link ("kaufen · 100 €"); when `undefined` it falls back to the /kontakt
   * inquiry route ("Bestellen"). So the shop goes live by pasting four URLs —
   * no code change required.
   */
  paymentLink?: string;
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
    paymentLink: undefined, // paste the Stripe Payment Link to go live
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
    paymentLink: undefined, // paste the Stripe Payment Link to go live
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
    paymentLink: undefined, // paste the Stripe Payment Link to go live
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
    paymentLink: undefined, // paste the Stripe Payment Link to go live
  },
];

export function getPrint(slug: string): Print | undefined {
  return PRINTS.find((p) => p.slug === slug);
}

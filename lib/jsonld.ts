// schema.org nodes for the pages that already describe the studio, a service,
// or a work. Strings come from the same messages the page renders. Nothing
// here is a second address, a client name, or a profile the site does not link.

import type { Locale } from "@/lib/locales";
import { LOCALES } from "@/lib/locales";

export const SITE = "https://www.nokta-studio.de";

/** Stable id of the ProfessionalService in the root layout. */
export const STUDIO_ID = `${SITE}/#studio`;

/** The studio works from NRW. One state, no city. */
export const AREA_NRW = {
  "@type": "State",
  name: "Nordrhein-Westfalen",
};

const LANGUAGES: Locale[] = [...LOCALES];

/** Document titles end with the site name. The service type is the rest. */
export function titleWithoutSite(title: string): string {
  const suffix = " · nokta";
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title;
}

export function studioJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": STUDIO_ID,
    name: "nokta",
    url: SITE,
    description,
    image: `${SITE}/opengraph-image`,
    logo: `${SITE}/nokta_logo.png`,
    email: "hallo@nokta-studio.de",
    inLanguage: LANGUAGES,
    availableLanguage: LANGUAGES,
    // Region and country only. The Impressum keeps the legal street address.
    address: {
      "@type": "PostalAddress",
      addressRegion: "NRW",
      addressCountry: "DE",
    },
    areaServed: AREA_NRW,
    knowsAbout: [
      "3D-Visualisierung",
      "Architekturvisualisierung",
      "Editorial und Satz",
      "Druckproduktion",
      "CAD-Pläne",
    ],
  };
}

export function serviceJsonLd(opts: {
  path: string;
  name: string;
  description: string;
  serviceType: string;
  inLanguage: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE}${opts.path}#service`,
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    url: `${SITE}${opts.path}`,
    inLanguage: opts.inLanguage,
    provider: { "@id": STUDIO_ID },
    areaServed: AREA_NRW,
  };
}

export function faqPageJsonLd(
  path: string,
  items: readonly { q: string; a: string }[],
  inLanguage: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE}${path}#faq`,
    inLanguage,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function creativeWorkJsonLd(opts: {
  path: string;
  name: string;
  description: string;
  imagePath: string;
  inLanguage: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: opts.name,
    description: opts.description,
    image: opts.imagePath.startsWith("http")
      ? opts.imagePath
      : `${SITE}${opts.imagePath}`,
    url: `${SITE}${opts.path}`,
    inLanguage: opts.inLanguage,
    creator: { "@id": STUDIO_ID },
  };
}

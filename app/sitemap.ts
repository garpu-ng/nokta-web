import type { MetadataRoute } from "next";
import { WORKS } from "@/lib/works";

// One URL per page that exists: the wall, the thirteen works, the studio pages
// and the legal pages. The legacy paths 308-redirect and stay out — including
// /prozess/3d, which folded into /prozess with Kolonnade.
const BASE = "https://www.nokta-studio.de";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/` },
    ...WORKS.map((w) => ({ url: `${BASE}/arbeiten/${w.slug}` })),
    { url: `${BASE}/studio` },
    { url: `${BASE}/prozess` },
    { url: `${BASE}/kontakt` },
    { url: `${BASE}/impressum` },
    { url: `${BASE}/datenschutz` },
  ];
}

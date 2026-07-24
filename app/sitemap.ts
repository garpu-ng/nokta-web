import type { MetadataRoute } from "next";
import { WORKS } from "@/lib/works";

// One URL per page that exists: the wall, the thirteen works, the studio pages
// and the legal pages. The eight legacy paths 308-redirect and stay out.
const BASE = "https://www.nokta-studio.de";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/` },
    ...WORKS.map((w) => ({ url: `${BASE}/arbeiten/${w.slug}` })),
    { url: `${BASE}/studio` },
    { url: `${BASE}/prozess` },
    { url: `${BASE}/prozess/3d` },
    { url: `${BASE}/kontakt` },
    { url: `${BASE}/impressum` },
    { url: `${BASE}/datenschutz` },
  ];
}

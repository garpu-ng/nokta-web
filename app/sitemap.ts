import type { MetadataRoute } from "next";
import { WORKS } from "@/lib/works";

// One URL per page that exists: the wall, the thirteen works, the studio pages
// and the legal pages. The legacy paths 308-redirect and stay out — including
// /prozess and /prozess/3d, which both now land on /studio.
//
// /arbeiten was missing from this list for a while: it went in when the route
// was still a 308 to "/" and never came back when the wall moved there. It is
// linked from the header, the footer and every work page, and it declares its
// own canonical — it was simply not being declared here.
const BASE = "https://www.nokta-studio.de";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/` },
    { url: `${BASE}/arbeiten` },
    ...WORKS.map((w) => ({ url: `${BASE}/arbeiten/${w.slug}` })),
    { url: `${BASE}/studio` },
    { url: `${BASE}/kontakt` },
    { url: `${BASE}/impressum` },
    { url: `${BASE}/datenschutz` },
  ];
}

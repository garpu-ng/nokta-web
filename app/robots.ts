import type { MetadataRoute } from "next";

// Everything indexable except the easter egg (which also carries a page-level
// noindex of its own).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/punkt" },
    sitemap: "https://www.nokta-studio.de/sitemap.xml",
  };
}

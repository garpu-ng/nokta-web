// Shared OpenGraph + Twitter block for the site + branch pages. The card image
// itself is NOT set here — it comes from the file-convention opengraph-image /
// twitter-image routes, which Next gives higher priority than any metadata we
// return. So this module only carries the *text* half of the social card:
// title, description, canonical url, locale.
//
// Why a helper: Next merges metadata *shallowly*, so a child segment that sets
// `openGraph` replaces the parent's wholesale (nested fields are not deep-merged
// — see node_modules/next/dist/docs/.../generate-metadata.md → "Merging"). Every
// page therefore has to spell out its own complete openGraph block; this keeps
// those blocks identical apart from the copy, so they can't drift.

import type { Metadata } from "next";
import type { Locale } from "@/lib/locales";

/** og:locale wants a language_TERRITORY tag, not the bare ISO-639 code we use
    for <html lang>. Map our four UI locales to their canonical OG forms. */
const OG_LOCALE: Record<Locale, string> = {
  de: "de_DE",
  en: "en_US",
  tr: "tr_TR",
  ja: "ja_JP",
};

/** Build the openGraph + twitter fields for a page. `path` is the canonical
    route (e.g. "/point"), resolved against metadataBase into an absolute
    og:url; omit it for the studio-wide default in the root layout, where a
    single url would leak onto every inheriting page. */
export function socialMetadata(opts: {
  title: string;
  description: string;
  locale: Locale;
  path?: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const { title, description, locale, path } = opts;
  return {
    openGraph: {
      type: "website",
      siteName: "nokta",
      title,
      description,
      locale: OG_LOCALE[locale],
      // Relative — Next resolves it against metadataBase (app/layout.tsx).
      ...(path ? { url: path } : {}),
    },
    twitter: {
      // Large-image card so the generated poster shows in full, not a thumbnail.
      card: "summary_large_image",
      title,
      description,
    },
  };
}

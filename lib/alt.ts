// Alt text for a work's thumbnail, wherever the thumbnail stands in for the
// work (the wall, the home page's selected works, the target pages). Built from
// the title and one localized word for what the image is, so a new work needs
// no new string: "Sanktgores Residence, Visualisierung".
//
// The detail pages say more: each shot there has its own line
// (projects.alt.<slug>.<n>, see app/arbeiten/[slug]/page.tsx).

import type { WorkKind } from "@/lib/works";

/** A work's display title. `work.<slug>.title` overrides the name on the
    work where a locale needs its own wording. Missing keys keep `work.title`. */
export function displayTitle(
  work: { slug: string; title: string },
  t: (key: string) => string,
): string {
  const key = `work.${work.slug}.title`;
  const line = t(key);
  return line === key ? work.title : line;
}

/** Build the alt text of a work's thumbnail. `t` is any translator over the
    message keys. getT() for the localized pages, or the German dictionary
    for the German-only target pages. A `work.<slug>.thumbAlt` line replaces
    the generic "title, kind" sentence when the picture needs its own words. */
export function thumbAlt(
  work: { title: string; kind: WorkKind; slug?: string },
  t: (key: string) => string,
): string {
  if (work.slug) {
    const key = `work.${work.slug}.thumbAlt`;
    const line = t(key);
    if (line !== key) return line;
  }
  return t("alt.thumb")
    .replace("{title}", work.title)
    .replace("{what}", t(`alt.thumb.${work.kind}`));
}

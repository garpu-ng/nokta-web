// Alt text for a work's thumbnail, wherever the thumbnail stands in for the
// work (the wall, the home page's selected works, the target pages). Built from
// the title and one localized word for what the image is, so a new work needs
// no new string: "Sanktgores Residence, Visualisierung".
//
// The detail pages say more: each shot there has its own line
// (projects.alt.<slug>.<n>, see app/arbeiten/[slug]/page.tsx).

import type { WorkKind } from "@/lib/works";

/** Build the alt text of a work's thumbnail. `t` is any translator over the
    message keys — getT() for the localized pages, or the German dictionary
    for the German-only target pages. */
export function thumbAlt(
  work: { title: string; kind: WorkKind },
  t: (key: string) => string,
): string {
  return t("alt.thumb")
    .replace("{title}", work.title)
    .replace("{what}", t(`alt.thumb.${work.kind}`));
}

import { permanentRedirect } from "next/navigation";

/* The 3D workflow used to be its own page. Since Kolonnade it is written out
   inline on /prozess as "Ablauf 01" — the same four steps, the same copy, the
   same four photographs — because a process page whose substance lives one
   click away reads as a table of contents rather than as an answer.

   The route stays as a redirect: it has been linked from the /prozess cards
   since the site launched and is in the sitemap, so it keeps its meaning and
   hands the reader to the section that now holds it. */
export default function Prozess3dPage() {
  permanentRedirect("/prozess#ablauf-01");
}

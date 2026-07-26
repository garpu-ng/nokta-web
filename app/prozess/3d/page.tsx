import { permanentRedirect } from "next/navigation";

/* The 3D workflow used to be its own page. Since Kolonnade it is written out
   inline on /prozess as "Ablauf 01" — the same four steps, the same copy, the
   same four photographs — because a process page whose substance lives one
   click away reads as a table of contents rather than as an answer.

   The route stays as a redirect: it was linked from the /prozess cards and
   listed in the sitemap since the site launched, so old links and the index
   keep their meaning and land on the section that now holds it. */
export default function Prozess3dPage() {
  permanentRedirect("/prozess#ablauf-01");
}

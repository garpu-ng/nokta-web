import { permanentRedirect } from "next/navigation";

/* /prozess was the four-workflow page: four material cards, and under them the
   architecture-visualisation workflow written out in four steps.

   It is retired. The cards restated the studio's own service rows in shorter
   words, and only one of the four workflows underneath them ever existed — so
   a page announced in the plural delivered a single case study, and the more
   it was polished the more that showed.

   What the page was actually for — what you get, and in what order — is the
   Leistungen register on /studio, so the path lands there. 308, like every
   other retired route here, so old links and the index move with it rather
   than break. */
export default function LegacyProzessPage() {
  permanentRedirect("/studio");
}

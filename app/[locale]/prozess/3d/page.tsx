import { permanentRedirect } from "next/navigation";

/* The 3D workflow's own route, from before Kolonnade folded it into /prozess
   as "Ablauf 01". Now that /prozess is retired too, this aims where /prozess
   aims instead of at /prozess itself — one hop rather than a chain of them,
   which is the difference between a redirect and a maze. */
export default function LegacyProzess3dPage() {
  permanentRedirect("/studio");
}

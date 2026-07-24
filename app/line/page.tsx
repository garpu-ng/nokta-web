import { permanentRedirect } from "next/navigation";

// /line was the CAD-print branch and its catalogue. The prints sit on the wall
// now; each one keeps a page of its own at /arbeiten/[slug].
export default function LegacyLinePage() {
  permanentRedirect("/");
}

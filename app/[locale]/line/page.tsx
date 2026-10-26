import { permanentRedirect } from "next/navigation";

// /line was the CAD-print branch and its catalogue. The prints are in the
// shop now, each with a page of its own at /shop/[slug].
export default function LegacyLinePage() {
  permanentRedirect("/shop");
}

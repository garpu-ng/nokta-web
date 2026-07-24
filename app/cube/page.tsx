import { permanentRedirect } from "next/navigation";

// /cube was the architecture-visualisation branch. The renderings sit on the
// wall now, next to everything else the studio draws.
export default function LegacyCubePage() {
  permanentRedirect("/");
}

import { permanentRedirect } from "next/navigation";

// /point was the design-and-print branch. There are no branches any more — one
// studio, one body of work — so the path folds into the wall on "/". 308, so
// links, bookmarks and the index move with it rather than break.
export default function LegacyPointPage() {
  permanentRedirect("/");
}

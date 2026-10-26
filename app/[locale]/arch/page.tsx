import { permanentRedirect } from "next/navigation";

// The first archviz path, older than /cube. Both end in the same place now.
export default function LegacyArchPage() {
  permanentRedirect("/");
}

import { permanentRedirect } from "next/navigation";

// The first design path, older than /point. Both end in the same place now.
export default function LegacyNoktaPage() {
  permanentRedirect("/");
}

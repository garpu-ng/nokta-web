import { permanentRedirect } from "next/navigation";

export default function LegacyArchPage() {
  permanentRedirect("/cube");
}

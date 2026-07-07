import type { Metadata } from "next";
import PunktEasterEgg from "@/components/PunktEasterEgg";

export const metadata: Metadata = {
  title: "nokta · Punkt",
  robots: { index: false, follow: false },
};

export default function PunktPage() {
  return <PunktEasterEgg />;
}

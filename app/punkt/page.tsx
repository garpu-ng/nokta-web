import type { Metadata } from "next";
import PunktEasterEgg from "@/components/PunktEasterEgg";
import { getT } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("meta.punkt.title"),
    robots: { index: false, follow: false },
  };
}

export default async function PunktPage() {
  const t = await getT();
  return <PunktEasterEgg backLabel={t("punkt.back")} />;
}

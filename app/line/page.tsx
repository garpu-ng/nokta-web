import type { Metadata } from "next";
import { getT } from "@/lib/i18n";
import LineBand from "@/components/line/LineBand";
import LineHero from "@/components/line/LineHero";
import PlotLine from "@/components/line/PlotLine";
import PrintCatalogue from "@/components/line/PrintCatalogue";
import lineStyles from "@/components/line/LineHero.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("meta.line.title"),
    description: t("branch.line.desc"),
    alternates: { canonical: "/line" },
  };
}

export default async function LinePage() {
  const t = await getT();
  return (
    <>
      <LineHero />

      <div className={lineStyles.intro}>
        <p className={lineStyles.introLead}>{t("line.lead")}</p>
      </div>

      <PlotLine />

      <PrintCatalogue />

      <LineBand />
    </>
  );
}

import type { Metadata } from "next";
import ArtPlate from "@/components/nokta/ArtPlate";
import CaseStudy from "@/components/nokta/CaseStudy";
import Leuchtturm from "@/components/nokta/Leuchtturm";
import NoktaBand from "@/components/nokta/NoktaBand";
import NoktaHero from "@/components/nokta/NoktaHero";
import ServiceIndex from "@/components/nokta/ServiceIndex";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";
import heroStyles from "@/components/nokta/NoktaHero.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.nokta.title");
  const description = t("branch.nokta.desc");
  return {
    title,
    description,
    alternates: { canonical: "/point" },
    ...socialMetadata({ title, description, locale, path: "/point" }),
  };
}

export default async function PointPage() {
  const t = await getT();

  return (
    <>
      <NoktaHero />
      <div className={heroStyles.intro}>
        <p className={heroStyles.introLead}>{t("branch.nokta.desc")}</p>
      </div>
      <CaseStudy />
      <ArtPlate />
      <Leuchtturm />
      <ServiceIndex />
      <NoktaBand />
    </>
  );
}

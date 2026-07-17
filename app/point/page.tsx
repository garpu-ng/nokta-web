import type { Metadata } from "next";
import ColorStrip from "@/components/nokta/ColorStrip";
import NoktaBand from "@/components/nokta/NoktaBand";
import NoktaHero from "@/components/nokta/NoktaHero";
import ServiceIndex from "@/components/nokta/ServiceIndex";
import { getT } from "@/lib/i18n";
import heroStyles from "@/components/nokta/NoktaHero.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("meta.nokta.title"),
    description: t("branch.nokta.desc"),
    alternates: { canonical: "/point" },
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
      <ColorStrip />
      <ServiceIndex />
      <NoktaBand />
    </>
  );
}

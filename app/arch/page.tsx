import type { Metadata } from "next";
import WorkGrid from "@/components/WorkGrid";
import ArchHero from "@/components/arch/ArchHero";
import DotField from "@/components/arch/DotField";
import archStyles from "@/components/arch/ArchHero.module.css";
import { getT } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("meta.arch.title"),
    description: t("branch.arch.desc"),
    alternates: { canonical: "/arch" },
  };
}

export default async function ArchPage() {
  const t = await getT();
  return (
    <>
      <ArchHero />

      {/* Intro lead — the branch.arch.desc copy, on its own paper block
          below the hero (styles live in ArchHero.module.css). */}
      <div className={archStyles.intro}>
        <p className={archStyles.introLead}>{t("branch.arch.desc")}</p>
      </div>

      <DotField />

      <div className="wa-grid-column">
        <WorkGrid />
      </div>
    </>
  );
}

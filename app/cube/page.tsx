import type { Metadata } from "next";
import ArchHero from "@/components/arch/ArchHero";
import DotField from "@/components/arch/DotField";
import PosterWall from "@/components/arch/PosterWall";
import PerspectiveGrid from "@/components/arch/PerspectiveGrid";
import archStyles from "@/components/arch/ArchHero.module.css";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.arch.title");
  const description = t("branch.arch.desc");
  return {
    title,
    description,
    alternates: { canonical: "/cube" },
    ...socialMetadata({ title, description, locale, path: "/cube" }),
  };
}

export default async function CubePage() {
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

      <PosterWall />

      {/* Full-bleed closing band — sits outside PosterWall's paper column. */}
      <PerspectiveGrid tagline={t("arch.grid.tagline")} cta={t("arch.grid.cta")} />
    </>
  );
}

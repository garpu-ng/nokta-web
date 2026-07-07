import type { Metadata } from "next";
import WorkGrid from "@/components/WorkGrid";
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
      <div className="nk-branch" style={{ paddingBottom: "1.5rem" }}>
        <header className="nk-branch-head" style={{ marginBottom: 0 }}>
          <h1 className="nk-branch-title">
            nokta.arch<span className="nk-dot">.</span>
          </h1>
          <p className="nk-branch-tag">{t("branch.arch.tag")}</p>
          <p className="nk-branch-lead">{t("branch.arch.desc")}</p>
        </header>
      </div>

      <div className="wa-grid-column">
        <WorkGrid />
      </div>
    </>
  );
}

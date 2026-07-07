import type { Metadata } from "next";
import { getT } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("meta.nokta.title"),
    description: t("branch.nokta.desc"),
    alternates: { canonical: "/nokta" },
  };
}

export default async function NoktaPage() {
  const t = await getT();
  const services = [0, 1, 2, 3].map((i) => ({
    title: t(`nokta.svc.${i}.title`),
    text: t(`nokta.svc.${i}.text`),
  }));

  return (
    <main className="nk-branch">
      <header className="nk-branch-head">
        <h1 className="nk-branch-title">
          nokta.nokta<span className="nk-dot">.</span>
        </h1>
        <p className="nk-branch-tag">{t("branch.nokta.tag")}</p>
        <p className="nk-branch-lead">{t("branch.nokta.desc")}</p>
      </header>

      <div className="nk-service-grid">
        {services.map((s) => (
          <div key={s.title} className="nk-service">
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

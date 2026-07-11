import type { Metadata } from "next";
import { getT } from "@/lib/i18n";
import shell from "@/components/BranchShell.module.css";
import styles from "./page.module.css";

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
    <main className={shell.branch}>
      <header className={shell.head}>
        <h1 className={shell.title}>
          nokta.nokta<span className="nk-dot">.</span>
        </h1>
        <p className={shell.tag}>{t("branch.nokta.tag")}</p>
        <p className={shell.lead}>{t("branch.nokta.desc")}</p>
      </header>

      <div className={styles.serviceGrid}>
        {services.map((s) => (
          <div key={s.title} className={styles.service}>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

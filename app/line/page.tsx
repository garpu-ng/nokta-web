import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PRINTS } from "@/lib/prints";
import { getMediaSize } from "@/lib/mediaSizes";
import { getT } from "@/lib/i18n";
import shell from "@/components/BranchShell.module.css";
import styles from "./page.module.css";

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
    <main className={shell.branch}>
      <header className={shell.head}>
        <h1 className={shell.title}>
          nokta.line<span className="nk-dot">.</span>
        </h1>
        <p className={shell.tag}>{t("branch.line.tag")}</p>
        <p className={shell.lead}>{t("line.lead")}</p>
      </header>

      <div className={styles.printGrid}>
        {PRINTS.map((print) => (
          <Link key={print.slug} href={`/line/${print.slug}`} className={styles.print}>
            <div className={styles.printArt}>
              <Image
                src={print.image}
                alt={print.title}
                width={getMediaSize(print.image).width}
                height={getMediaSize(print.image).height}
                sizes="(max-width: 767px) 100vw, 33vw"
              />
            </div>
            <div className={styles.printBody}>
              <span className={styles.printName}>{print.title}</span>
              <span className={styles.printMeta}>
                {print.subtitle} · {print.year}
              </span>
              <div className={styles.printBuy}>
                <span className={styles.printPrice}>{print.price} €</span>
                <span className={styles.printCta}>{t("line.view")}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

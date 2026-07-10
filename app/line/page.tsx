import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PRINTS } from "@/lib/prints";
import { getMediaSize } from "@/lib/mediaSizes";
import { getT } from "@/lib/i18n";

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
    <main className="nk-branch">
      <header className="nk-branch-head">
        <h1 className="nk-branch-title">
          nokta.line<span className="nk-dot">.</span>
        </h1>
        <p className="nk-branch-tag">{t("branch.line.tag")}</p>
        <p className="nk-branch-lead">{t("line.lead")}</p>
      </header>

      <div className="nk-print-grid">
        {PRINTS.map((print) => (
          <Link key={print.slug} href={`/line/${print.slug}`} className="nk-print">
            <div className="nk-print__art">
              <Image
                src={print.image}
                alt={print.title}
                width={getMediaSize(print.image).width}
                height={getMediaSize(print.image).height}
                sizes="(max-width: 767px) 100vw, 33vw"
              />
            </div>
            <div className="nk-print__body">
              <span className="nk-print__name">{print.title}</span>
              <span className="nk-print__meta">
                {print.subtitle} · {print.year}
              </span>
              <div className="nk-print__buy">
                <span className="nk-print__price">{print.price} €</span>
                <span className="nk-print__cta">{t("line.view")}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

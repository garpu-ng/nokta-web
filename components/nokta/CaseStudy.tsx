import Image from "next/image";
import { getT } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import Registration from "@/components/print/Registration";
import styles from "./CaseStudy.module.css";

/* Featured commission — the flagship editorial job that shows, rather than
   tells, what nokta.point does. Six spreads from the KI-Kommission
   Abschlussbericht are laid out as a horizontal proof-sheet strip: a plain
   scroll-snap list (no carousel state), keyboard-scrollable and fully rendered
   without JS. Each proof carries a mono caption naming the design decision it
   demonstrates. Below sit the prepress facts, the honest PDF/web links and the
   narrative of what was delivered. The report's own cyan wayfinding accent is
   borrowed here — and only here — as a project-specific colour. */
const SPREADS = [
  { key: "cover", src: "/point/abschlussbericht/cover.webp" },
  { key: "contents", src: "/point/abschlussbericht/contents.webp" },
  { key: "prinzipien", src: "/point/abschlussbericht/prinzipien.webp" },
  { key: "empfehlung", src: "/point/abschlussbericht/empfehlung.webp" },
  { key: "opinion", src: "/point/abschlussbericht/opinion.webp" },
  { key: "termine", src: "/point/abschlussbericht/termine.webp" },
] as const;

const FACTS = ["client", "year", "scope", "discipline", "credit"] as const;

const PDF_HREF = "/point/abschlussbericht-ki-kommission-2026.pdf";
const WEB_HREF = "https://kikommission.de";

export default async function CaseStudy() {
  const t = await getT();

  return (
    <section className={`${styles.case} nk-grain`}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={`nk-mono-caption ${styles.kicker}`}>{t("point.case.kicker")}</p>
          <h2 className={styles.label}>
            {t("point.case.label")}
            <span className={styles.labelDot}>.</span>
          </h2>
          <p className={styles.title}>{t("point.case.title")}</p>
          <p className={styles.lead}>{t("point.case.lead")}</p>
        </header>

        {/* Plain scroll-snap list: native horizontal scroll, focusable so it can
            be driven with the arrow keys, and complete without any JS. */}
        <ol
          className={styles.strip}
          aria-label={t("point.case.stripAria")}
          tabIndex={0}
        >
          {SPREADS.map((spread, index) => {
            const { width, height } = getMediaSize(spread.src);
            return (
              <li className={styles.proof} key={spread.key}>
                <figure className={styles.figure}>
                  <div className={styles.frame}>
                    <Image
                      src={spread.src}
                      alt={t(`point.case.spread.${spread.key}.alt`)}
                      width={width}
                      height={height}
                      sizes="(max-width: 767px) 78vw, 360px"
                      className={styles.art}
                    />
                    <Registration className={styles.reg} />
                  </div>
                  <figcaption className={`nk-mono-caption ${styles.caption}`}>
                    <span className={styles.folio}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {t(`point.case.spread.${spread.key}.caption`)}
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ol>

        <div className={styles.grid}>
          <dl className={styles.facts} aria-label={t("point.case.facts.label")}>
            {FACTS.map((fact) => (
              <div className={styles.factRow} key={fact}>
                <dt className={styles.factLabel}>{t(`point.case.facts.${fact}.label`)}</dt>
                <dd className={styles.factValue}>{t(`point.case.facts.${fact}.value`)}</dd>
              </div>
            ))}
            <div className={styles.links}>
              <a className={styles.pdf} href={PDF_HREF} target="_blank" rel="noopener noreferrer">
                {t("point.case.pdf")}
              </a>
              <a className={styles.web} href={WEB_HREF} target="_blank" rel="noopener noreferrer">
                {t("point.case.web")}
              </a>
            </div>
          </dl>

          <div className={styles.narrative}>
            <p>{t("point.case.narrative1")}</p>
            <p>{t("point.case.narrative2")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

import Reveal from "@/components/Reveal";
import { getT } from "@/lib/i18n";
import styles from "./ServiceIndex.module.css";

/* The Leistungen register — the one PAPER section left in the site. Since
   Kolonnade the page is ink, so turning this one block back over is what
   makes it read as the printed index it is: four ruled rows, each stated as a
   deliverable, on the sheet the rest of the site used to be.

   The two services the flagship commission proves get a one-line evidence
   hook linking them back to the case study. */
const EVIDENCE = new Set([1, 2]);

export default async function ServiceIndex() {
  const t = await getT();
  const services = [0, 1, 2, 3].map((index) => ({
    folio: String(index + 1).padStart(2, "0"),
    title: t(`nokta.svc.${index}.title`),
    text: t(`nokta.svc.${index}.text`),
    evidence: EVIDENCE.has(index) ? t(`nokta.svc.${index}.evidence`) : null,
  }));

  return (
    <section className={styles.section} aria-labelledby="nk-leistungen">
      <div className={styles.head}>
        <h2 id="nk-leistungen" className={styles.label}>
          {t("nokta.index.label")}
        </h2>
        <p className={styles.note}>{t("studio.services.note")}</p>
      </div>
      {/* The register rules itself in, one row after the next. */}
      {services.map((service, i) => (
        <Reveal as="article" className={styles.row} key={service.folio} delay={i * 70}>
          <span className={styles.folio}>{service.folio}</span>
          <h3 className={styles.title}>{service.title}</h3>
          <div>
            <p className={styles.text}>{service.text}</p>
            {service.evidence ? (
              <p className={styles.evidence}>{service.evidence}</p>
            ) : null}
          </div>
        </Reveal>
      ))}
    </section>
  );
}

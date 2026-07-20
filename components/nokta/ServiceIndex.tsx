import { getT } from "@/lib/i18n";
import styles from "./ServiceIndex.module.css";

/* The two services the flagship commission proves get a one-line evidence hook
   linking them back to the case study above. */
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
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.label}>{t("nokta.index.label")}</h2>
        <div className={styles.entries}>
          {services.map((service) => (
            <article className={styles.entry} key={service.folio}>
              <div className={styles.row}>
                <span className={styles.folio}>{service.folio}</span>
                <h3 className={styles.title}>{service.title}</h3>
                <span className={styles.leader} aria-hidden="true" />
                <span className={`${styles.folio} ${styles.folioEnd}`}>{service.folio}</span>
              </div>
              <p className={styles.text}>{service.text}</p>
              {service.evidence ? (
                <p className={`nk-mono-caption ${styles.evidence}`}>
                  <span className={styles.evidenceMark} aria-hidden="true">↳</span>
                  {service.evidence}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

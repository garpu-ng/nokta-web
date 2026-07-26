import type { Metadata } from "next";
import InquiryForm from "@/components/kontakt/InquiryForm";
import { getT } from "@/lib/i18n";
import styles from "./page.module.css";

/* The page the site is for. Until Kolonnade it offered a mailto link and
   nothing else, which is where the inquiries were going: the form is the
   change, and the rail beside it keeps the direct address for anyone who
   would rather write from their own mail client. */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("meta.kontakt.title") };
}

export default async function KontaktPage() {
  const t = await getT();

  return (
    <main>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <section className={styles.head}>
        <h1 className={styles.heading}>
          {t("kontakt.heading")}
          <span className={styles.period}>.</span>
        </h1>
        <p className={styles.intro}>{t("kontakt.intro")}</p>
      </section>

      <div className={styles.body}>
        <InquiryForm
          copy={{
            step1: t("kontakt.form.step1"),
            step2: t("kontakt.form.step2"),
            step3: t("kontakt.form.step3"),
            kinds: [0, 1, 2, 3].map((i) => t(`kontakt.form.kind.${i}`)),
            name: t("kontakt.form.name"),
            email: t("kontakt.form.email"),
            message: t("kontakt.form.message"),
            submit: t("kontakt.form.submit"),
            sending: t("kontakt.form.sending"),
            sla: t("kontakt.form.sla"),
            doneTitle: t("kontakt.form.done.title"),
            doneBody: t("kontakt.form.done.body"),
            again: t("kontakt.form.again"),
            error: t("kontakt.form.error"),
            fallback: t("kontakt.form.nojs"),
          }}
        />

        {/* ── Rail ─────────────────────────────────────────────────
            The studio's mark at the size of a signature, and under it the
            address in plain terms. The disc is a sanctioned red field — it IS
            the brand dot at scale, and it is a link, so it is the one thing
            here you can hit without reading anything. */}
        <aside className={styles.rail}>
          <a
            href="mailto:hallo@nokta-studio.de"
            className={styles.disc}
            aria-label={t("kontakt.mailAria")}
          />
          <div>
            <p className={styles.railLabel}>{t("kontakt.direct")}</p>
            <a href="mailto:hallo@nokta-studio.de" className={styles.railMail}>
              hallo@nokta-studio.de
            </a>
          </div>
          <hr className={styles.hair} />
          <p className={styles.address}>
            nokta Studio
            <br />
            {t("kontakt.addr.region")}
            <br />
            {t("kontakt.addr.vat")}
          </p>
          {/* The Schriftfeld voice: where the studio is, at what scale. */}
          <p className={styles.coords}>51°14′N 6°47′E · /1:500</p>
        </aside>
      </div>
    </main>
  );
}

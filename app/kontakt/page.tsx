import type { Metadata } from "next";
import InquiryForm from "@/components/kontakt/InquiryForm";
import InterferenceField from "@/components/nokta/InterferenceField";
import PlateHead from "@/components/nokta/PlateHead";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";
import styles from "./page.module.css";

/* The page the site is for. Until Kolonnade it offered a mailto link and
   nothing else, which is where the inquiries were going: the form is the
   change, and the rail beside it keeps the direct address for anyone who
   would rather write from their own mail client.

   Since the plate became the house pattern this page carries one too, in the
   variant written for it: two sources that approach and part, and the accent
   struck on every dot where BOTH waves crest. On the page where two parties
   are meant to find each other, the red is exactly the set of places they
   agree — and it is dots, so the page's one sanctioned red FIELD is still the
   rail's disc and nothing here spends it twice. */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.kontakt.title");
  const description = t("meta.site.desc");
  // As on /studio: its own canonical, and its own social block rather than the
  // root layout's, which shared this page under the site's title.
  return {
    title,
    description,
    alternates: { canonical: "/kontakt" },
    ...socialMetadata({ title, description, locale, path: "/kontakt" }),
  };
}

export default async function KontaktPage() {
  const t = await getT();
  const title = `${t("kontakt.heading")}.`;

  return (
    <main>
      <PlateHead title={title}>
        <InterferenceField variant="meeting" motto={title} />
      </PlateHead>

      <section className={styles.head}>
        <p className={styles.intro}>{t("kontakt.intro")}</p>
      </section>

      <div className={styles.body}>
        <InquiryForm
          copy={{
            step1: t("kontakt.form.step1"),
            step2: t("kontakt.form.step2"),
            step3: t("kontakt.form.step3"),
            // The id is what the route validates; the label is what the
            // reader reads. Order matches kontakt.form.kind.0–3.
            kinds: ["visualisierung", "editorial", "druck", "cad"].map((id, i) => ({
              id,
              label: t(`kontakt.form.kind.${i}`),
            })),
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
            errorFields: t("kontakt.form.error.fields"),
            errorBusy: t("kontakt.form.error.busy"),
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
        </aside>
      </div>
    </main>
  );
}

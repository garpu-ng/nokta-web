import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";

/* /impressum: copy from messages (impressum.*), German fallback per key.
   Names, address and e-mail stay as they are in every language. Outside
   German a note says the German version is binding (legal.binding). */

const PATH = "/impressum";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.impressum.title");
  const description = t("meta.impressum.desc");
  return {
    title,
    description,
    alternates: { canonical: PATH },
    ...socialMetadata({ title, description, locale, path: PATH }),
  };
}

export default async function ImpressumPage() {
  const t = await getT();
  const locale = await getLocale();
  return (
    <main className="wa-page">
      <h1>{t("impressum.heading")}</h1>

      {locale !== "de" && <p>{t("legal.binding")}</p>}

      <p>{t("impressum.basis")}</p>

      <p>
        Kaan Özden, nokta studio
        <br />
        Messerstraße 31
        <br />
        42657 Solingen
        <br />
        {t("impressum.country")}
      </p>

      <p>
        <strong>{t("impressum.contact.label")}</strong>
        <br />
        {t("impressum.contact.email")}{" "}
        <a href="mailto:hallo@nokta-studio.de">hallo@nokta-studio.de</a>
        <br />
        {t("impressum.contact.form.before")}{" "}
        <Link href="/kontakt">{t("impressum.contact.form.link")}</Link>
        {t("impressum.contact.form.after")}
      </p>

      <p>
        <strong>{t("impressum.responsible.label")}</strong>
        <br />
        {t("impressum.responsible.text")}
      </p>

      <p>
        <strong>{t("impressum.dispute.label")}</strong>
        <br />
        {t("impressum.dispute.text")}
      </p>
    </main>
  );
}

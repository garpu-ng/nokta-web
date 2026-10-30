import type { Metadata } from "next";
import { getLocale, getT } from "@/lib/i18n";
import { socialMetadata } from "@/lib/socialMeta";

/* /datenschutz: copy from messages (datenschutz.*), German fallback per key.
   Names, address, e-mail, company names and law citations stay as they are
   in every language. Outside German a note says the German version is
   binding (legal.binding). */

const PATH = "/datenschutz";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.datenschutz.title");
  const description = t("meta.datenschutz.desc");
  return {
    title,
    description,
    alternates: { canonical: PATH },
    ...socialMetadata({ title, description, locale, path: PATH }),
  };
}

export default async function DatenschutzPage() {
  const t = await getT();
  const locale = await getLocale();
  // Japanese runs text and links together without spaces.
  const sp = locale === "ja" ? "" : " ";
  return (
    <main className="wa-page">
      <h1>{t("datenschutz.heading")}</h1>

      {locale !== "de" && <p>{t("legal.binding")}</p>}

      <p>
        <strong>{t("datenschutz.1.title")}</strong>
        <br />
        {t("datenschutz.1.text")}{sp}
        <a href="mailto:hallo@nokta-studio.de">hallo@nokta-studio.de</a>
        {t("datenschutz.1.after")}
      </p>

      <p>
        <strong>{t("datenschutz.2.title")}</strong>
        <br />
        {t("datenschutz.2.text")}
      </p>

      <p>
        <strong>{t("datenschutz.3.title")}</strong>
        <br />
        {t("datenschutz.3.text")}
      </p>

      <p>
        <strong>{t("datenschutz.4.title")}</strong>
        <br />
        {t("datenschutz.4.text")}{sp}
        <a href="mailto:hallo@nokta-studio.de">hallo@nokta-studio.de</a>{sp}
        {t("datenschutz.4.after")}
      </p>

      <p>
        <strong>{t("datenschutz.5.title")}</strong>
        <br />
        {t("datenschutz.5.text")}
      </p>

    </main>
  );
}

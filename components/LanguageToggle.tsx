"use client";

import { useRouter } from "next/navigation";
import {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/locales";
import styles from "./LanguageToggle.module.css";

// Sets the language cookie and re-renders the server tree (router.refresh),
// so every server component picks up the new locale without a full reload.
export default function LanguageToggle({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  const router = useRouter();

  const choose = (locale: Locale) => {
    if (locale === current) return;
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  };

  return (
    <div className={styles.toggle} role="group" aria-label={label}>
      {LOCALES.map((locale, i) => (
        <span key={locale} className={styles.item}>
          {i > 0 && <span className={styles.sep} aria-hidden="true" />}
          <button
            type="button"
            onClick={() => choose(locale)}
            aria-pressed={locale === current}
            className={`${styles.opt}${locale === current ? " " + styles.active : ""}`}
          >
            {LOCALE_LABELS[locale]}
          </button>
        </span>
      ))}
    </div>
  );
}

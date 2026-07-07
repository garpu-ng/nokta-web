// Client-safe locale constants (no server-only imports). Used by both the
// server i18n helpers and the client language toggle.

export const LOCALES = ["de", "en", "tr", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "de";
export const LOCALE_COOKIE = "nk_lang";

export const LOCALE_LABELS: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  tr: "TR",
  ja: "JA",
};

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

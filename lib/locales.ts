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

/** Public URL for an internal `/{locale}/...` path. Unprefixed paths pass through,
    so nav matching stays correct whether or not the router exposes the rewrite. */
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/");
  if (!isLocale(segments[1])) return pathname;
  const rest = `/${segments.slice(2).join("/")}`;
  if (rest === "/") return "/";
  return rest.endsWith("/") ? rest.slice(0, -1) : rest;
}

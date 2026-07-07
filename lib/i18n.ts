// Server-side i18n. Reads the locale from a cookie and returns a translator
// with German fallback: a missing key in any locale falls back to German, and
// an unknown key returns itself — so a typo never crashes a page.
import { cookies } from "next/headers";
import de from "@/messages/de";
import en from "@/messages/en";
import tr from "@/messages/tr";
import ja from "@/messages/ja";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/locales";

const DICTS: Record<Locale, Record<string, string>> = { de, en, tr, ja };

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export type Translate = (key: string) => string;

export function makeTranslate(locale: Locale): Translate {
  const dict = DICTS[locale];
  return (key: string) => dict[key] ?? de[key] ?? key;
}

/** Get the translator for the current request's locale. */
export async function getT(): Promise<Translate> {
  return makeTranslate(await getLocale());
}

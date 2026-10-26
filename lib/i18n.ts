// Server-side i18n. The locale is pinned from the `[locale]` segment during
// prerender (see requestLocale), so pages never have to read the nk_lang cookie
// and can be static. A render that didn't pin — the 404 — falls back to the
// cookie, then to German. A missing key in any locale falls back to German, and
// an unknown key returns itself, so a typo never crashes a page.
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import de from "@/messages/de";
import en from "@/messages/en";
import tr from "@/messages/tr";
import ja from "@/messages/ja";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/locales";

const DICTS: Record<Locale, Record<string, string>> = { de, en, tr, ja };

// One store per render. Layout and page run as siblings, so each entry point
// pins the locale itself before translating; they always pin the same value.
const localeStore = cache(() => ({ locale: undefined as Locale | undefined }));

export function setRequestLocale(locale: Locale) {
  localeStore().locale = locale;
}

/** Pin `locale` for this render. Call at the top of every layout, page and
    generateMetadata that translates, before getLocale/getT. */
export function requestLocale(locale: string): Locale {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return locale;
}

async function localeFromCookie(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getLocale(): Promise<Locale> {
  return localeStore().locale ?? localeFromCookie();
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

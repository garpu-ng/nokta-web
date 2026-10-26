import type { Metadata } from "next";
import SiteFrame from "@/components/SiteFrame";
import { getLocale, getT, requestLocale } from "@/lib/i18n";
import { LOCALES } from "@/lib/locales";
import { socialMetadata } from "@/lib/socialMeta";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  requestLocale((await params).locale);
  const t = await getT();
  const locale = await getLocale();
  const title = t("meta.site.title");
  const description = t("meta.site.desc");
  return {
    title,
    description,
    metadataBase: new URL("https://www.nokta-studio.de"),
    // Studio-wide default social card. No `path` → no og:url here, so the
    // pages that inherit this block (studio, kontakt, legal…) don't pick up a
    // wrong canonical; home and the work pages set their own url. The card
    // image comes from app/opengraph-image.tsx + app/twitter-image.tsx.
    ...socialMetadata({ title, description, locale }),
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  requestLocale((await params).locale);
  return <SiteFrame>{children}</SiteFrame>;
}

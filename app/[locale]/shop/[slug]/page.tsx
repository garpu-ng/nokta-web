import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectHeader from "@/components/ProjectHeader";
import PrintPassport from "@/components/shop/PrintPassport";
import { getLocale, getT, requestLocale } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { PRINTS } from "@/lib/prints";
import { socialMetadata } from "@/lib/socialMeta";

/* One print: back to the shop, the title, and the passport with its price and
   checkout — the page the prints had under /arbeiten, moved as it was. */

type Props = { params: Promise<{ locale: string; slug: string }> };

// Unknown slugs 404 as a full document (see app/global-not-found.tsx) rather
// than rendering on demand.
export const dynamicParams = false;

export function generateStaticParams() {
  return PRINTS.map((print) => ({ slug: print.slug }));
}

function getPrint(slug: string) {
  return PRINTS.find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  requestLocale(locale);
  const print = getPrint(slug);
  if (!print) return {};

  const t = await getT();
  const localeNow = await getLocale();
  const title = `${print.title} · nokta`;
  const description = `${print.title}, ${print.subtitle} · ${print.year} · ${print.architect}. ${t(
    "line.metaDescSuffix",
  )} ${print.price} €.`;
  const path = `/shop/${print.slug}`;
  const { width, height } = getMediaSize(print.image);
  const social = socialMetadata({ title, description, locale: localeNow, path });

  return {
    title,
    description,
    alternates: { canonical: path },
    ...social,
    openGraph: {
      ...social.openGraph,
      images: [{ url: print.image, width, height, alt: print.title }],
    },
  };
}

export default async function ShopPrintPage({ params }: Props) {
  const { locale, slug } = await params;
  requestLocale(locale);
  const print = getPrint(slug);
  if (!print) notFound();

  const t = await getT();

  return (
    <main style={{ paddingBottom: "clamp(4rem, 9svh, 6rem)" }}>
      <ProjectHeader
        title={print.title}
        anno={`${print.subtitle} · A1 · ${print.price} €`}
        backHref="/shop"
        backLabel={t("shop.back")}
      />
      <PrintPassport print={print} t={t} />
    </main>
  );
}

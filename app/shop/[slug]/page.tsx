import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectHeader from "@/components/ProjectHeader";
import PrintPassport from "@/components/shop/PrintPassport";
import { getLocale, getT } from "@/lib/i18n";
import { getMediaSize } from "@/lib/mediaSizes";
import { PRINTS } from "@/lib/prints";
import { socialMetadata } from "@/lib/socialMeta";

/* One print: back to the shop, the title, and the passport with its price and
   checkout — the page the prints had under /arbeiten, moved as it was. */

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRINTS.map((print) => ({ slug: print.slug }));
}

function getPrint(slug: string) {
  return PRINTS.find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const print = getPrint(slug);
  if (!print) return {};

  const t = await getT();
  const locale = await getLocale();
  const title = `${print.title} · nokta`;
  const description = `${print.title}, ${print.subtitle} · ${print.year} · ${print.architect}. ${t(
    "line.metaDescSuffix",
  )} ${print.price} €.`;
  const path = `/shop/${print.slug}`;
  const { width, height } = getMediaSize(print.image);
  const social = socialMetadata({ title, description, locale, path });

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
  const { slug } = await params;
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

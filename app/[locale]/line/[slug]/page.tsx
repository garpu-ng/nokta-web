import { permanentRedirect } from "next/navigation";
import { PRINTS } from "@/lib/prints";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRINTS.map((print) => ({ slug: print.slug }));
}

// Every print used to have its passport page under /line. The passport lives at
// /shop/[slug] now, so the slug is carried across unchanged — an old link to a
// print still lands on that exact print. Unknown slugs are handled there:
// /shop notFound()s them.
export default async function LegacyPrintPage({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/shop/${slug}`);
}

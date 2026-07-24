import { permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

// The archviz projects lived at /projekte/[slug]. They are works like any other
// now, so the slug is carried straight over to /arbeiten/[slug] — which owns
// the image stack this page used to render, and the notFound() for a slug that
// never existed.
export default async function LegacyProjectPage({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/arbeiten/${slug}`);
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProject, PROJECTS } from "@/lib/projects";
import { getMediaSize } from "@/lib/mediaSizes";
import ProjectHeader from "@/components/ProjectHeader";
import { getT } from "@/lib/i18n";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const t = await getT();
  return {
    title: `${project.title} · nokta.arch`,
    description: t(`projects.desc.${slug}`),
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const t = await getT();
  const clientLabel =
    project.client === "Privatkunde"
      ? t("projects.client.private")
      : project.client;

  // Find prev/next for navigation
  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  const prev = PROJECTS[idx - 1];
  const next = PROJECTS[idx + 1];

  return (
    <>
      {/* Header */}
      <ProjectHeader
        title={project.title}
        client={clientLabel}
        category={t(`projects.cat.${project.category}`)}
        year={project.year}
        description={t(`projects.desc.${slug}`)}
        backLabel={t("project.back")}
      />

      {/* Image windows */}
      <div className="wa-project-images">
        {project.images.map((src, i) => (
          <div key={i} className="wa-image-window">
            <Image
              src={src}
              alt={`${project.title}, Bild ${i + 1}`}
              width={getMediaSize(src).width}
              height={getMediaSize(src).height}
              sizes="(max-width: 1500px) 100vw, 1500px"
              priority={i === 0}
              className="wa-project-img"
            />
          </div>
        ))}
      </div>

      {/* Prev / Next navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "clamp(2rem, 6vw, 4.5rem)",
          padding: "5svh 4svw",
        }}
      >
        {prev && (
          <Link href={`/projekte/${prev.slug}`} style={{ fontSize: "0.95rem", color: "var(--on-brand)", opacity: 0.85, textDecoration: "none" }}>
            ← {prev.title}
          </Link>
        )}
        {next && (
          <Link href={`/projekte/${next.slug}`} style={{ fontSize: "0.95rem", color: "var(--on-brand)", opacity: 0.85, textDecoration: "none" }}>
            {next.title} →
          </Link>
        )}
      </div>
    </>
  );
}

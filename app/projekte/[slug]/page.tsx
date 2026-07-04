import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, PROJECTS } from "@/lib/projects";
import ProjectHeader from "@/components/ProjectHeader";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — WaArchi Studio`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // Find prev/next for navigation
  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  const prev = PROJECTS[idx - 1];
  const next = PROJECTS[idx + 1];

  return (
    <>
      {/* Header */}
      <ProjectHeader
        title={project.title}
        client={project.client}
        category={project.category}
        year={project.year}
        description={project.description}
      />

      {/* Image windows */}
      <div className="wa-project-images">
        {project.images.map((src, i) => (
          <div key={i} className="wa-image-window">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${project.title} — Bild ${i + 1}`}
              className="wa-project-img"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Prev / Next navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "4svh 4svw",
          borderTop: "1px solid #eee",
        }}
      >
        {prev ? (
          <Link href={`/projekte/${prev.slug}`} style={{ fontSize: "0.75rem", color: "#555", textDecoration: "none" }}>
            ← {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/projekte/${next.slug}`} style={{ fontSize: "0.75rem", color: "#555", textDecoration: "none" }}>
            {next.title} →
          </Link>
        ) : <span />}
      </div>
    </>
  );
}

"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProject } from "@/lib/api";
import type { Project } from "@/types/extraction";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id) fetchProject(id).then(setProject);
  }, [id]);

  if (!project) return <div className="p-8">Loading...</div>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
      <p className="text-gray-500">Studies: {project.studyCount}</p>
    </main>
  );
}

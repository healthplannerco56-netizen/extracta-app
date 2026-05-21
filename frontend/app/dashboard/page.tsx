"use client";
import { useEffect, useState } from "react";
import { fetchProjects } from "@/lib/api";
import type { Project } from "@/types/extraction";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects().then(setProjects);
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <ul className="space-y-3">
        {projects.map((p) => (
          <li key={p.id}>
            <a href={`/project/${p.id}`} className="text-blue-600 hover:underline">
              {p.name}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

import type { Project, Extraction, JobStatus } from "@/types/extraction";

const BASE = "/api";

export async function uploadPdf(file: File): Promise<{ jobId: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function pollJob(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${BASE}/jobs/${jobId}`);
  if (!res.ok) throw new Error("Poll failed");
  return res.json();
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${BASE}/projects`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`${BASE}/projects/${id}`);
  if (!res.ok) throw new Error("Project not found");
  return res.json();
}

export async function fetchExtraction(studyId: string): Promise<Extraction> {
  const res = await fetch(`${BASE}/extractions/${studyId}`);
  if (!res.ok) throw new Error("Extraction not found");
  return res.json();
}

export async function exportCsv(studyId: string): Promise<Blob> {
  const res = await fetch(`${BASE}/extractions/${studyId}/export`);
  if (!res.ok) throw new Error("Export failed");
  return res.blob();
}

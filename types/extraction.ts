export interface Project {
  id: string;
  name: string;
  studyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractionField {
  key: string;
  label: string;
  value: string | null;
  confidence: number;          // 0–1
  status: "pending" | "approved" | "rejected";
  source?: "text" | "table" | "ocr";
  pageNumber?: number;
}

export interface Extraction {
  studyId: string;
  projectId: string;
  pdfUrl: string;
  fields: ExtractionField[];
  extractedAt: string;
  validatedAt?: string;
}

export interface JobStatus {
  jobId: string;
  status: "queued" | "running" | "done" | "failed";
  progress?: number;           // 0–100
  studyId?: string;
  error?: string;
}

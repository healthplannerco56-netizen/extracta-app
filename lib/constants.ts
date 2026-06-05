export const APP_NAME = "Extracta";

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
} as const;

export const JOB_POLL_INTERVAL_MS = 2000;

export const MAX_PDF_SIZE_MB = 20;
export const MAX_PDF_TEXT_CHARS = 60_000;
export const MAX_PDF_PAGES = 50;

export const SUPPORTED_MIME_TYPES = ["application/pdf"];

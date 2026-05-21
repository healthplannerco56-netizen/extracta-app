"use client";
interface Props { studyId: string; }
export default function PdfViewer({ studyId }: Props) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
  return <iframe src={`${backendUrl}/api/pdf/${studyId}`} className="w-full h-full" title="PDF Viewer" />;
}

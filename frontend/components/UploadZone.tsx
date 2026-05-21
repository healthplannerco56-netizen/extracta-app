"use client";
import { useCallback, useState } from "react";
import { uploadPdf } from "@/lib/api";

export default function UploadZone() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || file.type !== "application/pdf") return;
    setUploading(true);
    try { await uploadPdf(file); } finally { setUploading(false); }
  }, []);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
        dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
      }`}
    >
      {uploading ? (
        <p className="text-gray-500">Uploading...</p>
      ) : (
        <>
          <p className="text-gray-600 font-medium">Drop PDF here</p>
          <p className="text-sm text-gray-400 mt-1">or click to browse</p>
        </>
      )}
    </div>
  );
}

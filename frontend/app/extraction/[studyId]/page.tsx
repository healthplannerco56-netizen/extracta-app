"use client";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useExtractionStore } from "@/store/extractionStore";
import ExtractionTable from "@/components/ExtractionTable";
import ValidationPanel from "@/components/ValidationPanel";
import PdfViewer from "@/components/PdfViewer";

export default function ExtractionPage() {
  const { studyId } = useParams<{ studyId: string }>();
  const { loadExtraction, extraction } = useExtractionStore();

  useEffect(() => {
    if (studyId) loadExtraction(studyId);
  }, [studyId, loadExtraction]);

  return (
    <div className="flex h-screen">
      <div className="w-1/2 border-r">
        <PdfViewer studyId={studyId as string} />
      </div>
      <div className="w-1/2 flex flex-col">
        <ExtractionTable />
        <ValidationPanel />
      </div>
    </div>
  );
}

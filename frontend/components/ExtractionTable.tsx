"use client";
import { useExtractionStore } from "@/store/extractionStore";
import ConfidenceBadge from "./ConfidenceBadge";

export default function ExtractionTable() {
  const { extraction } = useExtractionStore();
  if (!extraction) return <div className="p-4 text-gray-400">No extraction loaded.</div>;
  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Field</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Value</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {extraction.fields.map((f) => (
            <tr key={f.key} className="border-t">
              <td className="px-4 py-2 font-medium">{f.label}</td>
              <td className="px-4 py-2 text-gray-700">{f.value ?? "—"}</td>
              <td className="px-4 py-2"><ConfidenceBadge score={f.confidence} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";
import { useExtractionStore } from "@/store/extractionStore";

export default function ValidationPanel() {
  const { extraction, approveField, rejectField } = useExtractionStore();
  const pending = extraction?.fields.filter((f) => f.status === "pending") ?? [];

  if (pending.length === 0) return <div className="p-4 border-t text-sm text-gray-400">All fields validated.</div>;

  return (
    <div className="p-4 border-t space-y-2">
      <p className="text-sm font-medium text-gray-600">{pending.length} field(s) need review</p>
      {pending.map((f) => (
        <div key={f.key} className="flex items-center gap-2">
          <span className="flex-1 text-sm">{f.label}</span>
          <button onClick={() => approveField(f.key)} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
          <button onClick={() => rejectField(f.key)} className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Reject</button>
        </div>
      ))}
    </div>
  );
}

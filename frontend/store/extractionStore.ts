import { create } from "zustand";
import { fetchExtraction } from "@/lib/api";
import type { Extraction, ExtractionField } from "@/types/extraction";

interface ExtractionStore {
  extraction: Extraction | null;
  loading: boolean;
  error: string | null;
  loadExtraction: (studyId: string) => Promise<void>;
  approveField: (key: string) => void;
  rejectField: (key: string) => void;
  updateFieldValue: (key: string, value: string) => void;
}

export const useExtractionStore = create<ExtractionStore>((set, get) => ({
  extraction: null,
  loading: false,
  error: null,

  loadExtraction: async (studyId) => {
    set({ loading: true, error: null });
    try {
      const extraction = await fetchExtraction(studyId);
      set({ extraction, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  approveField: (key) => {
    const { extraction } = get();
    if (!extraction) return;
    set({
      extraction: {
        ...extraction,
        fields: extraction.fields.map((f) =>
          f.key === key ? { ...f, status: "approved" as const } : f
        ),
      },
    });
  },

  rejectField: (key) => {
    const { extraction } = get();
    if (!extraction) return;
    set({
      extraction: {
        ...extraction,
        fields: extraction.fields.map((f) =>
          f.key === key ? { ...f, status: "rejected" as const } : f
        ),
      },
    });
  },

  updateFieldValue: (key, value) => {
    const { extraction } = get();
    if (!extraction) return;
    set({
      extraction: {
        ...extraction,
        fields: extraction.fields.map((f) =>
          f.key === key ? { ...f, value } : f
        ),
      },
    });
  },
}));

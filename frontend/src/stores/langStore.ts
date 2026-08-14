import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "fr" | "en";

interface LangState {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: "fr", // French is the primary default language
      setLang: (lang) => set({ lang }),
      toggleLang: () => set((state) => ({ lang: state.lang === "fr" ? "en" : "fr" })),
    }),
    {
      name: "dedsec-lang",
    }
  )
);

"use client";

import { Plus } from "lucide-react";
import { useStudio } from "./StudioContext";
import type { StudioState } from "./TenantStudioView";

const TITLES: Record<string, string> = {
  "form-data":             "Data z formulářů",
  "contacts":              "Získané kontakty",
  "events":                "Přehled událostí",
  "events-people":         "Osoby",
  "events-person-types":   "Typy osob",
  "events-speaker-tags":   "Tagy vystoupení",
  "events-event-tags":     "Tagy událostí",
  "events-categories":     "Kategorie událostí",
};

function EmptyIllustration() {
  return (
    <div className="w-[280px] rounded-xl border border-gray-200 bg-white shadow-sm p-4">
      {/* 3 placeholder rows */}
      {[0.75, 0.55, 0.65].map((w, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="h-7 w-7 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-2 rounded bg-gray-200" style={{ width: `${w * 100}%` }} />
            <div className="h-2 rounded bg-gray-200" style={{ width: `${w * 60}%` }} />
          </div>
        </div>
      ))}
      {/* 4th row — blue accent (new record hint) */}
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </div>
        <div className="h-2 rounded bg-blue-200 w-1/2" />
      </div>
    </div>
  );
}

export function StudioModulesCanvas({ state: _state }: { state: StudioState }) {
  const studio = useStudio();
  const title = TITLES[studio.modulesView] ?? "Moduly";

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
        <h1 className="text-[22px] font-bold text-gray-900">{title}</h1>
        <button
          type="button"
          className="bg-[#2563eb] text-white rounded-lg px-4 py-2 text-[13.5px] font-semibold hover:bg-[#1d4ed8] transition-colors"
        >
          Nový záznam
        </button>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <EmptyIllustration />
        <p className="text-[14px] text-gray-500 text-center max-w-sm mt-6 leading-relaxed">
          Zdá se, že je zde prázdno. Začněte vytvořením prvního záznamu.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            className="bg-[#2563eb] text-white rounded-lg px-4 py-2 text-[13.5px] font-semibold hover:bg-[#1d4ed8] transition-colors"
          >
            Nový záznam
          </button>
          <button
            type="button"
            className="border border-gray-300 text-gray-600 rounded-lg px-4 py-2 text-[13.5px] font-medium hover:bg-gray-50 transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Plus } from "@/components/studio/icons";
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
    <div className="w-[280px] rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(24,24,27,0.68)] shadow-[0_18px_48px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-xl p-4">
      {/* 3 placeholder rows */}
      {[0.75, 0.55, 0.65].map((w, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="h-7 w-7 rounded-full bg-[var(--vs-surface-3)] shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-2 rounded bg-[var(--vs-surface-3)]" style={{ width: `${w * 100}%` }} />
            <div className="h-2 rounded bg-[var(--vs-surface-3)]" style={{ width: `${w * 60}%` }} />
          </div>
        </div>
      ))}
      {/* 4th row — blue accent (new record hint) */}
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-[var(--vs-accent-bg)] text-[var(--vs-accent)] flex items-center justify-center shrink-0">
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </div>
        <div className="h-2 rounded bg-[var(--vs-surface-3)] w-1/2" />
      </div>
    </div>
  );
}

export function StudioModulesCanvas({ state: _state }: { state: StudioState }) {
  const studio = useStudio();
  const title = TITLES[studio.modulesView] ?? "Moduly";

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[radial-gradient(900px_420px_at_50%_-80px,rgba(var(--vs-cta-rgb),0.10),transparent_65%),linear-gradient(180deg,rgba(12,12,14,0.92)_0%,rgba(18,18,20,0.86)_100%)]">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(255,255,255,0.09)] bg-[rgba(18,18,20,0.78)] px-8 py-4 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
        <h1 className="text-[22px] font-bold text-[var(--vs-text)]">{title}</h1>
        <button
          type="button"
          className="bg-[var(--vs-accent)] text-white rounded-lg px-4 py-2 text-[13.5px] font-semibold hover:bg-[var(--vs-accent-solid)] transition-colors"
        >
          Nový záznam
        </button>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <EmptyIllustration />
        <p className="text-[14px] text-[var(--vs-text-muted)] text-center max-w-sm mt-6 leading-relaxed">
          Zdá se, že je zde prázdno. Začněte vytvořením prvního záznamu.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            className="bg-[var(--vs-accent)] text-white rounded-lg px-4 py-2 text-[13.5px] font-semibold hover:bg-[var(--vs-accent-solid)] transition-colors"
          >
            Nový záznam
          </button>
          <button
            type="button"
            className="border border-[var(--vs-border-strong)] text-[var(--vs-text-soft)] rounded-lg px-4 py-2 text-[13.5px] font-medium hover:bg-[var(--vs-surface-2)] transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

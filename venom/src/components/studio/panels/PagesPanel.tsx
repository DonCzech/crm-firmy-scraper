"use client";

import { FileText, Plus } from "lucide-react";
import type { StudioState } from "../TenantStudioView";

export function PagesPanel({ state }: { state: StudioState }) {
  return (
    <div className="p-2">
      <div className="flex items-center gap-2 rounded-md bg-blue-500/10 px-2.5 py-2 text-xs ring-1 ring-inset ring-blue-500/40">
        <FileText className="h-3.5 w-3.5 text-blue-400" strokeWidth={1.75} />
        <span className="flex-1 text-white">{state.page.title}</span>
        <span className="text-[10px] uppercase tracking-wide text-blue-400">aktivní</span>
      </div>
      <button
        type="button"
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#3f3f46] px-2.5 py-2 text-xs text-[#a1a1aa] hover:border-blue-500/50 hover:text-white"
        aria-label="Nová stránka"
        title="Více stránek bude brzy dostupné"
        disabled
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
        Nová stránka
      </button>
      <p className="mt-3 px-1 text-[10.5px] leading-relaxed text-[#71717a]">
        Aktuálně jeden web — jedna stránka. Více stránek a podstránek brzy dorazí.
      </p>
    </div>
  );
}

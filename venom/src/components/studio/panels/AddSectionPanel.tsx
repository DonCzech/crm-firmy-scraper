"use client";

import { getSectionIcon, getSectionLabel } from "../studio-icons";
import type { StudioState } from "../TenantStudioView";
import { buildSectionLibrary } from "@/sections/variants";

const LIBRARY = buildSectionLibrary().filter(
  (e) => e.type !== "navbar" && e.type !== "footer" && e.type !== "full-page-clone" && e.type !== "astera-home"
);

export function AddSectionPanel({ state }: { state: StudioState }) {
  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {LIBRARY.map((item) => {
        const Icon = getSectionIcon(item.type);
        return (
          <button
            key={`${item.type}-${item.variant}`}
            type="button"
            onClick={() => void state.addSection(item.type, item.variant)}
            className="group flex flex-col items-start gap-1.5 rounded-md border border-[#27272a] bg-[#1a1a1c] p-2.5 text-left text-xs transition-colors duration-150 hover:border-blue-500/50 hover:bg-[#1f1f22]"
            aria-label={`Přidat ${getSectionLabel(item.type)}`}
            title={`Přidat ${getSectionLabel(item.type)}`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#27272a] text-[#a1a1aa] group-hover:bg-blue-500/10 group-hover:text-blue-400">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="text-[12px] font-medium text-white">{item.label}</div>
            <div className="text-[10.5px] text-[#71717a]">{item.description}</div>
          </button>
        );
      })}
    </div>
  );
}

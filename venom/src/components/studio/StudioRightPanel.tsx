"use client";

import { useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { useStudio } from "./StudioContext";
import { getSectionLabel } from "./studio-icons";
import { EmptySelectionState } from "./EmptySelectionState";
import { ContentInspectorTab } from "./inspector/ContentInspectorTab";
import { StyleInspectorTab } from "./inspector/StyleInspectorTab";
import { LayoutInspectorTab } from "./inspector/LayoutInspectorTab";
import { CloneInspector } from "./CloneInspector";
import type { StudioState } from "./TenantStudioView";

type Tab = "content" | "style" | "layout";

export function StudioRightPanel({ state }: { state: StudioState }) {
  const studio = useStudio();
  const [tab, setTab] = useState<Tab>("content");
  const section = state.sections.find(s => s.id === studio.selectedSectionId) ?? null;
  const cloneSelected = studio.cloneSelected;
  const isClonePanel = !!cloneSelected;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 items-center gap-2 border-b border-[#27272a] px-3">
        {isClonePanel && cloneSelected ? (
          <>
            <span className="truncate text-xs font-semibold text-white">{`<${cloneSelected.tag}>`}</span>
            <span className="truncate text-[10.5px] text-[#71717a]">{cloneSelected.text.slice(0, 24) || cloneSelected.src?.split("/").pop() || ""}</span>
          </>
        ) : section ? (
          <>
            <span className="truncate text-xs font-semibold text-white">{getSectionLabel(section.section_type)}</span>
            <span className="truncate text-[10.5px] text-[#71717a]">#{section.id}</span>
          </>
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a1a1aa]">Inspektor</span>
        )}
        <div className="ml-auto" />
        <button
          type="button"
          aria-label="Zavřít"
          title="Zavřít"
          onClick={() => studio.setRightPanel(false)}
          className="rounded p-1 text-[#71717a] hover:bg-[#27272a] hover:text-white"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
      {isClonePanel && cloneSelected ? (
        <div className="flex-1 overflow-y-auto">
          <CloneInspector selected={cloneSelected} />
        </div>
      ) : section ? (
        <>
          <div className="flex border-b border-[#27272a] bg-[#0f0f10] px-1">
            {(["content", "style", "layout"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={clsx(
                  "relative flex-1 px-2 py-2 text-[11px] font-medium uppercase tracking-wide transition-colors duration-150",
                  tab === t ? "text-white" : "text-[#71717a] hover:text-[#d4d4d8]"
                )}
              >
                {t === "content" ? "Obsah" : t === "style" ? "Styl" : "Layout"}
                {tab === t && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-t bg-blue-500" />}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {tab === "content" && <ContentInspectorTab section={section} state={state} />}
            {tab === "style" && <StyleInspectorTab section={section} state={state} />}
            {tab === "layout" && <LayoutInspectorTab section={section} state={state} />}
          </div>
        </>
      ) : (
        <EmptySelectionState />
      )}
    </div>
  );
}

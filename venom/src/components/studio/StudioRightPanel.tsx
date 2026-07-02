"use client";

import { useState } from "react";
import type React from "react";
import { X } from "@/components/studio/icons";
import clsx from "clsx";
import { useStudio } from "./StudioContext";
import { getSectionLabel } from "./studio-icons";
import { EmptySelectionState } from "./EmptySelectionState";
import { ContentInspectorTab } from "./inspector/ContentInspectorTab";
import { StyleInspectorTab } from "./inspector/StyleInspectorTab";
import { LayoutInspectorTab } from "./inspector/LayoutInspectorTab";
import { CloneInspector } from "./CloneInspector";
import { HeroInspectorPanel } from "./inspector/HeroInspectorPanel";
import { GalleryInspectorPanel } from "./inspector/GalleryInspectorPanel";
import { Pill, IconButton } from "./ui";
import type { StudioState } from "./TenantStudioView";

type Tab = "content" | "style" | "layout";

export function StudioRightPanel({
  state,
  onStartDrag,
  isFloating,
}: {
  state: StudioState;
  onStartDrag?: (e: React.PointerEvent<HTMLElement>) => void;
  isFloating?: boolean;
}) {
  const studio = useStudio();
  const [tab, setTab] = useState<Tab>("content");
  const section = state.sections.find(s => s.id === studio.selectedSectionId) ?? null;
  const cloneSelected = studio.cloneSelected;
  const isClonePanel = !!cloneSelected;

  return (
    <div className="flex h-full flex-col vs-enter">
      <header
        className={`flex h-11 shrink-0 items-center gap-2 border-b border-[rgba(255,255,255,0.09)] bg-[rgba(18,18,20,0.62)] px-3 backdrop-blur-xl select-none ${onStartDrag ? "cursor-grab active:cursor-grabbing" : ""}`}
        onPointerDown={onStartDrag}
      >
        {isClonePanel && cloneSelected ? (
          <>
            <Pill tone="accent" size="xs">{`<${cloneSelected.tag}>`}</Pill>
            <span className="truncate text-[11px] text-[var(--vs-text-muted)]">
              {cloneSelected.text.slice(0, 28) || cloneSelected.src?.split("/").pop() || ""}
            </span>
          </>
        ) : section ? (
          <>
            <span className="truncate text-[12.5px] font-semibold tracking-tight text-[var(--vs-text)]">
              {getSectionLabel(section.section_type, section.section_variant)}
            </span>
            <Pill tone="neutral" size="xs">#{section.id}</Pill>
          </>
        ) : (
          <span className="text-[10.5px] font-semibold uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">
            Inspektor
          </span>
        )}
        <div className="ml-auto" />
        <IconButton
          size="xs"
          label="Zavřít panel"
          onClick={() => studio.setRightPanel(false)}
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </IconButton>
      </header>

      {isClonePanel && cloneSelected ? (
        <div className="flex-1 overflow-y-auto vs-scroll">
          <CloneInspector selected={cloneSelected} />
        </div>
      ) : section ? (
        section.section_type === "hero" ? (
          <div className="flex-1 min-h-0 overflow-hidden">
            <HeroInspectorPanel section={section} state={state} />
          </div>
        ) : (section.section_type === "gallery" || Array.isArray((section.settings?.content as Record<string, unknown> | undefined)?.images)) ? (
          <div className="flex-1 min-h-0 overflow-hidden">
            <GalleryInspectorPanel section={section} state={state} />
          </div>
        ) : (
        <>
          <div className="flex shrink-0 border-b border-[rgba(255,255,255,0.09)] bg-[rgba(18,18,20,0.48)] px-1 backdrop-blur-xl">
            {(["content", "style", "layout"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={clsx(
                  "relative flex-1 px-2 py-2.5 text-[10.5px] font-semibold uppercase tracking-[var(--vs-tracking-wider)] transition-colors duration-150 vs-focus-ring",
                  tab === t
                    ? "text-[var(--vs-text)]"
                    : "text-[var(--vs-text-muted)] hover:text-[var(--vs-text-soft)]"
                )}
              >
                {t === "content" ? "Obsah" : t === "style" ? "Styl" : "Layout"}
                {tab === t && (
                  <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-t bg-[var(--vs-accent-hi)] shadow-[0_0_8px_var(--vs-accent-ring)]" />
                )}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto vs-scroll">
            {tab === "content" && <ContentInspectorTab section={section} state={state} />}
            {tab === "style"   && <StyleInspectorTab   section={section} state={state} />}
            {tab === "layout"  && <LayoutInspectorTab  section={section} state={state} />}
          </div>
        </>
        )
      ) : (
        <EmptySelectionState />
      )}
    </div>
  );
}

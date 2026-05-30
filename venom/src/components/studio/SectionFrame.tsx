"use client";

import { useStudio } from "./StudioContext";
import { ArrowUp, ArrowDown, Copy, Trash2 } from "lucide-react";
import clsx from "clsx";
import { getSectionLabel } from "./studio-icons";
import type { Section } from "@/lib/db";
import type { StudioState } from "./TenantStudioView";
import type { ReactNode } from "react";

export function SectionFrame({
  section, state, children,
}: {
  section: Section;
  state: StudioState;
  children: ReactNode;
}) {
  const studio = useStudio();
  const selected = studio.selectedSectionId === section.id;
  const hover = studio.hoverSectionId === section.id;
  const label = getSectionLabel(section.section_type);

  const sorted = [...state.sections].sort((a, b) => a.order_index - b.order_index);
  const idx = sorted.findIndex(s => s.id === section.id);
  const canUp = idx > 0 && sorted[idx - 1].section_type !== "navbar";
  const canDown = idx < sorted.length - 1 && sorted[idx + 1].section_type !== "footer";

  function move(dir: -1 | 1) {
    const ids = sorted.map(s => s.id);
    const other = idx + dir;
    if (other < 0 || other >= ids.length) return;
    [ids[idx], ids[other]] = [ids[other], ids[idx]];
    void state.reorderSections(ids);
  }

  return (
    <div
      data-section-frame
      data-section-id={section.id}
      className="relative"
      onMouseEnter={() => studio.setHoverSectionId(section.id)}
      onMouseLeave={() => { if (studio.hoverSectionId === section.id) studio.setHoverSectionId(null); }}
      onClickCapture={(e) => {
        // Don't take selection if user clicked an editable inner element
        const t = e.target as HTMLElement;
        if (t.isContentEditable) return;
        if (t.closest("[contenteditable='true']")) return;
        if (t.closest("input,textarea,select,button,a")) return;
        studio.setSelection(section.id);
      }}
    >
      {children}
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 transition-colors duration-150",
          selected && "ring-2 ring-inset ring-blue-500",
          !selected && hover && "ring-1 ring-inset ring-blue-400/40"
        )}
      />
      {(selected || hover) && (
        <div className="pointer-events-none absolute left-0 top-0 z-10 flex">
          <span className={clsx(
            "rounded-br-md px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-white",
            selected ? "bg-blue-600" : "bg-blue-400/80"
          )}>
            {label}
          </span>
        </div>
      )}
      {selected && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-md border border-[#27272a] bg-[#141416]/95 p-0.5 shadow-lg backdrop-blur">
          <FrameBtn label="Posunout nahoru" disabled={!canUp} onClick={() => move(-1)}>
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
          </FrameBtn>
          <FrameBtn label="Posunout dolů" disabled={!canDown} onClick={() => move(1)}>
            <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
          </FrameBtn>
          <FrameBtn label="Duplikovat" onClick={() => void state.duplicateSection(section.id)}>
            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
          </FrameBtn>
          <FrameBtn label="Smazat" onClick={() => void state.deleteSection(section.id)} danger>
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </FrameBtn>
        </div>
      )}
    </div>
  );
}

function FrameBtn({
  children, label, onClick, disabled, danger,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(); }}
      disabled={disabled}
      className={clsx(
        "inline-flex h-6 w-6 items-center justify-center rounded text-[#a1a1aa] transition-colors duration-150 hover:bg-[#27272a]",
        danger ? "hover:text-red-400" : "hover:text-white",
        disabled && "opacity-30 hover:bg-transparent"
      )}
    >
      {children}
    </button>
  );
}

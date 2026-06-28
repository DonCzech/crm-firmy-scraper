"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import clsx from "clsx";
import { buildSectionLibrary } from "@/sections/variants";
import { getSectionIcon, getSectionLabel } from "./studio-icons";
import type { StudioState } from "./TenantStudioView";

const LIBRARY = buildSectionLibrary().filter(
  (e) =>
    e.type !== "navbar" &&
    e.type !== "footer" &&
    e.type !== "full-page-clone" &&
    e.type !== "astera-home"
);

export function InsertionGap({
  insertAtIndex,
  state,
}: {
  insertAtIndex: number;
  state: StudioState;
}) {
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!popoverRef.current) return;
      if (popoverRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function dropSection(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const raw = e.dataTransfer.getData("text/x-venom-section");
    if (!raw) return;
    try {
      const { type, variant } = JSON.parse(raw) as { type: string; variant: string };
      void state.addSection(type, variant ?? "default", insertAtIndex);
    } catch { /* malformed drag data — ignore */ }
  }

  return (
    <div
      className={clsx(
        "group relative z-20 select-none transition-[height,background] duration-150",
        dragOver ? "h-20 bg-blue-500/10" : "h-3 hover:h-5"
      )}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setDragOver(true); }}
      onDragLeave={(e) => {
        // only clear when leaving the gap element itself (not a child)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
      }}
      onDrop={dropSection}
    >
      {/* Drop indicator line */}
      <div
        className={clsx(
          "absolute inset-x-0 top-1/2 -translate-y-1/2 transition-all duration-150",
          dragOver
            ? "h-0.5 bg-blue-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.5)]"
            : "h-px bg-transparent group-hover:bg-blue-500/60"
        )}
      />

      {/* Drop label */}
      {dragOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white shadow-lg">
            Pustit sem
          </span>
        </div>
      )}

      {/* Centered + button (click to open popup) */}
      {!dragOver && (
        <button
          type="button"
          aria-label="Přidat sekci sem"
          title="Přidat sekci sem"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className={clsx(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg",
            "transition-opacity duration-150",
            open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      )}

      {open && (
        <div
          ref={popoverRef}
          className="absolute left-1/2 top-full z-30 mt-2 w-[440px] max-w-[90vw] -translate-x-1/2 rounded-lg border border-[#27272a] bg-[#141416] p-3 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-wide text-[#a1a1aa]">
              Přidat sekci na pozici #{insertAtIndex + 1}
            </div>
            <button
              type="button"
              aria-label="Zavřít"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
          <div className="grid max-h-[400px] grid-cols-2 gap-2 overflow-y-auto">
            {LIBRARY.map((item) => {
              const Icon = getSectionIcon(item.type);
              return (
                <button
                  key={`${item.type}-${item.variant}`}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void state.addSection(item.type, item.variant, insertAtIndex);
                  }}
                  className="group/btn flex flex-col items-start gap-1.5 rounded-md border border-[#27272a] bg-[#1a1a1c] p-2.5 text-left text-xs transition-colors duration-150 hover:border-blue-500/50 hover:bg-[#1f1f22]"
                  aria-label={`Přidat ${getSectionLabel(item.type)}`}
                  title={`Přidat ${getSectionLabel(item.type)}`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-[#27272a] text-[#a1a1aa] group-hover/btn:bg-blue-500/10 group-hover/btn:text-blue-400">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="text-[12px] font-medium text-white">{item.label}</div>
                  <div className="text-[10.5px] leading-snug text-[#71717a]">{item.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

/**
 * Wix-style drag-to-reorder modal for the current page's sections.
 *
 * Triggered by the "Změnit pořadí" action in SecondaryActionBar. Mirrors
 * the visual language of WixAddOverlay (white surface, soft shadow,
 * rounded corners) so the editor's modal vocabulary stays consistent.
 *
 * Behaviour:
 *  - Navbar locked at the top, footer locked at the bottom (greyed out
 *    with a lock icon, not draggable).
 *  - All other sections are draggable cards using @dnd-kit/sortable
 *    (same library that powers in-canvas reorder).
 *  - "Uložit pořadí" commits via state.reorderSections(ids); "Resetovat"
 *    restores the order as it was when the modal opened.
 */

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, GripVertical, Lock, RotateCcw, Check } from "lucide-react";
import clsx from "clsx";
import {
  DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { StudioState } from "../TenantStudioView";
import type { Section } from "@/lib/db";
import { getSectionLabel } from "../studio-icons";

interface Props {
  open: boolean;
  onClose: () => void;
  state: StudioState;
}

function labelFor(s: Section): string {
  const settings = s.settings as { customLabel?: string } | undefined;
  if (settings?.customLabel) return settings.customLabel;
  return getSectionLabel(s.section_type, s.section_variant);
}

export function ReorderSectionsModal({ open, onClose, state }: Props) {
  // Snapshot the initial order so "Reset" can restore.
  const initial = useMemo(() => state.sections.map(s => s.id), [state.sections, open]);
  const [order, setOrder] = useState<number[]>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setOrder(initial); }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  if (!open) return null;

  const byId = new Map(state.sections.map(s => [s.id, s]));
  const sections = order.map(id => byId.get(id)).filter((s): s is Section => !!s);

  const navbar  = sections.find(s => s.section_type === "navbar") ?? null;
  const footer  = sections.find(s => s.section_type === "footer") ?? null;
  const middle  = sections.filter(s => s.section_type !== "navbar" && s.section_type !== "footer");

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = middle.map(s => s.id);
    const from = ids.indexOf(Number(active.id));
    const to   = ids.indexOf(Number(over.id));
    if (from < 0 || to < 0) return;
    const reordered = arrayMove(ids, from, to);
    // Rebuild full order: navbar (if any) → reordered middle → footer (if any)
    const next: number[] = [];
    if (navbar) next.push(navbar.id);
    next.push(...reordered);
    if (footer) next.push(footer.id);
    setOrder(next);
  }

  const dirty = order.join(",") !== initial.join(",");

  async function save() {
    if (!dirty) { onClose(); return; }
    setSaving(true);
    try {
      await state.reorderSections(order);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function reset() { setOrder(initial); }

  return createPortal(
    <div
      role="dialog"
      aria-modal
      aria-label="Změnit pořadí sekcí"
      className="fixed inset-0 z-[10002] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(8,10,14,0.55)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />
      <div className="relative flex w-[560px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] flex-col rounded-2xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#f1f5f9] px-6 py-4">
          <div>
            <h2 className="text-[17px] font-bold text-[#0f172a]">Změnit pořadí sekcí</h2>
            <p className="mt-0.5 text-[12.5px] text-[#64748b]">Podržte a táhněte sekce. Záhlaví a zápatí jsou ukotveny.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít"
            className="rounded-lg p-1.5 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
          >
            <X size={18} />
          </button>
        </header>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-2">
            {navbar && <LockedRow label={labelFor(navbar)} caption="Záhlaví — vždy nahoře" />}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={middle.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {middle.map((s, idx) => (
                  <SortableRow key={s.id} id={s.id} label={labelFor(s)} index={idx + 1} />
                ))}
              </SortableContext>
            </DndContext>
            {footer && <LockedRow label={labelFor(footer)} caption="Zápatí — vždy dole" />}
            {middle.length === 0 && !navbar && !footer && (
              <p className="py-8 text-center text-[13px] text-[#94a3b8]">Stránka nemá žádné sekce.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-[#f1f5f9] bg-[#fafbfc] px-6 py-4">
          <button
            type="button"
            onClick={reset}
            disabled={!dirty}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors",
              dirty
                ? "border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#cbd5e1]"
                : "border-[#e2e8f0] bg-white text-[#cbd5e1] cursor-not-allowed",
            )}
          >
            <RotateCcw size={14} strokeWidth={2.25} />
            Resetovat
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-[13px] font-semibold text-[#475569] hover:bg-[#f1f5f9]"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-colors",
                saving ? "bg-[#86efac]" : "bg-[#16a34a] hover:bg-[#15803d]",
              )}
            >
              <Check size={14} strokeWidth={2.5} />
              {saving ? "Ukládám…" : dirty ? "Uložit pořadí" : "Hotovo"}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function LockedRow({ label, caption }: { label: string; caption: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl bg-[#eff6ff] px-4 py-3 ring-1 ring-[#dbeafe]"
      title={caption}
    >
      <Lock size={14} strokeWidth={2} className="text-[var(--vs-accent)]" />
      <span className="flex-1 text-[14px] font-semibold text-[#1e3a8a]">{label}</span>
      <span className="text-[11px] text-[var(--vs-accent)]">{caption}</span>
    </div>
  );
}

function SortableRow({ id, label, index }: { id: number; label: string; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group flex items-center gap-3 rounded-xl border bg-white px-4 py-3 select-none transition-shadow",
        isDragging
          ? "border-[var(--vs-accent)] shadow-[0_10px_30px_rgba(20,184,166,0.25)] z-10"
          : "border-[#e2e8f0] hover:border-[#cbd5e1] shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Táhnout pro přesun"
        className="flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#475569] active:cursor-grabbing"
      >
        <GripVertical size={16} strokeWidth={1.75} />
      </button>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#f1f5f9] text-[11px] font-bold text-[#64748b]">
        {index}
      </span>
      <span className="flex-1 text-[14px] font-medium text-[#0f172a] truncate">{label}</span>
    </div>
  );
}

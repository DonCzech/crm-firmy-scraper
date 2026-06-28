"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Eye, EyeOff, MoreHorizontal, GripVertical,
  Copy, Trash2, Layout, Layers as LayersIcon, X,
} from "lucide-react";
import clsx from "clsx";
import { useStudio } from "../StudioContext";
import { getSectionIcon, getSectionLabel } from "../studio-icons";
import { GROUPS } from "./AddSectionPanel";
import type { StudioState } from "../TenantStudioView";
import type { Section } from "@/lib/db";
import { extractCloneSubLayers, type CloneSubLayer } from "@/lib/clone-sublayers";

function scrollToSection(sectionId: number) {
  const el = document.querySelector(`[data-section-id="${sectionId}"]`) as HTMLElement | null;
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  // Brief highlight flash so the user sees which section was jumped to
  const prev = el.style.outline;
  el.style.outline = "2px solid rgba(59,130,246,0.7)";
  el.style.outlineOffset = "2px";
  setTimeout(() => { el.style.outline = prev; el.style.outlineOffset = ""; }, 900);
}

export interface PendingSection { type: string; variant: string; label: string }

/* ── InsertSlot — thin clickable band between rows in insert mode ───────── */
function InsertSlot({ index, onInsert }: { index: number; onInsert: (at: number) => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="relative z-10 flex cursor-pointer items-center px-2 transition-[height] duration-100"
      style={{ height: hover ? 32 : 10 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onInsert(index)}
    >
      <div className={clsx(
        "flex w-full items-center gap-2 transition-opacity duration-100",
        hover ? "opacity-100" : "opacity-0"
      )}>
        <div className="h-px flex-1 bg-blue-500" />
        <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">
          Vložit sem
        </span>
        <div className="h-px flex-1 bg-blue-500" />
      </div>
      {!hover && (
        <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-white/[0.05]" />
      )}
    </div>
  );
}

/* ── LayersPopup ────────────────────────────────────────────────────────── */
function LayersPopup({ state, onClose, pending }: { state: StudioState; onClose: () => void; pending?: PendingSection }) {
  const studio = useStudio();
  const sorted = [...state.sections].sort((a, b) => a.order_index - b.order_index);
  const navbar  = sorted.filter(s => s.section_type === "navbar");
  const footer  = sorted.filter(s => s.section_type === "footer");
  const middle  = sorted.filter(s => s.section_type !== "navbar" && s.section_type !== "footer" && s.section_type !== "full-page-clone");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = middle.map(s => s.id);
    const oldIdx = ids.indexOf(Number(active.id));
    const newIdx = ids.indexOf(Number(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = [...ids];
    reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, Number(active.id));
    const fullOrder = [...navbar.map(s => s.id), ...reordered, ...footer.map(s => s.id)];
    void state.reorderSections(fullOrder);
  };

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isInsert = !!pending;

  function doInsert(atIndex: number) {
    void state.addSection(pending!.type, pending!.variant, atIndex);
    onClose();
  }

  // In insert mode the index runs across ALL sorted sections (navbar + middle + footer).
  // We only allow inserting into the "middle" zone (after navbar, before footer).
  const navbarCount = navbar.length;
  const middleStartIndex = navbarCount; // first insertable position

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed left-[275px] top-1/2 z-[201] -translate-y-1/2 w-[300px] rounded-2xl border border-white/[0.08] bg-[#0f0f11] shadow-[0_32px_80px_-8px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)] flex flex-col overflow-hidden"
        style={{ maxHeight: "min(680px, 85vh)" }}
      >
        {/* Header */}
        <div className={clsx(
          "flex items-center justify-between px-5 py-4 border-b border-white/[0.07]",
          isInsert && "bg-blue-950/40"
        )}>
          <div className="flex items-center gap-2.5">
            <LayersIcon className={clsx("h-4 w-4", isInsert ? "text-blue-400" : "text-[#60a5fa]")} strokeWidth={1.75} />
            <div>
              <div className="text-[14px] font-semibold text-white tracking-[-0.01em]">
                {isInsert ? "Kam vložit?" : "Pořadí sekcí"}
              </div>
              {isInsert && (
                <div className="text-[11px] text-blue-400/80 mt-0.5">
                  {pending.label} — najeď na mezeru a klikni
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#71717a] hover:bg-white/[0.08] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Section list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 vs-scroll">

          {/* Navbar rows (locked, no insert above/between them) */}
          {navbar.map(s => (
            <PopupRow
              key={s.id}
              section={s}
              selected={studio.selectedSectionId === s.id}
              onSelect={() => { if (!isInsert) { studio.setSelection(s.id); scrollToSection(s.id); onClose(); } }}
              state={state}
              locked
              dimmed={isInsert}
            />
          ))}

          {/* Insert slot: before first middle section (after navbar) */}
          {isInsert && (
            <InsertSlot index={middleStartIndex} onInsert={doInsert} />
          )}

          {!isInsert && navbar.length > 0 && (
            <div className="my-1 mx-2 h-px bg-white/[0.06]" />
          )}

          {/* Middle sections — draggable in normal mode, insert slots between in insert mode */}
          {isInsert ? (
            middle.map((s, i) => (
              <div key={s.id}>
                <PopupRow
                  section={s}
                  selected={false}
                  onSelect={() => {}}
                  state={state}
                  dimmed
                />
                <InsertSlot index={middleStartIndex + i + 1} onInsert={doInsert} />
              </div>
            ))
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={middle.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {middle.map(s => (
                  <PopupSortableRow
                    key={s.id}
                    section={s}
                    selected={studio.selectedSectionId === s.id}
                    onSelect={() => { studio.setSelection(s.id); scrollToSection(s.id); onClose(); }}
                    state={state}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {/* Footer rows */}
          {!isInsert && footer.length > 0 && (
            <div className="my-1 mx-2 h-px bg-white/[0.06]" />
          )}
          {footer.map(s => (
            <PopupRow
              key={s.id}
              section={s}
              selected={studio.selectedSectionId === s.id}
              onSelect={() => { if (!isInsert) { studio.setSelection(s.id); scrollToSection(s.id); onClose(); } }}
              state={state}
              locked
              dimmed={isInsert}
            />
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-white/[0.06] px-4 py-2.5">
          <p className="text-[11px] text-[#4b5563]">
            {isInsert ? "Klikni na modrou linku pro vložení" : "Přetáhni sekce pro změnu pořadí"}
          </p>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ── PopupRow ────────────────────────────────────────────────────────────── */
function PopupRow({
  section, selected, onSelect, state, locked, dimmed, dragHandle,
}: {
  section: Section;
  selected: boolean;
  onSelect: () => void;
  state: StudioState;
  locked?: boolean;
  dimmed?: boolean;
  dragHandle?: React.ReactNode;
}) {
  const Icon = getSectionIcon(section.section_type);
  const label = getSectionLabel(section.section_type, section.section_variant);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    function out(e: MouseEvent) {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenu(false);
    }
    document.addEventListener("mousedown", out);
    return () => document.removeEventListener("mousedown", out);
  }, [menu]);

  return (
    <div
      onClick={onSelect}
      className={clsx(
        "group relative flex h-10 items-center gap-2 rounded-xl px-2 text-[13px] transition-colors duration-100",
        dimmed ? "cursor-default opacity-40" : "cursor-pointer",
        !dimmed && selected
          ? "bg-[rgba(59,130,246,0.15)] text-white ring-1 ring-inset ring-[rgba(59,130,246,0.3)]"
          : "text-[#a1a1aa] hover:bg-white/[0.06] hover:text-white",
        !section.is_visible && "opacity-40"
      )}
    >
      {/* Drag handle or spacer */}
      {dragHandle ?? <span className="h-4 w-4 shrink-0" />}

      {/* Section icon */}
      <div className={clsx(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
        selected ? "bg-[rgba(59,130,246,0.25)]" : "bg-white/[0.06]"
      )}>
        <Icon className={clsx("h-3.5 w-3.5", selected ? "text-[#60a5fa]" : "text-[#71717a]")} strokeWidth={1.75} />
      </div>

      {/* Label */}
      <span className={clsx(
        "flex-1 truncate font-medium",
        !section.is_visible && "line-through decoration-[#4b5563]"
      )}>
        {label}
      </span>

      {/* Locked badge */}
      {locked && (
        <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[#4b5563]">
          fixní
        </span>
      )}

      {/* Actions (visible on hover) */}
      {!locked && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-100 group-hover:opacity-100">
          <button
            type="button"
            aria-label={section.is_visible ? "Skrýt" : "Zobrazit"}
            onClick={(e) => { e.stopPropagation(); void state.patchSection(section.id, { is_visible: !section.is_visible }); }}
            className={clsx(
              "rounded-md p-1 transition-colors hover:bg-white/[0.1]",
              !section.is_visible ? "text-amber-400" : "text-[#6b7280] hover:text-white"
            )}
          >
            {section.is_visible ? <Eye className="h-3.5 w-3.5" strokeWidth={1.75} /> : <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />}
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Více"
              onClick={(e) => { e.stopPropagation(); setMenu(m => !m); }}
              className="rounded-md p-1 text-[#6b7280] transition-colors hover:bg-white/[0.1] hover:text-white"
            >
              <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-[210]" onClick={(e) => { e.stopPropagation(); setMenu(false); }} />
                <div className="absolute right-0 top-full z-[211] mt-1 w-40 rounded-xl border border-white/[0.08] bg-[#18181b] py-1.5 shadow-2xl">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenu(false); void state.duplicateSection(section.id); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-[#a1a1aa] hover:bg-white/[0.06] hover:text-white"
                  >
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.75} /> Duplikovat
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenu(false); void state.deleteSection(section.id); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-red-400 hover:bg-white/[0.06] hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Smazat
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PopupSortableRow(props: { section: Section; selected: boolean; onSelect: () => void; state: StudioState }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.section.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
    >
      <PopupRow
        {...props}
        dragHandle={
          <button
            {...attributes}
            {...listeners}
            type="button"
            aria-label="Přesunout"
            onClick={(e) => e.stopPropagation()}
            className="flex h-4 w-4 shrink-0 cursor-grab items-center justify-center text-[#3f3f46] hover:text-[#71717a] active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" strokeWidth={1.75} />
          </button>
        }
      />
    </div>
  );
}

/* ── LayersPanel (main export) ────────────────────────────────────────────── */
export function LayersPanel({ state }: { state: StudioState }) {
  const studio = useStudio();
  const [popupOpen, setPopupOpen] = useState(false);
  const [pending, setPending] = useState<PendingSection | undefined>(undefined);

  function openInsert(type: string, variant: string, label: string) {
    setPending({ type, variant, label });
    setPopupOpen(true);
  }

  function closePopup() {
    setPopupOpen(false);
    setPending(undefined);
  }

  const sorted = [...state.sections].sort((a, b) => a.order_index - b.order_index);
  const clone = sorted.find(s => s.section_type === "full-page-clone");

  // Full-page-clone tenant — minimal view
  if (clone) {
    const html = (clone.settings as { html?: string } | undefined)?.html ?? "";
    const subLayers = extractCloneSubLayers(html);
    return (
      <div className="p-2">
        <div
          onClick={() => { studio.setSelection(clone.id); studio.setCloneScrollTarget(null); }}
          className={clsx(
            "flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-xs",
            studio.selectedSectionId === clone.id && !studio.cloneScrollTarget
              ? "bg-[var(--vs-accent-bg)] text-[var(--vs-text)] ring-1 ring-inset ring-[var(--vs-accent-ring)]"
              : "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
          )}
        >
          <Layout className="h-3.5 w-3.5 text-[var(--vs-text-muted)]" />
          <span className="truncate flex-1">Celá stránka (klon)</span>
        </div>
        {subLayers.length > 0 && (
          <>
            <div className="mt-2 mb-1 px-1.5 text-[10px] uppercase tracking-wider text-[var(--vs-text-muted)]">
              Sekce ({subLayers.length})
            </div>
            {subLayers.map((sl: CloneSubLayer) => (
              <CloneSubLayerRow
                key={sl.key}
                layer={sl}
                selected={studio.cloneScrollTarget === sl.selector}
                onSelect={() => {
                  studio.setSelection(clone.id);
                  studio.setCloneScrollTarget(sl.selector);
                  studio.cloneCommand?.({ type: "selectBySelector", selector: sl.selector });
                }}
              />
            ))}
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Add section grids — full remaining height */}
        <div className="flex-1 overflow-y-auto vs-scroll">
          {GROUPS.map((group) => (
            <div key={group.title} className="px-3 pt-3 pb-2">
              <p className="mb-2 text-[10px] font-bold tracking-[0.12em] text-[var(--vs-text-dim)] uppercase px-1">
                {group.title}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {group.items.map((item, i) => (
                  <button
                    key={`${item.sectionType}-${item.label}-${i}`}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "text/x-venom-section",
                        JSON.stringify({ type: item.sectionType, variant: item.variant ?? "default" })
                      );
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => openInsert(item.sectionType, item.variant ?? "default", item.label)}
                    className="group flex flex-col items-center gap-1.5 rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-2 py-3 transition-[border-color,background] duration-100 hover:border-[rgba(59,130,246,0.45)] hover:bg-[var(--vs-surface-2)] focus:outline-none cursor-grab active:cursor-grabbing"
                    aria-label={item.label}
                  >
                    <span className="text-[var(--vs-text-muted)] transition-colors duration-100 group-hover:text-[var(--vs-text-soft)]">
                      <item.Icon />
                    </span>
                    <span className="text-[11px] font-medium text-[var(--vs-text-muted)] group-hover:text-[var(--vs-text-soft)] leading-none transition-colors duration-100">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="h-3" />
        </div>

        {/* Pořadí sekcí button */}
        <div className="shrink-0 border-t border-[var(--vs-border)] p-2">
          <button
            type="button"
            onClick={() => { setPending(undefined); setPopupOpen(true); }}
            className="flex w-full items-center gap-2 rounded-xl border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-3 py-2.5 text-[12px] font-medium text-[var(--vs-text-muted)] transition-[border-color,background,color] duration-100 hover:border-[rgba(59,130,246,0.35)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-soft)]"
          >
            <LayersIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span className="flex-1 text-left">Pořadí sekcí</span>
            <span className="rounded-full bg-[var(--vs-surface-3)] px-1.5 py-0.5 text-[10px] text-[var(--vs-text-dim)]">
              {state.sections.length}
            </span>
          </button>
        </div>
      </div>

      {popupOpen && <LayersPopup state={state} onClose={closePopup} pending={pending} />}
    </>
  );
}

function CloneSubLayerRow({
  layer, selected, onSelect,
}: {
  layer: CloneSubLayer;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={clsx(
        "flex h-7 cursor-pointer items-center gap-1.5 rounded-md pl-5 pr-1.5 text-xs",
        selected
          ? "bg-[var(--vs-accent-bg)] text-[var(--vs-text)] ring-1 ring-inset ring-[var(--vs-accent-ring)]"
          : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
      )}
    >
      <LayersIcon className="h-3 w-3 text-[var(--vs-text-dim)]" />
      <span className="truncate">{layer.label}</span>
      <span className="ml-auto text-[10px] text-[var(--vs-text-dim)] font-mono">{layer.tag}</span>
    </div>
  );
}

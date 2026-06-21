"use client";

import { useState } from "react";
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
import { Eye, EyeOff, MoreHorizontal, GripVertical, Copy, Trash2, Layout, Layers as LayersIcon } from "lucide-react";
import clsx from "clsx";
import { useStudio } from "../StudioContext";
import { getSectionIcon, getSectionLabel } from "../studio-icons";
import type { StudioState } from "../TenantStudioView";
import type { Section } from "@/lib/db";
import { extractCloneSubLayers, type CloneSubLayer } from "@/lib/clone-sublayers";

export function LayersPanel({ state }: { state: StudioState }) {
  const studio = useStudio();
  const sorted = [...state.sections].sort((a, b) => a.order_index - b.order_index);
  const clone = sorted.find(s => s.section_type === "full-page-clone");
  const navbar = sorted.filter(s => s.section_type === "navbar");
  const footer = sorted.filter(s => s.section_type === "footer");
  const middle = sorted.filter(s => s.section_type !== "navbar" && s.section_type !== "footer" && s.section_type !== "full-page-clone");

  // For full-page-clone: render the single row + extracted DOM sub-layers
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
            {subLayers.map(sl => (
              <CloneSubLayerRow
                key={sl.key}
                layer={sl}
                selected={studio.cloneScrollTarget === sl.selector}
                onSelect={() => {
                  studio.setSelection(clone.id);
                  studio.setCloneScrollTarget(sl.selector);
                  // Trigger selection inside iframe so Inspector opens
                  studio.cloneCommand?.({ type: "selectBySelector", selector: sl.selector });
                }}
              />
            ))}
          </>
        )}
      </div>
    );
  }

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
    const fullOrder = [
      ...navbar.map(s => s.id),
      ...reordered,
      ...footer.map(s => s.id),
    ];
    void state.reorderSections(fullOrder);
  };

  return (
    <div className="p-2">
      {navbar.map(s => (
        <LockedRow key={s.id} section={s} selected={studio.selectedSectionId === s.id} onSelect={() => studio.setSelection(s.id)} state={state} />
      ))}
      {navbar.length > 0 && <div className="my-1.5 h-px bg-[var(--vs-surface-3)]" />}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={middle.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {middle.map(s => (
            <SortableRow
              key={s.id}
              section={s}
              selected={studio.selectedSectionId === s.id}
              onSelect={() => studio.setSelection(s.id)}
              state={state}
            />
          ))}
        </SortableContext>
      </DndContext>
      {footer.length > 0 && <div className="my-1.5 h-px bg-[var(--vs-surface-3)]" />}
      {footer.map(s => (
        <LockedRow key={s.id} section={s} selected={studio.selectedSectionId === s.id} onSelect={() => studio.setSelection(s.id)} state={state} />
      ))}
    </div>
  );
}

function RowInner({
  section, selected, onSelect, state, dragHandle,
}: {
  section: Section;
  selected: boolean;
  onSelect: () => void;
  state: StudioState;
  dragHandle?: React.ReactNode;
}) {
  const Icon = getSectionIcon(section.section_type);
  const label = getSectionLabel(section.section_type, section.section_variant);
  const [menu, setMenu] = useState(false);
  return (
    <div
      onClick={onSelect}
      className={clsx(
        "group flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-xs transition-colors duration-150",
        selected
          ? "bg-[var(--vs-accent-bg)] text-[var(--vs-text)] ring-1 ring-inset ring-[var(--vs-accent-ring)]"
          : "text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)]"
      )}
    >
      {dragHandle ?? <span className="h-4 w-4" />}
      <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--vs-text-muted)]" strokeWidth={1.75} />
      <span className="flex-1 truncate">{label}</span>
      <button
        type="button"
        aria-label={section.is_visible ? "Skrýt" : "Zobrazit"}
        title={section.is_visible ? "Skrýt" : "Zobrazit"}
        onClick={(e) => { e.stopPropagation(); void state.patchSection(section.id, { is_visible: !section.is_visible }); }}
        className={clsx(
          "rounded p-0.5 text-[var(--vs-text-muted)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:text-[var(--vs-text)]",
          !section.is_visible && "opacity-100 text-[var(--vs-warning)]"
        )}
      >
        {section.is_visible ? <Eye className="h-3.5 w-3.5" strokeWidth={1.75} /> : <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />}
      </button>
      <div className="relative">
        <button
          type="button"
          aria-label="Více"
          title="Více"
          onClick={(e) => { e.stopPropagation(); setMenu(m => !m); }}
          className="rounded p-0.5 text-[var(--vs-text-muted)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:bg-[var(--vs-surface-3)] hover:text-[var(--vs-text)]"
        >
          <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
        {menu && (
          <>
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenu(false); }} />
            <div className="absolute right-0 z-50 mt-1 w-36 rounded-md border border-[var(--vs-border)] bg-[var(--vs-surface)] py-1 text-xs shadow-xl">
              <button
                onClick={(e) => { e.stopPropagation(); setMenu(false); void state.duplicateSection(section.id); }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-3)]"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={1.75} /> Duplikovat
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenu(false); void state.deleteSection(section.id); }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[var(--vs-danger)] hover:bg-[var(--vs-surface-3)]"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Smazat
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LockedRow(props: { section: Section; selected: boolean; onSelect: () => void; state: StudioState }) {
  return (
    <div className="relative">
      <RowInner {...props} />
    </div>
  );
}

function SortableRow(props: { section: Section; selected: boolean; onSelect: () => void; state: StudioState }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <RowInner
        {...props}
        dragHandle={
          <button
            {...attributes}
            {...listeners}
            type="button"
            aria-label="Přesunout"
            className="flex h-4 w-4 cursor-grab items-center justify-center text-[var(--vs-text-dim)] hover:text-[var(--vs-text)]"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        }
      />
    </div>
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

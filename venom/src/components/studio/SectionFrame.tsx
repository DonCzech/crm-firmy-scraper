"use client";

import { useStudio } from "./StudioContext";
import { ArrowUp, ArrowDown, Copy, Trash2, Eye, EyeOff, GripVertical, Plus, Type, AlignLeft, MousePointer, Image as ImageIcon, Minus, Square } from "lucide-react";
import clsx from "clsx";
import { getSectionLabel } from "./studio-icons";
import { SectionResizeHandle } from "./SectionResizeHandle";
import type { Section } from "@/lib/db";
import type { StudioState } from "./TenantStudioView";
import {
  type ReactNode,
  type CSSProperties,
  type Ref,
  useEffect,
  useState,
} from "react";
import { findFieldBySrc, readFocus } from "@/lib/studio-focus";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { OverlayLayer } from "./OverlayLayer";

export interface SectionDragProps {
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  setDragRef?: Ref<HTMLDivElement>;
  dragStyle?: CSSProperties;
  isDragging?: boolean;
}

export function SectionFrame({
  section, state, children,
  dragAttributes, dragListeners, setDragRef, dragStyle, isDragging,
}: {
  section: Section;
  state: StudioState;
  children: ReactNode;
} & SectionDragProps) {
  const studio = useStudio();

  // Apply saved focus (object-position) to all images in this section that
  // don't use GenericEditableImage (which applies focus via SectionContentContext).
  // Runs after every render so it stays in sync with content changes.
  useEffect(() => {
    const content = (section.settings?.content ?? {}) as Record<string, unknown>;
    const sectionEl = document.querySelector(`[data-section-id="${section.id}"]`);
    if (!sectionEl) return;
    const imgs = sectionEl.querySelectorAll("img");
    imgs.forEach((imgEl) => {
      const img = imgEl as HTMLImageElement;
      // Skip images already managed by GenericEditableImage (data-studio-field wrapper)
      if (img.closest("[data-studio-field]")) return;
      const field = findFieldBySrc(content, img.currentSrc || img.src);
      if (!field) return;
      const focus = readFocus(content, field);
      if (focus) img.style.objectPosition = `${focus.x}% ${focus.y}%`;
    });
  }, [section.settings, section.id]);
  const [addOpen, setAddOpen] = useState(false);

  const selected = studio.selectedSectionId === section.id;
  const hover = studio.hoverSectionId === section.id;
  const label = getSectionLabel(section.section_type, section.section_variant);

  // Show "+" only when overlay is enabled on this section
  const overlayEnabled = !!(section.settings as Record<string, unknown> | undefined)?.overlay &&
    !!((section.settings as Record<string, unknown>)?.overlay as Record<string, unknown>)?.enabled;

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

  const sortable = !!dragAttributes;

  return (
    <div
      ref={setDragRef}
      data-section-frame
      data-section-id={section.id}
      className={clsx("relative", isDragging && "opacity-40")}
      style={dragStyle}
      onMouseEnter={() => studio.setHoverSectionId(section.id)}
      onMouseLeave={() => { if (studio.hoverSectionId === section.id) studio.setHoverSectionId(null); }}
      onClickCapture={(e) => {
        // Don't take selection if user clicked an editable inner element
        const t = e.target as HTMLElement;
        if (t.isContentEditable) return;
        if (t.closest("[contenteditable='true']")) return;
        // Allow IMG clicks even when inside <button> (e.g. gallery lightbox buttons)
        // but block other interactive elements
        if (t.tagName !== "IMG" && t.closest("input,textarea,select,button")) return;
        // Allow img clicks even when inside <a> — prevent navigation (non-img anchor handled below)
        if (t.tagName !== "IMG" && t.closest("a")) return;

        // Resolve the actual image element — direct click OR underlying img beneath overlay divs
        let imgEl: HTMLImageElement | null = t.tagName === "IMG" ? (t as HTMLImageElement) : null;
        if (!imgEl && t.tagName !== "IMG") {
          // e.g. gradient overlay is on top — scan all elements at this point for an img
          const stack = document.elementsFromPoint(e.clientX, e.clientY);
          imgEl = (stack.find(
            (el) => el.tagName === "IMG" && el.closest(`[data-section-id="${section.id}"]`)
          ) as HTMLImageElement | null) ?? null;
        }

        const alreadySelected = studio.selectedSectionId === section.id;

        // First click: just select the section (ring + toolbar appear); close any open image panel
        if (!alreadySelected) {
          studio.setSelection(section.id);
          studio.setImagePanel(null);
          if (imgEl) {
            e.preventDefault();
            e.stopPropagation(); // prevent button/link onClick (e.g. gallery lightbox)
          }
          return;
        }

        // Section already selected — second click logic below
        studio.setSelection(section.id); // keep selected

        // Hero sections use HeroInspectorPanel in the right panel — no floating panel
        if (section.section_type === "hero") {
          studio.setImagePanel(null);
          return;
        }

        // Second click on an image (direct or under overlay) → open floating inspector panel
        if (imgEl) {
          const img = imgEl;
          if (img.closest("a,button")) e.preventDefault();
          const rect = img.getBoundingClientRect();
          // Parse current object-position as focus percentages
          const computedStyle = window.getComputedStyle(img);
          const pos = computedStyle.objectPosition || "50% 50%";
          const parts = pos.split(" ");
          const fx = parseFloat(parts[0]) || 50;
          const fy = parseFloat(parts[1] ?? parts[0]) || 50;
          // Place panel right of image (or left if no space), avoiding the right inspector panel
          const panelW = 300;
          const rightPanelW = section.section_type === "gallery" ? 268 : 0;
          const effectiveRight = window.innerWidth - rightPanelW;
          const spaceRight = effectiveRight - rect.right;
          const px = spaceRight >= panelW + 16
            ? rect.right + 8
            : Math.max(8, Math.min(rect.left - panelW - 8, effectiveRight - panelW - 8));
          // Vertically: centre panel with image, clamped so minimum panel height fits on screen
          const PANEL_MIN_H = 300;
          const idealPY = rect.top + rect.height / 2 - PANEL_MIN_H / 2;
          const py = Math.max(48, Math.min(idealPY, window.innerHeight - PANEL_MIN_H - 8));
          // Detect which content field this image belongs to:
          // 1) data-studio-field attribute on a wrapper element (GenericEditableImage)
          // 2) fallback: scan section content for a string field matching the img src
          const fieldEl = (img.closest("[data-studio-field]") ?? img.parentElement?.closest("[data-studio-field]")) as HTMLElement | null;
          const content = (section.settings?.content ?? {}) as Record<string, unknown>;
          const studioField = fieldEl?.dataset.studioField
            ?? findFieldBySrc(content, img.currentSrc || img.src)
            ?? null;
          const onReplace = studioField
            ? (url: string, _alt?: string) => {
                void state.patchSectionContent(section.id, studioField, url);
              }
            : undefined;
          // Live focus update — directly patch object-position on the canvas img
          const onFocusChange = (focus: { x: number; y: number }) => {
            // Try data-studio-field selector first (works for GenericEditableImage wrappers)
            let el = studioField
              ? document.querySelector(`[data-section-id="${section.id}"] [data-studio-field="${studioField}"] img`) as HTMLImageElement | null
              : null;
            // Fallback: match by .src property (absolute URL) rather than attribute value (relative URL)
            if (!el) {
              const allImgs = document.querySelectorAll(`[data-section-id="${section.id}"] img`);
              el = Array.from(allImgs).find(
                (i) => (i as HTMLImageElement).src === img.src || (i as HTMLImageElement).currentSrc === img.src
              ) as HTMLImageElement | null;
            }
            if (el) el.style.objectPosition = `${focus.x}% ${focus.y}%`;
          };
          // Save focus on "Hotovo"
          const onFocusSave = studioField
            ? (focus: { x: number; y: number }) => {
                void state.patchSectionContent(section.id, `${studioField}Focus`, focus);
              }
            : undefined;
          // For gallery images (field path starts with "images.N") — add delete callback
          const onDelete = studioField && /^images\.\d+/.test(studioField)
            ? () => {
                // Extract numeric index from "images.0.url" → 0
                const idx = parseInt(studioField.split(".")[1], 10);
                // Read from patchSectionContent which internally reads sectionsRef (no stale closure)
                const currentSection = state.sections.find(s => s.id === section.id);
                const currentContent = (currentSection?.settings?.content ?? {}) as Record<string, unknown>;
                const rawArr = (currentContent.images as unknown[]) ?? [];
                const next = rawArr.filter((_, i) => i !== idx);
                void state.patchSectionContent(section.id, "images", next);
                studio.setImagePanel(null);
              }
            : undefined;
          studio.setImagePanel({
            src: img.currentSrc || img.src,
            alt: img.alt,
            sectionId: section.id,
            panelPos: { x: px, y: Math.max(48, py) },
            focus: { x: fx, y: fy },
            onReplace,
            onFocusChange,
            onFocusSave,
            onDelete,
          });
          // For gallery sections keep the right panel (GalleryInspectorPanel) visible alongside floating panel
          if (section.section_type !== "gallery") studio.setRightPanel(false);
          e.stopPropagation();
        } else {
          // Second click on non-image area — close image panel
          studio.setImagePanel(null);
        }
      }}
    >
      {/* Overlay layer BELOW variant content (z-index 5) */}
      <OverlayLayer
        section={section}
        layer="below"
        patchSection={state.patchSection}
        isAdmin
        selected={selected}
        tenantSlug={state.tenant.slug}
      />
      {children}
      {/* Overlay layer ABOVE variant content (z-index 15) */}
      <OverlayLayer
        section={section}
        layer="above"
        patchSection={state.patchSection}
        isAdmin
        selected={selected}
        tenantSlug={state.tenant.slug}
      />
      {/* Hidden-section dim overlay */}
      {!section.is_visible && (
        <div className="pointer-events-none absolute inset-0 z-[5] bg-[var(--vs-bg-soft)]/60 backdrop-grayscale" />
      )}
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 transition-colors duration-150",
          selected && "ring-2 ring-inset ring-blue-500",
          !selected && hover && "ring-1 ring-inset ring-blue-400/40"
        )}
      />
      {(selected || hover) && sortable && (
        /* Drag handle — own absolute element with very high z-index so it
           sits above any section-internal overlay (hero gradients, fixed
           navbars rendered inside hero variants, dark blends, etc.). */
        <button
          {...dragAttributes}
          {...dragListeners}
          type="button"
          aria-label="Přesunout sekci přetažením"
          title="Přetáhnout sekci pro změnu pořadí"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className={clsx(
            "pointer-events-auto absolute left-0 top-0 z-[60] flex h-6 w-6 cursor-grab items-center justify-center rounded-br-md text-white shadow-md ring-1 ring-white/20 transition-colors active:cursor-grabbing",
            selected ? "bg-blue-700 hover:bg-blue-800" : "bg-blue-500/90 hover:bg-blue-600"
          )}
        >
          <GripVertical className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      )}
      {(selected || hover) && (
        <div
          className={clsx(
            "pointer-events-none absolute top-0 z-[60] flex items-center gap-1.5",
            sortable ? "left-6" : "left-0"
          )}
        >
          <span className={clsx(
            "rounded-br-md px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-white",
            selected ? "bg-blue-600" : "bg-blue-400/80"
          )}>
            {label}
          </span>
          {!section.is_visible && (
            <span className="rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide bg-amber-500/90 text-white">
              Skryto
            </span>
          )}
        </div>
      )}
      {/* Bottom edge resize handle — only on sortable sections (mimo navbar/footer)
          aby uživatel nezvětšoval fixed header / footer. T1.3. */}
      {selected && sortable && (
        <SectionResizeHandle section={section} state={state} />
      )}
      {selected && (
        <div className="absolute right-2 top-2 z-[60] flex items-center gap-0.5 rounded-md border border-[var(--vs-surface-2)] bg-[var(--vs-surface)]/95 p-0.5 shadow-lg backdrop-blur">
          <FrameBtn label="Posunout nahoru" disabled={!canUp} onClick={() => move(-1)}>
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
          </FrameBtn>
          <FrameBtn label="Posunout dolů" disabled={!canDown} onClick={() => move(1)}>
            <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
          </FrameBtn>
          <div className="mx-0.5 h-4 w-px bg-[var(--vs-surface-2)]" />
          <FrameBtn
            label={section.is_visible ? "Skrýt sekci" : "Zobrazit sekci"}
            onClick={() => void state.patchSection(section.id, { is_visible: !section.is_visible })}
          >
            {section.is_visible
              ? <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
              : <EyeOff className="h-3.5 w-3.5 text-amber-400" strokeWidth={1.75} />}
          </FrameBtn>
          <FrameBtn label="Duplikovat" onClick={() => void state.duplicateSection(section.id)}>
            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
          </FrameBtn>
          {overlayEnabled && (
            <>
              <div className="mx-0.5 h-4 w-px bg-[var(--vs-surface-2)]" />
              <div className="relative">
                <FrameBtn
                  label="Přidat element do overlay"
                  onClick={() => setAddOpen(o => !o)}
                  active={addOpen}
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                </FrameBtn>
                {addOpen && (
                  <AddElementPopover
                    onAdd={(type) => {
                      studio.setPendingAddEl({ sectionId: section.id, elementType: type });
                      setAddOpen(false);
                    }}
                    onClose={() => setAddOpen(false)}
                  />
                )}
              </div>
            </>
          )}
          <div className="mx-0.5 h-4 w-px bg-[var(--vs-surface-2)]" />
          <FrameBtn label="Smazat" onClick={() => void state.deleteSection(section.id)} danger>
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </FrameBtn>
        </div>
      )}
    </div>
  );
}

function FrameBtn({
  children, label, onClick, disabled, danger, active,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(); }}
      disabled={disabled}
      className={clsx(
        "inline-flex h-6 w-6 items-center justify-center rounded transition-colors duration-150 hover:bg-[var(--vs-surface-2)]",
        active ? "bg-blue-600 text-white hover:bg-blue-700" : "text-[var(--vs-text-muted)]",
        danger ? "hover:text-red-400" : !active && "hover:text-white",
        disabled && "opacity-30 hover:bg-transparent"
      )}
    >
      {children}
    </button>
  );
}

const ADD_TYPES = [
  { type: "heading", label: "Nadpis",    icon: <Type className="h-3.5 w-3.5" /> },
  { type: "text",    label: "Text",      icon: <AlignLeft className="h-3.5 w-3.5" /> },
  { type: "button",  label: "Tlačítko",  icon: <MousePointer className="h-3.5 w-3.5" /> },
  { type: "image",   label: "Obrázek",   icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { type: "divider", label: "Oddělovač", icon: <Minus className="h-3.5 w-3.5" /> },
  { type: "shape",   label: "Tvar",      icon: <Square className="h-3.5 w-3.5" /> },
] as const;

function AddElementPopover({ onAdd, onClose }: { onAdd: (type: string) => void; onClose: () => void }) {
  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-add-popover]")) onClose();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  return (
    <div
      data-add-popover
      className="absolute right-0 top-8 z-[70] w-40 rounded-md border border-[var(--vs-surface-2)] bg-[var(--vs-surface)]/98 p-1.5 shadow-xl backdrop-blur"
    >
      <p className="mb-1 px-1 text-[9px] font-medium uppercase tracking-widest text-[var(--vs-text-dim)]">Přidat element</p>
      {ADD_TYPES.map(({ type, label, icon }) => (
        <button
          key={type}
          type="button"
          onClick={(e) => { e.stopPropagation(); onAdd(type); }}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[11px] text-[var(--vs-text-muted)] transition-colors hover:bg-[var(--vs-surface-2)] hover:text-white"
        >
          <span className="text-[var(--vs-text-dim)]">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}

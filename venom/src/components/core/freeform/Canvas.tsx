"use client";

import { useEffect, useRef, useState } from "react";
import { snapToGrid } from "@/lib/snap";
import { RenderElement } from "./Element";
import { FreeformAdminToolbar } from "./Toolbar";
import { defaultElement, CANVAS_GRID } from "./types";
import type { FreeformEl, ElementType, DragKind, ImageEl } from "./types";

interface DragState {
  kind: DragKind;
  startMouseX: number;
  startMouseY: number;
  startEl: FreeformEl;
  /** Snapshots of ALL selected elements at drag start (for group move). */
  startEls: FreeformEl[];
}

export interface CanvasProps {
  /** Controlled elements array. */
  elements: FreeformEl[];
  /** Called after every mutation (move/resize/add/delete/style/z-order). */
  onChange: (next: FreeformEl[]) => void;
  /** Called at drag start so caller can snapshot undo history. */
  onCommitHistory?: () => void;
  /** Currently selected element id; managed externally so OverlayLayer
   *  can keep a single selection across canvas + inspector. */
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  width: number;
  height: number;
  background: string;
  isAdmin?: boolean;
  /** Tenant slug — needed for image upload API. */
  tenantSlug?: string;
  /** Show undo/redo buttons in toolbar. */
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

function snap(v: number) { return snapToGrid(v, CANVAS_GRID); }

function handlePosition(corner: DragKind): React.CSSProperties {
  const o = -5;
  const mid = "calc(50% - 5px)";
  switch (corner) {
    case "nw": return { top: o, left: o };
    case "n":  return { top: o, left: mid };
    case "ne": return { top: o, right: o };
    case "e":  return { top: mid, right: o };
    case "se": return { bottom: o, right: o };
    case "s":  return { bottom: o, left: mid };
    case "sw": return { bottom: o, left: o };
    case "w":  return { top: mid, left: o };
    default:   return {};
  }
}

function handleCursor(corner: DragKind): string {
  switch (corner) {
    case "nw": case "se": return "nwse-resize";
    case "ne": case "sw": return "nesw-resize";
    case "n":  case "s":  return "ns-resize";
    case "e":  case "w":  return "ew-resize";
    default:              return "move";
  }
}

export function FreeformCanvas({
  elements, onChange, onCommitHistory,
  selectedId, onSelect,
  width: canvasW, height: canvasH, background: bg,
  isAdmin = false,
  tenantSlug,
  canUndo = false, canRedo = false, onUndo, onRedo,
}: CanvasProps) {
  const containerRef      = useRef<HTMLDivElement | null>(null);
  const dragRef           = useRef<DragState | null>(null);
  const fontSizeDragRef   = useRef<{ startY: number; startSize: number; elId: string } | null>(null);
  const [fontSizeDragging, setFontSizeDragging] = useState(false);
  const elementsRef  = useRef<FreeformEl[]>(elements);
  elementsRef.current = elements;

  const [hoverId, setHoverId]           = useState<string | null>(null);
  const [guides, setGuides]             = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  /** Internal multi-select set — managed here, not exposed to parent. */
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set<string>());
  const selectedIdsRef = useRef<Set<string>>(selectedIds);
  selectedIdsRef.current = selectedIds;

  function patch(id: string, p: Partial<FreeformEl>) {
    onChange(elementsRef.current.map((e) => (e.id === id ? ({ ...e, ...p } as FreeformEl) : e)));
  }

  function addElement(type: ElementType) {
    const el = defaultElement(type, elements.length);
    onChange([...elements, el]);
    onSelect(el.id);
  }

  function deleteSelected() {
    if (!selectedId) return;
    onChange(elements.filter((e) => e.id !== selectedId));
    onSelect(null);
  }

  function duplicateSelected() {
    if (!selectedId) return;
    const src = elements.find((e) => e.id === selectedId);
    if (!src) return;
    const clone: FreeformEl = { ...src, id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, x: src.x + 20, y: src.y + 20 };
    onChange([...elements, clone]);
    onSelect(clone.id);
  }

  function patchSelected(p: Partial<FreeformEl>) {
    if (!selectedId) return;
    patch(selectedId, p);
  }

  function toggleMobileHidden() {
    if (!selectedId) return;
    const el = elementsRef.current.find((e) => e.id === selectedId);
    if (!el) return;
    patch(selectedId, { mobileHidden: !el.mobileHidden } as Partial<FreeformEl>);
  }

  function bringToFront() {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    onChange([...elements.filter((e) => e.id !== selectedId), el]);
  }
  function sendToBack() {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    onChange([el, ...elements.filter((e) => e.id !== selectedId)]);
  }
  function bringForward() {
    if (!selectedId) return;
    const idx = elements.findIndex((e) => e.id === selectedId);
    if (idx < 0 || idx === elements.length - 1) return;
    const next = [...elements];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  }
  function sendBackward() {
    if (!selectedId) return;
    const idx = elements.findIndex((e) => e.id === selectedId);
    if (idx <= 0) return;
    const next = [...elements];
    [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
    onChange(next);
  }

  async function uploadAndPlaceImage(file: File, atX?: number, atY?: number) {
    if (!tenantSlug) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/upload-image`, {
        method: "POST", body: form, credentials: "same-origin",
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok || !json.url) { alert(json.error ?? `Upload selhal: ${r.status}`); return; }
      const w = 400, h = 280;
      const x = atX !== undefined ? Math.max(0, snap(atX - w / 2)) : (canvasW - w) / 2;
      const y = atY !== undefined ? Math.max(0, snap(atY - h / 2)) : 80;
      const el: ImageEl = {
        id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "image", x, y, w, h,
        src: json.url, alt: file.name.replace(/\.[^.]+$/, ""),
        objectFit: "cover", style: { borderRadius: 8 },
      };
      onChange([...elementsRef.current, el]);
      onSelect(el.id);
    } catch (e) {
      alert(`Upload selhal: ${(e as Error).message}`);
    }
  }

  function startDrag(e: React.MouseEvent, el: FreeformEl, kind: DragKind) {
    if (!isAdmin) return;
    e.stopPropagation();
    e.preventDefault();
    onCommitHistory?.();
    // Snapshot all selected elements so group move has stable start positions.
    const currentIds = selectedIdsRef.current;
    const allSelected = elementsRef.current.filter((e) => currentIds.has(e.id));
    dragRef.current = {
      kind,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startEl: { ...el },
      startEls: allSelected.length > 1 ? allSelected.map((e) => ({ ...e })) : [{ ...el }],
    };
    onSelect(el.id);
  }

  // Mouse move + alignment guides
  useEffect(() => {
    function getScale() {
      const node = containerRef.current;
      if (!node) return 1;
      return node.getBoundingClientRect().width / canvasW;
    }
    function onMove(e: MouseEvent) {
      const d = dragRef.current;
      if (!d) return;
      const scale = getScale();
      const dx = (e.clientX - d.startMouseX) / scale;
      const dy = (e.clientY - d.startMouseY) / scale;
      const s = d.startEl;
      const next: FreeformEl = { ...s };

      if (d.kind === "move" && d.startEls.length > 1) {
        // Group move — apply same delta to every selected element
        const moved = new Map(d.startEls.map((se) => [
          se.id,
          {
            x: Math.max(0, Math.min(canvasW - se.w, snap(se.x + dx))),
            y: Math.max(0, snap(se.y + dy)),
          },
        ]));
        const updated = elementsRef.current.map((e) => {
          const pos = moved.get(e.id);
          return pos ? ({ ...e, ...pos } as FreeformEl) : e;
        });
        onChange(updated);
        setGuides({ v: [], h: [] });
        return;
      }

      if (d.kind === "move") {
        next.x = Math.max(0, Math.min(canvasW - s.w, snap(s.x + dx)));
        next.y = Math.max(0, snap(s.y + dy));
      } else {
        if (d.kind.includes("e")) next.w = Math.max(20, snap(s.w + dx));
        if (d.kind.includes("s")) next.h = Math.max(20, snap(s.h + dy));
        if (d.kind.includes("w")) {
          const newW = Math.max(20, snap(s.w - dx));
          next.x = snap(s.x + (s.w - newW));
          next.w = newW;
        }
        if (d.kind.includes("n")) {
          const newH = Math.max(20, snap(s.h - dy));
          next.y = snap(s.y + (s.h - newH));
          next.h = newH;
        }
        next.x = Math.max(0, Math.min(canvasW - next.w, next.x));
        next.y = Math.max(0, next.y);
        next.w = Math.min(canvasW - next.x, next.w);
      }

      // Alignment guides during move only
      const guideV: number[] = [];
      const guideH: number[] = [];
      if (d.kind === "move") {
        const THRESHOLD = 6;
        const others = elementsRef.current.filter((o) => o.id !== s.id);
        const targets = [
          { v: canvasW / 2, h: canvasH / 2 },
          { v: 0, h: 0 },
          { v: canvasW, h: canvasH },
          ...others.map((o) => ({ v: o.x,           h: o.y })),
          ...others.map((o) => ({ v: o.x + o.w,     h: o.y + o.h })),
          ...others.map((o) => ({ v: o.x + o.w / 2, h: o.y + o.h / 2 })),
        ];
        const ctr  = { v: next.x + next.w / 2,  h: next.y + next.h / 2 };
        const edges = { vL: next.x, vR: next.x + next.w, hT: next.y, hB: next.y + next.h };

        for (const t of targets) {
          for (const own of [ctr.v, edges.vL, edges.vR]) {
            if (Math.abs(own - t.v) <= THRESHOLD) {
              next.x = Math.max(0, Math.min(canvasW - next.w, next.x + (t.v - own)));
              guideV.push(t.v);
            }
          }
          for (const own of [ctr.h, edges.hT, edges.hB]) {
            if (Math.abs(own - t.h) <= THRESHOLD) {
              next.y = Math.max(0, next.y + (t.h - own));
              guideH.push(t.h);
            }
          }
        }
      }
      setGuides({ v: Array.from(new Set(guideV)), h: Array.from(new Set(guideH)) });
      // Use ref to avoid stale closure; onChange not needed for live drag perf
      const updated = elementsRef.current.map((e) => (e.id === s.id ? ({ ...e, x: next.x, y: next.y, w: next.w, h: next.h } as FreeformEl) : e));
      onChange(updated);
    }
    function onUp() { dragRef.current = null; setGuides({ v: [], h: [] }); }
    if (isAdmin) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, canvasW, canvasH]);

  // When parent resets selectedId to null (Escape, delete, etc.), clear multi-select too.
  useEffect(() => {
    if (selectedId === null) setSelectedIds(new Set());
  }, [selectedId]);

  // Keyboard arrow nudge: 1 px, Shift = 10 px. Ignored when focus is in a text input.
  useEffect(() => {
    if (!isAdmin) return;
    function onKey(e: KeyboardEvent) {
      if (!selectedId) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      const DIRS: Record<string, [number, number]> = {
        ArrowLeft:  [-1, 0],
        ArrowRight: [ 1, 0],
        ArrowUp:    [ 0,-1],
        ArrowDown:  [ 0, 1],
      };
      const dir = DIRS[e.key];
      if (!dir) return;
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const dx = dir[0] * step;
      const dy = dir[1] * step;

      // Move all selected elements (multi-select) or just the primary one
      const ids = selectedIdsRef.current.size > 1 ? selectedIdsRef.current : new Set([selectedId]);
      const updated = elementsRef.current.map((el) => {
        if (!ids.has(el.id)) return el;
        return {
          ...el,
          x: Math.max(0, Math.min(canvasW - el.w, el.x + dx)),
          y: Math.max(0, el.y + dy),
        } as FreeformEl;
      });
      onChange(updated);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin, selectedId, canvasW, onChange]);

  // Font-size drag: vertical drag on the Aa badge changes el.style.fontSize
  useEffect(() => {
    if (!isAdmin) return;
    function onMove(e: MouseEvent) {
      const d = fontSizeDragRef.current;
      if (!d) return;
      // Stejná scale kompenzace jako u posunu elementů — canvas bývá zmenšený
      const rect = containerRef.current?.getBoundingClientRect();
      const scale = rect && rect.width > 0 ? rect.width / canvasW : 1;
      const dy = (e.clientY - d.startY) / scale;
      const raw = d.startSize + dy;
      const snapped = Math.round(raw / 2) * 2;
      const clamped = Math.max(8, Math.min(200, snapped));
      const updated = elementsRef.current.map((el) =>
        el.id === d.elId
          ? { ...el, style: { ...(el.style ?? {}), fontSize: clamped } } as FreeformEl
          : el
      );
      onChange(updated);
    }
    function onUp() {
      if (!fontSizeDragRef.current) return;
      fontSizeDragRef.current = null;
      setFontSizeDragging(false);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [isAdmin, onChange, canvasW]);

  const selectedEl = elements.find((e) => e.id === selectedId) ?? null;

  return (
    <>
      {isAdmin && (
        <FreeformAdminToolbar
          onAdd={addElement}
          onDelete={selectedId ? deleteSelected : undefined}
          onDuplicate={selectedId ? duplicateSelected : undefined}
          selectedEl={selectedEl}
          onPatch={patchSelected}
          onUndo={onUndo ?? (() => {})}
          onRedo={onRedo ?? (() => {})}
          canUndo={canUndo}
          canRedo={canRedo}
          onBringToFront={selectedId ? bringToFront : undefined}
          onSendToBack={selectedId ? sendToBack : undefined}
          onBringForward={selectedId ? bringForward : undefined}
          onSendBackward={selectedId ? sendBackward : undefined}
          onToggleMobileHidden={selectedId ? toggleMobileHidden : undefined}
        />
      )}

      <div
        ref={containerRef}
        className="vs-freeform-canvas"
        onMouseDown={(e) => { if (e.target === e.currentTarget) { onSelect(null); setSelectedIds(new Set()); } }}
        onDragOver={isAdmin ? (e) => { e.preventDefault(); setIsDraggingFile(true); } : undefined}
        onDragLeave={isAdmin ? () => setIsDraggingFile(false) : undefined}
        onDrop={isAdmin ? async (e) => {
          e.preventDefault();
          setIsDraggingFile(false);
          const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
          if (!files.length) return;
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const scale = rect.width / canvasW;
          for (const f of files) await uploadAndPlaceImage(f, (e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale);
        } : undefined}
        style={{ width: canvasW, height: canvasH, background: bg, position: "relative", margin: "0 auto", maxWidth: "100%" }}
      >
        {/* Drag-drop overlay */}
        {isAdmin && isDraggingFile && (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
            style={{ background: "rgba(20,184,166,0.10)", border: "3px dashed var(--vs-accent)", borderRadius: 4 }}>
            <div className="rounded-lg bg-[var(--vs-accent-solid)] px-4 py-2 text-sm font-semibold text-white shadow-lg">Pusť obrázek pro upload</div>
          </div>
        )}

        {/* Alignment guides */}
        {isAdmin && guides.v.map((v, i) => (
          <div key={`gv-${i}-${v}`} aria-hidden className="pointer-events-none absolute"
            style={{ left: v - 0.5, top: 0, width: 1, height: "100%", background: "#ef4444", boxShadow: "0 0 4px rgba(239,68,68,0.6)", zIndex: 3 }} />
        ))}
        {isAdmin && guides.h.map((h, i) => (
          <div key={`gh-${i}-${h}`} aria-hidden className="pointer-events-none absolute"
            style={{ top: h - 0.5, left: 0, height: 1, width: "100%", background: "#ef4444", boxShadow: "0 0 4px rgba(239,68,68,0.6)", zIndex: 3 }} />
        ))}

        {/* Dotted grid (admin only) */}
        {isAdmin && (
          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: "radial-gradient(rgba(15,23,42,0.10) 1px, transparent 1px)", backgroundSize: `${CANVAS_GRID}px ${CANVAS_GRID}px` }} />
        )}

        {elements.map((el) => {
          const selected = selectedId === el.id;
          const hovered  = hoverId === el.id;
          return (
            <div
              key={el.id}
              onMouseDown={(e) => startDrag(e, el, "move")}
              onMouseEnter={() => setHoverId(el.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (isAdmin && e.shiftKey) {
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(el.id)) { next.delete(el.id); } else { next.add(el.id); }
                    return next;
                  });
                } else {
                  setSelectedIds(new Set([el.id]));
                  onSelect(el.id);
                }
              }}
              className={isAdmin ? "vs-ff-element" : undefined}
              style={{
                position: "absolute",
                left: el.x, top: el.y, width: el.w, height: el.h,
                cursor: isAdmin ? (dragRef.current ? "grabbing" : "grab") : "default",
                opacity: isAdmin && el.mobileHidden ? 0.35 : 1,
                outline: isAdmin
                  ? (selected ? "2px solid var(--vs-accent)"
                    : selectedIds.has(el.id) ? "2px solid var(--vs-accent)"
                    : hovered ? "1px dashed rgba(20,184,166,0.6)" : "none")
                  : "none",
                outlineOffset: 2,
                userSelect: "none",
                boxSizing: "border-box",
              }}
            >
              <RenderElement
                el={el}
                onTextChange={isAdmin ? (next) => patch(el.id, { text: next } as Partial<FreeformEl>) : undefined}
                onSrcChange={isAdmin && selected && el.type === "image" ? (src) => patch(el.id, { src } as Partial<FreeformEl>) : undefined}
                onUpload={isAdmin && selected && el.type === "image" && tenantSlug ? async (file) => {
                  const form = new FormData();
                  form.append("file", file);
                  try {
                    const r = await fetch(`/api/demo/${tenantSlug}/upload-image`, { method: "POST", body: form, credentials: "same-origin" });
                    const json = await r.json().catch(() => ({}));
                    if (!r.ok || !json.url) { alert(json.error ?? `Upload selhal: ${r.status}`); return; }
                    patch(el.id, { src: json.url } as Partial<FreeformEl>);
                  } catch (e) { alert(`Upload selhal: ${(e as Error).message}`); }
                } : undefined}
              />
              {isAdmin && selected && (
                <>
                  {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const).map((corner) => (
                    <div
                      key={corner}
                      onMouseDown={(e) => startDrag(e, el, corner)}
                      className="vs-ff-handle"
                      style={{ position: "absolute", width: 10, height: 10, background: "#ffffff", border: "2px solid var(--vs-accent)", borderRadius: 2, cursor: handleCursor(corner), ...handlePosition(corner), zIndex: 2 }}
                    />
                  ))}
                  {/* Size info badge */}
                  <div aria-hidden className="pointer-events-none absolute"
                    style={{ bottom: -22, right: 0, background: "var(--vs-accent)", color: "#fff", fontSize: 10, fontFamily: "ui-monospace, SFMono-Regular, monospace", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>
                    {el.w}×{el.h} · {el.x},{el.y}
                  </div>
                  {/* Font-size drag handle — only for text elements */}
                  {(el.type === "heading" || el.type === "text" || el.type === "button") && (() => {
                    const fs = (el.style as { fontSize?: number } | undefined)?.fontSize ?? 16;
                    const isThisActive = fontSizeDragging && fontSizeDragRef.current?.elId === el.id;
                    return (
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onCommitHistory?.();
                          fontSizeDragRef.current = { startY: e.clientY, startSize: fs, elId: el.id };
                          setFontSizeDragging(true);
                        }}
                        title="Táhni nahoru/dolů pro změnu velikosti písma"
                        style={{
                          position: "absolute",
                          bottom: -22,
                          left: 0,
                          background: isThisActive ? "var(--vs-accent)" : "var(--vs-accent-solid)",
                          color: "#fff",
                          fontSize: 10,
                          fontFamily: "ui-monospace, SFMono-Regular, monospace",
                          padding: "2px 7px",
                          borderRadius: 4,
                          whiteSpace: "nowrap",
                          cursor: "ns-resize",
                          userSelect: "none",
                          zIndex: 2,
                          boxShadow: isThisActive ? "0 0 0 2px var(--vs-accent)" : undefined,
                        }}
                      >
                        Aa {fs}px
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          );
        })}

        {/* Empty canvas hint */}
        {isAdmin && elements.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 px-6 py-4 text-center backdrop-blur-sm">
              <p className="text-sm font-semibold text-slate-700">Volné plátno</p>
              <p className="mt-0.5 text-xs text-slate-500">Klikni <strong>+ Heading / Text / …</strong> v horní liště</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

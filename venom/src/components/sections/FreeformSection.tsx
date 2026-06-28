"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Type, AlignLeft, MousePointer, Image as ImageIcon, Minus, Square, Trash2, Copy as CopyIcon, X, Plus, ChevronsUp, ChevronUp, ChevronsDown, ChevronDown, Undo2, Redo2 } from "lucide-react";

/**
 * FreeformSection — pixel-perfect canvas where every element has absolute
 * coordinates (x/y/w/h) on a fixed 1200×N grid. In admin mode the user gets
 * mouse drag-to-move, 8 resize handles per element, a snap-to-10px grid and
 * a floating element library. On mobile (<768px) the canvas auto-stacks
 * elements vertically in Y-order so the layout never breaks on phones.
 *
 * Data shape (section.settings.content):
 *   {
 *     width: 1200,
 *     height: 720,
 *     background: "#ffffff" | "url(...)",
 *     elements: [{ id, type, x, y, w, h, ...typeSpecific }]
 *   }
 */
const CANVAS_WIDTH = 1200;
const GRID = 10;
const MOBILE_BREAKPOINT = 768;

type ElementType = "heading" | "text" | "button" | "image" | "divider" | "shape";

interface BaseEl {
  id: string;
  type: ElementType;
  x: number; y: number; w: number; h: number;
  style?: {
    color?: string;
    background?: string;
    fontSize?: number;
    fontWeight?: number;
    textAlign?: "left" | "center" | "right";
    borderRadius?: number;
    border?: string;
  };
}

interface HeadingEl extends BaseEl { type: "heading"; text: string; level?: 1 | 2 | 3 | 4 }
interface TextEl extends BaseEl { type: "text"; text: string }
interface ButtonEl extends BaseEl { type: "button"; text: string; href?: string }
interface ImageEl extends BaseEl { type: "image"; src?: string; alt?: string; objectFit?: "cover" | "contain" }
interface DividerEl extends BaseEl { type: "divider" }
interface ShapeEl extends BaseEl { type: "shape" }

type FreeformEl = HeadingEl | TextEl | ButtonEl | ImageEl | DividerEl | ShapeEl;

interface FreeformContent {
  width?: number;
  height?: number;
  background?: string;
  elements?: FreeformEl[];
}

interface Props {
  content: FreeformContent;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}

function defaultElement(type: ElementType, idCounter: number): FreeformEl {
  const id = `el-${Date.now()}-${idCounter}`;
  const cx = CANVAS_WIDTH / 2;
  switch (type) {
    case "heading":
      return { id, type, x: cx - 200, y: 80, w: 400, h: 60, text: "Nadpis", level: 1, style: { fontSize: 36, fontWeight: 700, textAlign: "left", color: "#0f172a" } };
    case "text":
      return { id, type, x: cx - 200, y: 160, w: 400, h: 100, text: "Sem napiš krátký odstavec textu. Klikni dvakrát pro úpravu.", style: { fontSize: 16, color: "#334155" } };
    case "button":
      return { id, type, x: cx - 100, y: 280, w: 200, h: 50, text: "Tlačítko", href: "#", style: { background: "#6366f1", color: "#ffffff", fontSize: 14, fontWeight: 600, borderRadius: 8, textAlign: "center" } };
    case "image":
      return { id, type, x: cx - 150, y: 80, w: 300, h: 200, src: "", alt: "Obrázek", objectFit: "cover", style: { borderRadius: 8 } };
    case "divider":
      return { id, type, x: cx - 200, y: 200, w: 400, h: 2, style: { background: "#e2e8f0" } };
    case "shape":
      return { id, type, x: cx - 100, y: 200, w: 200, h: 200, style: { background: "#818cf8", borderRadius: 12 } };
  }
}

function snap(v: number, step = GRID): number {
  return Math.round(v / step) * step;
}

type DragKind = "move" | "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
interface DragState {
  kind: DragKind;
  startMouseX: number;
  startMouseY: number;
  startEl: FreeformEl;
}

export function FreeformSection({ content, sectionId, tenantSlug, isAdmin }: Props) {
  const canvasW = content.width ?? CANVAS_WIDTH;
  const canvasH = content.height ?? 720;
  const bg = content.background ?? "#ffffff";

  const [elements, setElements] = useState<FreeformEl[]>(content.elements ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elementsRef = useRef<FreeformEl[]>(elements);
  elementsRef.current = elements;

  // Undo/redo stacks. We snapshot the elements array before every meaningful
  // mutation (move/resize commit, add, delete, duplicate, z-reorder, style
  // change) so Cmd+Z restores the previous state.
  const undoStack = useRef<FreeformEl[][]>([]);
  const redoStack = useRef<FreeformEl[][]>([]);
  const MAX_HISTORY = 50;

  // Active alignment guides during drag — rendered as red vertical/horizontal
  // lines across the canvas when an element's edge or center snaps to
  // another element's edge or center, or to the canvas center.
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });

  // Drag-drop file upload visual indicator
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Sync from props (e.g. after restore)
  useEffect(() => { setElements(content.elements ?? []); }, [content.elements]);

  // Detect viewport for mobile fallback
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Persist debounced
  const persist = useCallback((nextEls: FreeformEl[]) => {
    if (!isAdmin || !tenantSlug) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const newContent: FreeformContent = {
        width: canvasW,
        height: canvasH,
        background: bg,
        elements: nextEls,
      };
      void fetch(`/api/demo/${tenantSlug}/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ settings: { content: newContent } }),
      });
    }, 600);
  }, [isAdmin, tenantSlug, sectionId, canvasW, canvasH, bg]);

  // commitHistory: snapshot current state before a mutation so undo can revert.
  // Used by atomic actions (add/delete/duplicate/style change/z-reorder) and at
  // the start of each drag (move/resize) so a single drag = one undo step.
  const commitHistory = useCallback(() => {
    undoStack.current.push(JSON.parse(JSON.stringify(elementsRef.current)));
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift();
    redoStack.current = []; // any new mutation invalidates redo
  }, []);

  const updateElements = useCallback((next: FreeformEl[] | ((prev: FreeformEl[]) => FreeformEl[]), opts?: { skipHistory?: boolean }) => {
    setElements((prev) => {
      if (!opts?.skipHistory) {
        undoStack.current.push(JSON.parse(JSON.stringify(prev)));
        if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift();
        redoStack.current = [];
      }
      const computed = typeof next === "function" ? next(prev) : next;
      persist(computed);
      return computed;
    });
  }, [persist]);

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push(JSON.parse(JSON.stringify(elementsRef.current)));
    setElements(prev);
    persist(prev);
  }, [persist]);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(JSON.parse(JSON.stringify(elementsRef.current)));
    setElements(next);
    persist(next);
  }, [persist]);

  function addElement(type: ElementType) {
    const newEl = defaultElement(type, elements.length);
    updateElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  }

  function deleteSelected() {
    if (!selectedId) return;
    updateElements((prev) => prev.filter((e) => e.id !== selectedId));
    setSelectedId(null);
  }

  function duplicateSelected() {
    if (!selectedId) return;
    const src = elements.find((e) => e.id === selectedId);
    if (!src) return;
    const clone: FreeformEl = { ...src, id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, x: src.x + 20, y: src.y + 20 };
    updateElements((prev) => [...prev, clone]);
    setSelectedId(clone.id);
  }

  function patchElement(id: string, patch: Partial<FreeformEl>, opts?: { skipHistory?: boolean }) {
    updateElements((prev) => prev.map((e) => (e.id === id ? ({ ...e, ...patch } as FreeformEl) : e)), opts);
  }

  // Z-ordering: elements are rendered in array order, so index 0 = back,
  // last = front. The four helpers below mutate that order.
  function bringToFront() {
    if (!selectedId) return;
    updateElements((prev) => {
      const el = prev.find((e) => e.id === selectedId);
      if (!el) return prev;
      return [...prev.filter((e) => e.id !== selectedId), el];
    });
  }
  function sendToBack() {
    if (!selectedId) return;
    updateElements((prev) => {
      const el = prev.find((e) => e.id === selectedId);
      if (!el) return prev;
      return [el, ...prev.filter((e) => e.id !== selectedId)];
    });
  }
  function bringForward() {
    if (!selectedId) return;
    updateElements((prev) => {
      const idx = prev.findIndex((e) => e.id === selectedId);
      if (idx < 0 || idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }
  function sendBackward() {
    if (!selectedId) return;
    updateElements((prev) => {
      const idx = prev.findIndex((e) => e.id === selectedId);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      return next;
    });
  }

  // Upload an image file via the existing /api/demo/<slug>/upload-image
  // endpoint, then insert an image element at the dropped position (or
  // canvas center if no position given).
  async function uploadAndPlaceImage(file: File, atX?: number, atY?: number) {
    if (!tenantSlug) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/upload-image`, {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok || !json.url) { alert(json.error ?? `Upload selhal: ${r.status}`); return; }
      const w = 400, h = 280;
      const x = atX !== undefined ? Math.max(0, snap(atX - w / 2)) : (canvasW - w) / 2;
      const y = atY !== undefined ? Math.max(0, snap(atY - h / 2)) : 80;
      const newEl: ImageEl = {
        id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "image",
        x, y, w, h,
        src: json.url,
        alt: file.name.replace(/\.[^.]+$/, ""),
        objectFit: "cover",
        style: { borderRadius: 8 },
      };
      updateElements((prev) => [...prev, newEl]);
      setSelectedId(newEl.id);
    } catch (e) {
      alert(`Upload selhal: ${(e as Error).message}`);
    }
  }

  // Drag/resize lifecycle. Commit history at drag start so the entire gesture
  // collapses to one undo step (not one per mousemove).
  function startDrag(e: React.MouseEvent, el: FreeformEl, kind: DragKind) {
    if (!isAdmin) return;
    e.stopPropagation();
    e.preventDefault();
    commitHistory();
    dragRef.current = {
      kind,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startEl: { ...el },
    };
    setSelectedId(el.id);
  }

  useEffect(() => {
    function getScale(): number {
      const node = containerRef.current;
      if (!node) return 1;
      const rect = node.getBoundingClientRect();
      return rect.width / canvasW;
    }
    function onMove(e: MouseEvent) {
      const d = dragRef.current;
      if (!d) return;
      const scale = getScale();
      const dx = (e.clientX - d.startMouseX) / scale;
      const dy = (e.clientY - d.startMouseY) / scale;
      const s = d.startEl;
      const next: FreeformEl = { ...s };

      if (d.kind === "move") {
        next.x = Math.max(0, Math.min(canvasW - s.w, snap(s.x + dx)));
        next.y = Math.max(0, snap(s.y + dy));
      } else {
        // resize handles
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

      // Smart alignment guides — only during move, not resize. Snap to other
      // elements' edges + centers + canvas center. Threshold = 6px to avoid
      // jitter.
      const guideV: number[] = [];
      const guideH: number[] = [];
      if (d.kind === "move") {
        const THRESHOLD = 6;
        const others = elementsRef.current.filter((o) => o.id !== s.id);
        const targets = [
          // canvas centers + edges
          { v: canvasW / 2, h: canvasH / 2 },
          { v: 0, h: 0 },
          { v: canvasW, h: canvasH },
          ...others.map((o) => ({ v: o.x,            h: o.y })),                     // left/top
          ...others.map((o) => ({ v: o.x + o.w,      h: o.y + o.h })),               // right/bottom
          ...others.map((o) => ({ v: o.x + o.w / 2,  h: o.y + o.h / 2 })),           // center
        ];
        const elCenters = { v: next.x + next.w / 2, h: next.y + next.h / 2 };
        const elEdges   = { vL: next.x, vR: next.x + next.w, hT: next.y, hB: next.y + next.h };

        for (const t of targets) {
          // Vertical snap (compare X coords)
          for (const own of [elCenters.v, elEdges.vL, elEdges.vR]) {
            if (Math.abs(own - t.v) <= THRESHOLD) {
              const delta = t.v - own;
              next.x = Math.max(0, Math.min(canvasW - next.w, next.x + delta));
              guideV.push(t.v);
            }
          }
          // Horizontal snap (compare Y coords)
          for (const own of [elCenters.h, elEdges.hT, elEdges.hB]) {
            if (Math.abs(own - t.h) <= THRESHOLD) {
              const delta = t.h - own;
              next.y = Math.max(0, next.y + delta);
              guideH.push(t.h);
            }
          }
        }
      }
      setGuides({ v: Array.from(new Set(guideV)), h: Array.from(new Set(guideH)) });
      patchElement(s.id, { x: next.x, y: next.y, w: next.w, h: next.h }, { skipHistory: true });
    }
    function onUp() {
      dragRef.current = null;
      setGuides({ v: [], h: [] });
    }
    if (isAdmin) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, canvasW]);

  // Esc deselects, Delete/Backspace removes, Cmd/Ctrl+Z undo, Cmd/Ctrl+Shift+Z redo
  useEffect(() => {
    if (!isAdmin) return;
    function onKey(e: KeyboardEvent) {
      const active = document.activeElement;
      const inField = (active && (active as HTMLElement).isContentEditable) ||
                      active?.tagName === "INPUT" || active?.tagName === "TEXTAREA";
      const meta = e.metaKey || e.ctrlKey;
      if (e.key === "Escape") { setSelectedId(null); return; }
      if (meta && e.key.toLowerCase() === "z") {
        if (inField) return;
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        if (inField) return;
        e.preventDefault();
        deleteSelected();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, selectedId, undo, redo]);

  // ── Mobile fallback render: stack vertically by Y ─────────────────────
  if (isMobile && !isAdmin) {
    const stacked = [...elements].sort((a, b) => a.y - b.y);
    return (
      <section
        data-section-id={sectionId}
        className="w-full px-5 py-8"
        style={{ background: bg }}
      >
        <div className="mx-auto flex max-w-md flex-col gap-4">
          {stacked.map((el) => (
            <div key={el.id} className="w-full" style={{ minHeight: 4 }}>
              <RenderElement el={el} mobile />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Desktop / tablet render ───────────────────────────────────────────
  const scaledStyle: React.CSSProperties = {
    width: canvasW,
    height: canvasH,
    background: bg,
    position: "relative",
    margin: "0 auto",
  };

  return (
    <section
      data-section-id={sectionId}
      className="w-full"
      style={{ background: bg, padding: "24px 12px" }}
    >
      {isAdmin && (
        <FreeformAdminToolbar
          onAdd={addElement}
          onDelete={selectedId ? deleteSelected : undefined}
          onDuplicate={selectedId ? duplicateSelected : undefined}
          selectedEl={elements.find((e) => e.id === selectedId) ?? null}
          onPatch={(patch) => selectedId && patchElement(selectedId, patch)}
          onUndo={undo}
          onRedo={redo}
          canUndo={undoStack.current.length > 0}
          canRedo={redoStack.current.length > 0}
          onBringToFront={selectedId ? bringToFront : undefined}
          onSendToBack={selectedId ? sendToBack : undefined}
          onBringForward={selectedId ? bringForward : undefined}
          onSendBackward={selectedId ? sendBackward : undefined}
        />
      )}

      <div
        ref={containerRef}
        className="vs-freeform-canvas"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setSelectedId(null);
        }}
        onDragOver={isAdmin ? (e) => { e.preventDefault(); setIsDraggingFile(true); } : undefined}
        onDragLeave={isAdmin ? () => setIsDraggingFile(false) : undefined}
        onDrop={isAdmin ? async (e) => {
          e.preventDefault();
          setIsDraggingFile(false);
          const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
          if (files.length === 0) return;
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const scale = rect.width / canvasW;
          const x = (e.clientX - rect.left) / scale;
          const y = (e.clientY - rect.top) / scale;
          for (const f of files) await uploadAndPlaceImage(f, x, y);
        } : undefined}
        style={{
          ...scaledStyle,
          maxWidth: "100%",
          // Responsive scaling: shrink canvas proportionally below 1200px.
          // We keep coordinates pixel-perfect by transform: scale, so the
          // canvas never reflows.
          transform: "none",
        }}
      >
        {/* Drag-drop overlay when dragging files over the canvas */}
        {isAdmin && isDraggingFile && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
            style={{
              background: "rgba(99,102,241,0.10)",
              border: "3px dashed #6366f1",
              borderRadius: 4,
            }}
          >
            <div className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              Pusť obrázek pro upload
            </div>
          </div>
        )}

        {/* Alignment guides — vertical & horizontal red lines */}
        {isAdmin && guides.v.map((v, i) => (
          <div
            key={`gv-${i}-${v}`}
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              left: v - 0.5,
              top: 0,
              width: 1,
              height: "100%",
              background: "#ef4444",
              boxShadow: "0 0 4px rgba(239,68,68,0.6)",
              zIndex: 3,
            }}
          />
        ))}
        {isAdmin && guides.h.map((h, i) => (
          <div
            key={`gh-${i}-${h}`}
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              top: h - 0.5,
              left: 0,
              height: 1,
              width: "100%",
              background: "#ef4444",
              boxShadow: "0 0 4px rgba(239,68,68,0.6)",
              zIndex: 3,
            }}
          />
        ))}
        {/* Subtle dotted grid in admin mode */}
        {isAdmin && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgba(15,23,42,0.10) 1px, transparent 1px)",
              backgroundSize: `${GRID}px ${GRID}px`,
            }}
          />
        )}

        {elements.map((el) => {
          const selected = selectedId === el.id;
          const hovered = hoverId === el.id;
          return (
            <div
              key={el.id}
              onMouseDown={(e) => startDrag(e, el, "move")}
              onMouseEnter={() => setHoverId(el.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
              className={isAdmin ? "vs-ff-element" : undefined}
              style={{
                position: "absolute",
                left: el.x,
                top: el.y,
                width: el.w,
                height: el.h,
                cursor: isAdmin ? (dragRef.current ? "grabbing" : "grab") : "default",
                outline: isAdmin
                  ? selected
                    ? "2px solid #6366f1"
                    : hovered
                      ? "1px dashed rgba(99,102,241,0.6)"
                      : "none"
                  : "none",
                outlineOffset: 2,
                boxSizing: "border-box",
              }}
            >
              <RenderElement
                el={el}
                onTextChange={isAdmin ? (next) => patchElement(el.id, { text: next } as Partial<FreeformEl>) : undefined}
              />
              {isAdmin && selected && (
                <>
                  {/* 8 resize handles */}
                  {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const).map((corner) => {
                    const pos = handlePosition(corner);
                    return (
                      <div
                        key={corner}
                        onMouseDown={(e) => startDrag(e, el, corner)}
                        className="vs-ff-handle"
                        style={{
                          position: "absolute",
                          width: 10,
                          height: 10,
                          background: "#ffffff",
                          border: "2px solid #6366f1",
                          borderRadius: 2,
                          cursor: handleCursor(corner),
                          ...pos,
                          zIndex: 2,
                        }}
                      />
                    );
                  })}
                  {/* size badge */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute"
                    style={{
                      bottom: -22,
                      right: 0,
                      background: "#6366f1",
                      color: "#fff",
                      fontSize: 10,
                      fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      padding: "2px 6px",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {el.w}×{el.h} · {el.x},{el.y}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Empty state hint */}
        {isAdmin && elements.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 px-6 py-4 text-center backdrop-blur-sm">
              <p className="text-sm font-semibold text-slate-700">Volné plátno</p>
              <p className="mt-0.5 text-xs text-slate-500">Klikni <strong>+ Heading / Text / …</strong> v horní liště</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

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

function RenderElement({
  el, onTextChange, mobile,
}: { el: FreeformEl; onTextChange?: (next: string) => void; mobile?: boolean }) {
  const editable = !!onTextChange;
  const commonStyle: React.CSSProperties = {
    width: "100%", height: "100%",
    color: el.style?.color,
    background: el.style?.background,
    fontSize: el.style?.fontSize,
    fontWeight: el.style?.fontWeight,
    textAlign: el.style?.textAlign,
    borderRadius: el.style?.borderRadius,
    border: el.style?.border,
    display: "flex",
    alignItems: el.type === "button" ? "center" : "flex-start",
    justifyContent:
      el.style?.textAlign === "center" ? "center" :
      el.style?.textAlign === "right" ? "flex-end" :
      "flex-start",
    padding: el.type === "button" ? "0 16px" : 0,
    boxSizing: "border-box",
    overflow: "hidden",
    lineHeight: el.type === "heading" ? 1.15 : 1.5,
    wordBreak: "break-word",
  };

  if (mobile) {
    commonStyle.height = "auto";
    commonStyle.minHeight = el.type === "image" ? 200 : "auto";
  }

  switch (el.type) {
    case "heading": {
      const Tag = (`h${el.level ?? 1}`) as keyof React.JSX.IntrinsicElements;
      return (
        <Tag
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => onTextChange?.((e.target as HTMLElement).textContent ?? "")}
          style={commonStyle}
        >
          {el.text}
        </Tag>
      );
    }
    case "text":
      return (
        <p
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => onTextChange?.((e.target as HTMLElement).textContent ?? "")}
          style={commonStyle}
        >
          {el.text}
        </p>
      );
    case "button":
      return (
        <a
          href={el.href || "#"}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={(e) => onTextChange?.((e.target as HTMLElement).textContent ?? "")}
          onClick={editable ? (e) => e.preventDefault() : undefined}
          style={{ ...commonStyle, textDecoration: "none" }}
        >
          {el.text}
        </a>
      );
    case "image":
      if (!el.src) {
        return (
          <div style={{ ...commonStyle, alignItems: "center", justifyContent: "center", background: "#f1f5f9", border: "1px dashed #cbd5e1", color: "#64748b", fontSize: 12 }}>
            Klik → vlož URL obrázku
          </div>
        );
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={el.src}
          alt={el.alt ?? ""}
          style={{ ...commonStyle, objectFit: el.objectFit ?? "cover", display: "block" }}
        />
      );
    case "divider":
      return <hr style={{ ...commonStyle, border: "none", margin: 0, background: el.style?.background ?? "#e2e8f0" }} />;
    case "shape":
      return <div style={commonStyle} />;
  }
}

function FreeformAdminToolbar({
  onAdd, onDelete, onDuplicate, selectedEl, onPatch,
  onUndo, onRedo, canUndo, canRedo,
  onBringToFront, onSendToBack, onBringForward, onSendBackward,
}: {
  onAdd: (t: ElementType) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  selectedEl: FreeformEl | null;
  onPatch: (patch: Partial<FreeformEl>) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 70,
        zIndex: 5,
        marginBottom: 12,
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
        padding: "6px 8px",
        borderRadius: 10,
        background: "rgba(15,23,42,0.94)",
        boxShadow: "0 12px 24px rgba(15,23,42,0.28)",
        color: "#fff",
      }}
    >
      {/* Undo / Redo */}
      <button onClick={onUndo} disabled={!canUndo} title="Zpět (⌘Z)" style={{ ...iconBtnStyle, opacity: canUndo ? 1 : 0.4 }}>
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button onClick={onRedo} disabled={!canRedo} title="Vpřed (⌘⇧Z)" style={{ ...iconBtnStyle, opacity: canRedo ? 1 : 0.4 }}>
        <Redo2 className="h-3.5 w-3.5" />
      </button>
      <span style={{ height: 18, width: 1, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />

      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, opacity: 0.6, paddingLeft: 4 }}>Přidat:</span>
      <ToolBtn onClick={() => onAdd("heading")} icon={<Type className="h-3.5 w-3.5" />} label="Heading" />
      <ToolBtn onClick={() => onAdd("text")}    icon={<AlignLeft className="h-3.5 w-3.5" />} label="Text" />
      <ToolBtn onClick={() => onAdd("button")}  icon={<MousePointer className="h-3.5 w-3.5" />} label="Button" />
      <ToolBtn onClick={() => onAdd("image")}   icon={<ImageIcon className="h-3.5 w-3.5" />} label="Image" />
      <ToolBtn onClick={() => onAdd("divider")} icon={<Minus className="h-3.5 w-3.5" />} label="Divider" />
      <ToolBtn onClick={() => onAdd("shape")}   icon={<Square className="h-3.5 w-3.5" />} label="Shape" />

      {selectedEl && (
        <>
          <span style={{ height: 18, width: 1, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />
          {(selectedEl.type === "heading" || selectedEl.type === "text" || selectedEl.type === "button") && (
            <>
              <input
                type="color"
                value={selectedEl.style?.color ?? "#0f172a"}
                onChange={(e) => onPatch({ style: { ...selectedEl.style, color: e.target.value } } as Partial<FreeformEl>)}
                title="Barva textu"
                style={{ width: 24, height: 24, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
              />
              <input
                type="number"
                value={selectedEl.style?.fontSize ?? 16}
                onChange={(e) => onPatch({ style: { ...selectedEl.style, fontSize: parseInt(e.target.value, 10) || 16 } } as Partial<FreeformEl>)}
                style={{ width: 50, height: 24, padding: "0 4px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 11 }}
                title="Velikost (px)"
              />
              <select
                value={selectedEl.style?.fontWeight ?? 400}
                onChange={(e) => onPatch({ style: { ...selectedEl.style, fontWeight: parseInt(e.target.value, 10) } } as Partial<FreeformEl>)}
                style={{ height: 24, borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 11 }}
              >
                <option value={300}>300</option>
                <option value={400}>400</option>
                <option value={500}>500</option>
                <option value={600}>600</option>
                <option value={700}>700</option>
                <option value={800}>800</option>
              </select>
            </>
          )}
          {(selectedEl.type === "button" || selectedEl.type === "shape" || selectedEl.type === "divider") && (
            <input
              type="color"
              value={selectedEl.style?.background ?? "#6366f1"}
              onChange={(e) => onPatch({ style: { ...selectedEl.style, background: e.target.value } } as Partial<FreeformEl>)}
              title="Barva pozadí"
              style={{ width: 24, height: 24, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
            />
          )}
          {selectedEl.type === "image" && (
            <input
              type="url"
              value={(selectedEl as ImageEl).src ?? ""}
              onChange={(e) => onPatch({ src: e.target.value } as Partial<FreeformEl>)}
              placeholder="https://… (URL obrázku)"
              style={{ width: 220, height: 24, padding: "0 6px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 11 }}
            />
          )}
          {selectedEl.type === "button" && (
            <input
              type="url"
              value={(selectedEl as ButtonEl).href ?? ""}
              onChange={(e) => onPatch({ href: e.target.value } as Partial<FreeformEl>)}
              placeholder="Odkaz"
              style={{ width: 160, height: 24, padding: "0 6px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 11 }}
            />
          )}
          {/* Z-index controls */}
          <span style={{ height: 18, width: 1, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />
          {onBringToFront && (
            <button onClick={onBringToFront} title="Úplně dopředu" style={iconBtnStyle}>
              <ChevronsUp className="h-3.5 w-3.5" />
            </button>
          )}
          {onBringForward && (
            <button onClick={onBringForward} title="O úroveň dopředu" style={iconBtnStyle}>
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          )}
          {onSendBackward && (
            <button onClick={onSendBackward} title="O úroveň dozadu" style={iconBtnStyle}>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          )}
          {onSendToBack && (
            <button onClick={onSendToBack} title="Úplně dozadu" style={iconBtnStyle}>
              <ChevronsDown className="h-3.5 w-3.5" />
            </button>
          )}
          <span style={{ height: 18, width: 1, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />

          {onDuplicate && (
            <button onClick={onDuplicate} title="Duplikovat" style={iconBtnStyle}>
              <CopyIcon className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} title="Smazat" style={{ ...iconBtnStyle, color: "#fda4af" }}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: 26, width: 26, padding: 0,
  borderRadius: 6, border: "none",
  background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer",
};

function ToolBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        height: 26, padding: "0 8px",
        borderRadius: 6, border: "none",
        background: "rgba(255,255,255,0.08)", color: "#fff",
        fontSize: 11, fontWeight: 600, cursor: "pointer",
      }}
    >
      <Plus className="h-3 w-3" strokeWidth={2.5} />
      {icon}
      {label}
    </button>
  );
}

// surface unused element types so eslint doesn't strip them
void X;

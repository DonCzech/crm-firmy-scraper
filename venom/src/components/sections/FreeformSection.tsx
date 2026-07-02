"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * FreeformSection — pixel-perfect canvas where every element has absolute
 * coordinates (x/y/w/h) on a fixed 1200×N grid. In admin mode the user gets
 * mouse drag-to-move, 8 resize handles per element, a snap-to-10px grid and
 * a floating element library. On mobile (<768px) the canvas auto-stacks
 * elements vertically in Y-order so the layout never breaks on phones.
 *
 * Internals (drag engine, element types, toolbar) are in
 * `src/components/core/freeform/`. This file is a thin stateful wrapper that
 * owns undo/redo + DB persistence and renders the shared <FreeformCanvas>.
 */

import {
  FreeformCanvas, RenderElement,
  CANVAS_MOBILE_BREAKPOINT,
  type FreeformContent, type FreeformEl,
} from "@/components/core/freeform";

const MAX_HISTORY = 50;

interface Props {
  content: FreeformContent;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}

export function FreeformSection({ content, sectionId, tenantSlug, isAdmin }: Props) {
  const canvasW = content.width  ?? 1200;
  const canvasH = content.height ?? 720;
  const bg      = content.background ?? "#ffffff";

  const [elements,    setElements]    = useState<FreeformEl[]>(content.elements ?? []);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [isMobile,    setIsMobile]    = useState(false);

  const elementsRef = useRef<FreeformEl[]>(elements);
  elementsRef.current = elements;

  const undoStack = useRef<FreeformEl[][]>([]);
  const redoStack = useRef<FreeformEl[][]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from props (e.g. after external restore)
  useEffect(() => { setElements(content.elements ?? []); }, [content.elements]);

  // Mobile detection
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < CANVAS_MOBILE_BREAKPOINT); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Debounced DB persist
  const persist = useCallback((nextEls: FreeformEl[]) => {
    if (!isAdmin || !tenantSlug) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const newContent: FreeformContent = { width: canvasW, height: canvasH, background: bg, elements: nextEls };
      void fetch(`/api/demo/${tenantSlug}/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ settings: { content: newContent } }),
      });
    }, 600);
  }, [isAdmin, tenantSlug, sectionId, canvasW, canvasH, bg]);

  // Undo/redo
  const commitHistory = useCallback(() => {
    undoStack.current.push(JSON.parse(JSON.stringify(elementsRef.current)));
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift();
    redoStack.current = [];
  }, []);

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

  // Keyboard shortcuts: Esc, Delete, Cmd+Z, Cmd+Shift+Z
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
        // Delete is handled by Canvas but keyboard shortcut needs selectedId
        setElements((prev) => {
          const next = prev.filter((el) => el.id !== selectedId);
          persist(next);
          return next;
        });
        setSelectedId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, selectedId, undo, redo]);

  function handleChange(next: FreeformEl[]) {
    setElements(next);
    persist(next);
  }

  // ── Mobile fallback: stack elements vertically by Y ───────────────────
  if (isMobile && !isAdmin) {
    const stacked = [...elements].sort((a, b) => a.y - b.y);
    return (
      <section data-section-id={sectionId} className="w-full px-5 py-8" style={{ background: bg }}>
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

  // ── Desktop / tablet ──────────────────────────────────────────────────
  return (
    <section
      data-section-id={sectionId}
      className="w-full"
      style={{ background: bg, padding: "24px 12px" }}
    >
      <FreeformCanvas
        elements={elements}
        onChange={handleChange}
        onCommitHistory={commitHistory}
        selectedId={selectedId}
        onSelect={setSelectedId}
        width={canvasW}
        height={canvasH}
        background={bg}
        isAdmin={isAdmin}
        tenantSlug={tenantSlug}
        canUndo={undoStack.current.length > 0}
        canRedo={redoStack.current.length > 0}
        onUndo={undo}
        onRedo={redo}
      />
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useStudio } from "./StudioContext";
import type { Section } from "@/lib/db";
import type { StudioState } from "./TenantStudioView";

const MIN = 0;
const MAX = 240;
const SNAP = 8;

function snap(v: number) {
  return Math.round(v / SNAP) * SNAP;
}
function clamp(v: number) {
  return Math.max(MIN, Math.min(MAX, v));
}

/**
 * Bottom-edge resize handle that lets the user drag the section's
 * paddingBottom directly on the canvas. Live preview comes from
 * `studio.transientPadding`; commit happens on pointerup via
 * `state.patchSection`. Value tooltip is shown next to the cursor while
 * dragging. Snap to 8 px.
 *
 * Only rendered when the section is `selected` and the studio shell
 * decided to make this section sortable (i.e. on desktop/tablet, not
 * mobile breakpoint, and not navbar/footer locks).
 */
export function SectionResizeHandle({
  section, state,
}: {
  section: Section;
  state: StudioState;
}) {
  const studio = useStudio();
  const dragState = useRef<{
    startY: number;
    startPad: number;
    rafPending: number | null;
    lastClientY: number;
  } | null>(null);
  const [draggingValue, setDraggingValue] = useState<number | null>(null);

  // Read saved paddingBottom as the starting baseline.
  const savedPad = (section.settings?.layout as { paddingBottom?: number } | undefined)?.paddingBottom ?? 0;

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      startY: e.clientY,
      startPad: savedPad,
      rafPending: null,
      lastClientY: e.clientY,
    };
    setDraggingValue(savedPad);
  }

  function applyTransient(value: number) {
    studio.setTransientPadding({ sectionId: section.id, paddingBottom: value });
    setDraggingValue(value);
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const d = dragState.current;
    if (!d) return;
    d.lastClientY = e.clientY;
    if (d.rafPending != null) return;
    d.rafPending = requestAnimationFrame(() => {
      if (!dragState.current) return;
      dragState.current.rafPending = null;
      const delta = dragState.current.lastClientY - dragState.current.startY;
      const next = clamp(snap(dragState.current.startPad + delta));
      applyTransient(next);
    });
  }

  function onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const d = dragState.current;
    if (!d) return;
    if (d.rafPending != null) cancelAnimationFrame(d.rafPending);
    const delta = d.lastClientY - d.startY;
    const finalPad = clamp(snap(d.startPad + delta));
    dragState.current = null;
    setDraggingValue(null);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    // Commit only if value actually changed.
    if (finalPad !== savedPad) {
      const layout = { ...(section.settings?.layout ?? {}), paddingBottom: finalPad };
      void state.patchSection(section.id, {
        settings: { ...(section.settings ?? {}), layout },
      });
    }
    studio.setTransientPadding(null);
  }

  // Defensive cleanup: if the component unmounts mid-drag (section deleted,
  // selection changed) clear any pending RAF + transient state so nothing leaks.
  useEffect(() => {
    return () => {
      const d = dragState.current;
      if (d?.rafPending != null) cancelAnimationFrame(d.rafPending);
      dragState.current = null;
      if (studio.transientPadding?.sectionId === section.id) {
        studio.setTransientPadding(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id]);

  const dragging = draggingValue !== null;

  return (
    <button
      type="button"
      aria-label="Změnit výšku sekce přetažením"
      title="Táhni pro úpravu spodní mezery"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={clsx(
        "pointer-events-auto absolute bottom-0 left-1/2 z-[60] -translate-x-1/2 flex items-center justify-center transition-all",
        dragging
          ? "h-2 w-32 cursor-ns-resize"
          : "h-1.5 w-20 cursor-ns-resize hover:h-2 hover:w-32"
      )}
      style={{ touchAction: "none" }}
    >
      {/* Grip pill */}
      <span
        className={clsx(
          "block h-full w-full rounded-t-full shadow-md transition-colors",
          dragging ? "bg-blue-500" : "bg-blue-600/80 hover:bg-blue-500"
        )}
      />
      {/* Value tooltip during drag */}
      {dragging && (
        <span
          className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-md bg-[var(--vs-surface)] px-2 py-0.5 text-[11px] font-mono text-white shadow-lg ring-1 ring-white/10"
        >
          {draggingValue} px
        </span>
      )}
    </button>
  );
}

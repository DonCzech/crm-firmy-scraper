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
/** Horní mez roste s výchozí hodnotou — šablona může mít vlastní padding
 *  větší než MAX a clamp by ho při prvním tahu skokově ořízl. */
function clamp(v: number, max = MAX) {
  return Math.max(MIN, Math.min(Math.max(max, MAX), v));
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
    /** Měřítko canvasu (zoom/fit) — screen px → canvas px. */
    scale: number;
    rafPending: number | null;
    lastClientY: number;
  } | null>(null);
  const [draggingValue, setDraggingValue] = useState<number | null>(null);

  // Uložená hodnota slideru — undefined znamená „šablona si padding řídí sama".
  const savedPad = (section.settings?.layout as { paddingBottom?: number } | undefined)?.paddingBottom;

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    // Baseline = SKUTEČNĚ vykreslený padding-bottom. Jakmile se totiž
    // paddingBottom nastaví (i transientně), wrapper přebírá odpovědnost za
    // celou osu a vlastní padding šablony se nuluje (SectionRenderer
    // overrideCss). Start z `saved ?? 0` proto sekci při prvním tahu skokově
    // ZMENŠIL o šablonový padding — místo roztažení se po puštění smrskla.
    // Pozor: [data-sr-id] wrapper existuje JEN u sekcí s layout overridem —
    // kotvíme přes SectionFrame ([data-section-id]), který je v canvasu vždy.
    const wrapEl = document.querySelector<HTMLElement>(`[data-section-id="${section.id}"]`);
    let startPad = savedPad;
    if (typeof startPad !== "number") {
      const templateSection = wrapEl?.querySelector("section") ?? wrapEl;
      startPad = templateSection
        ? Math.round(parseFloat(getComputedStyle(templateSection).paddingBottom) || 0)
        : 0;
    }

    // Canvas je škálovaný (zoom / fit) — delta kurzoru v px obrazovky se musí
    // přepočítat na px plátna, jinak drag „neposlouchá" kurzor.
    const scale = wrapEl && wrapEl.offsetWidth > 0
      ? (wrapEl.getBoundingClientRect().width / wrapEl.offsetWidth) || 1
      : 1;

    dragState.current = {
      startY: e.clientY,
      startPad,
      scale,
      rafPending: null,
      lastClientY: e.clientY,
    };
    setDraggingValue(startPad);
    // Okamžitý live přenos baseline — přechod šablonový padding → wrapper
    // padding je tak vizuálně neutrální už od prvního pixelu tahu.
    studio.setTransientPadding({ sectionId: section.id, paddingBottom: startPad });
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
      const delta = (dragState.current.lastClientY - dragState.current.startY) / dragState.current.scale;
      const next = clamp(snap(dragState.current.startPad + delta), dragState.current.startPad);
      applyTransient(next);
    });
  }

  function onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const d = dragState.current;
    if (!d) return;
    if (d.rafPending != null) cancelAnimationFrame(d.rafPending);
    const delta = (d.lastClientY - d.startY) / d.scale;
    const finalPad = clamp(snap(d.startPad + delta), d.startPad);
    dragState.current = null;
    setDraggingValue(null);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    // Commit jen při reálné změně proti baseline (u nedotčené šablony je
    // baseline měřený padding — klik bez tahu nesmí nic přepsat).
    if (finalPad !== d.startPad) {
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
          dragging ? "bg-[var(--vs-accent-solid)]" : "bg-[var(--vs-accent-solid)]/80 hover:bg-[var(--vs-accent-solid-hi)]"
        )}
      />
      {/* Value tooltip during drag */}
      {dragging && (
        <span
          className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-md bg-[var(--vs-surface)] px-2 py-0.5 text-[11px] font-mono text-[var(--vs-text)] shadow-lg ring-1 ring-white/10"
        >
          {draggingValue} px
        </span>
      )}
    </button>
  );
}

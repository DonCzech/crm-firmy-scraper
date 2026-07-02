"use client";

/**
 * T2.2 — OverlayLayer
 *
 * Freeform pixel canvas mounted absolutely over (or under) a section's variant
 * content. Reuses the shared FreeformCanvas engine from core/freeform/.
 *
 * Mount twice in SectionFrame — once for "above" and once for "below":
 *
 *   <OverlayLayer section={section} layer="below" patchSection={...} isAdmin selected />
 *   {children}   ← variant content
 *   <OverlayLayer section={section} layer="above" patchSection={...} isAdmin selected />
 *
 * The component returns null when the overlay is not enabled or its `layer`
 * doesn't match the mount position. T2.3 will add the toggle to the inspector.
 *
 * Z-index contract (from §II ARCHITEKTURA):
 *   bg=0, content=10, overlay-below=5, overlay-above=15, fixed-ui=100
 *
 * Dimensions: sized to match the section's actual rendered height via
 * ResizeObserver on [data-section-id="X"]. Width always 100%.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { FreeformCanvas, RenderElement, type FreeformEl } from "@/components/core/freeform";
import type { Section } from "@/lib/db";
import { CANVAS_MOBILE_BREAKPOINT, defaultElement } from "@/components/core/freeform";
import type { ElementType } from "@/components/core/freeform";
import { useStudioOptional } from "./StudioContext";

function animClass(el: FreeformEl): string {
  const preset = el.animation?.preset;
  if (!preset || preset === "none") return "";
  const map: Record<string, string> = {
    "fade-in":    "ff-anim-fade-in",
    "slide-up":   "ff-anim-slide-up",
    "slide-right":"ff-anim-slide-right",
    "zoom-in":    "ff-anim-zoom-in",
    "scale-hover":"ff-anim-scale-hover",
  };
  return map[preset] ?? "";
}

interface OverlaySettings {
  enabled: boolean;
  layer: "above" | "below";
  elements: FreeformEl[];
}

function readOverlay(section: Section): OverlaySettings | null {
  const s = section.settings as Record<string, unknown> | undefined;
  const o = s?.overlay as OverlaySettings | undefined;
  if (!o) return null;
  return { enabled: !!o.enabled, layer: o.layer ?? "above", elements: o.elements ?? [] };
}

interface Props {
  section: Section;
  layer: "above" | "below";
  patchSection: (id: number, patch: Partial<Pick<Section, "settings">>) => Promise<void>;
  isAdmin: boolean;
  selected: boolean;
  tenantSlug?: string;
  /** Globální undo historie (TenantStudioView) — overlay edity se zapisují tam,
   *  žádný lokální undo stack (dřív ⌘Z spouštěl obě historie najednou). */
  recordHistory?: (sectionId: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  /** Okamžitý lokální sync elementů do sections state (bez PATCH) — historie
   *  pak snapshotuje aktuální overlay stav, ne 600 ms starý. */
  updateSectionLocal?: (id: number, patch: Partial<Section>) => void;
}

export function OverlayLayer({ section, layer, patchSection, isAdmin, selected, tenantSlug, recordHistory, onUndo, onRedo, canUndo, canRedo, updateSectionLocal }: Props) {
  const overlay = readOverlay(section);

  // Nothing to render: overlay disabled or wrong layer
  if (!overlay?.enabled || overlay.layer !== layer) return null;

  return (
    <OverlayLayerInner
      section={section}
      layer={layer}
      patchSection={patchSection}
      isAdmin={isAdmin}
      selected={selected}
      tenantSlug={tenantSlug}
      recordHistory={recordHistory}
      onUndo={onUndo}
      onRedo={onRedo}
      canUndo={canUndo}
      canRedo={canRedo}
      updateSectionLocal={updateSectionLocal}
      initialElements={overlay.elements}
    />
  );
}

function OverlayLayerInner({
  section, layer, patchSection, isAdmin, selected, tenantSlug, initialElements,
  recordHistory, onUndo, onRedo, canUndo, canRedo, updateSectionLocal,
}: Props & { initialElements: FreeformEl[] }) {
  const [elements, setElements]    = useState<FreeformEl[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasH, setCanvasH]      = useState(600);
  const [canvasW, setCanvasW]      = useState(1200);
  const [isMobile, setIsMobile]    = useState(false);

  const elementsRef  = useRef(elements);
  elementsRef.current = elements;
  const saveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const studio       = useStudioOptional();

  // Sync if parent section settings change externally.
  // Use the RAW array reference from settings (no `?? []` fallback here) so the
  // dependency is stable when elements haven't been set yet — avoids infinite loop.
  const rawOverlayElements = (
    (section.settings as Record<string, unknown> | undefined)?.overlay as
      { elements?: FreeformEl[] } | undefined
  )?.elements;
  const prevSettingsRef = useRef(rawOverlayElements);
  useEffect(() => {
    if (rawOverlayElements !== prevSettingsRef.current) {
      prevSettingsRef.current = rawOverlayElements;
      // Externí změna (typicky globální undo/redo) má přednost — zruš rozjetý
      // persist timer, jinak by stale elementy přepsaly právě vrácený stav.
      if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
      setElements(rawOverlayElements ?? []);
    }
  }, [rawOverlayElements]);

  // Measure the section's actual rendered height for the canvas
  useEffect(() => {
    const el = document.querySelector(`[data-section-id="${section.id}"]`);
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setCanvasH(Math.max(100, Math.round(entry.contentRect.height)));
      setCanvasW(Math.max(320, Math.round(entry.contentRect.width)));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [section.id]);

  // Mobile detection
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < CANVAS_MOBILE_BREAKPOINT); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Sync selected overlay element to StudioContext so inspector can read it
  useEffect(() => {
    if (!studio) return;
    if (selectedId) {
      studio.setSelectedOverlayEl({ sectionId: section.id, elementId: selectedId });
    } else if (studio.selectedOverlayEl?.sectionId === section.id) {
      studio.setSelectedOverlayEl(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Consume z-order commands from inspector
  useEffect(() => {
    if (!studio?.overlayZOrderCmd) return;
    if (studio.overlayZOrderCmd.sectionId !== section.id) return;
    const { cmd } = studio.overlayZOrderCmd;
    studio.setOverlayZOrderCmd(null);
    if (!selectedId) return;
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === selectedId);
      if (idx < 0) return prev;
      const next = [...prev];
      const [el] = next.splice(idx, 1);
      if (cmd === "front")   next.push(el);
      else if (cmd === "back")     next.unshift(el);
      else if (cmd === "forward")  next.splice(Math.min(idx + 1, next.length), 0, el);
      else                         next.splice(Math.max(idx - 1, 0), 0, el);
      persist(next);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studio?.overlayZOrderCmd]);

  // Consume pendingAddEl from StudioContext — add new element and select it
  useEffect(() => {
    if (!studio?.pendingAddEl) return;
    if (studio.pendingAddEl.sectionId !== section.id) return;
    const { elementType } = studio.pendingAddEl;
    studio.setPendingAddEl(null);
    const base = defaultElement(elementType as ElementType, Date.now());
    // Center vertically in the visible canvas area
    const el: FreeformEl = { ...base, y: Math.max(0, Math.round(canvasH / 3)) };
    recordHistory?.(section.id);
    const next = [...elementsRef.current, el];
    setElements(next);
    setSelectedId(el.id);
    persist(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studio?.pendingAddEl]);

  const persist = useCallback((els: FreeformEl[]) => {
    if (!isAdmin) return;
    const nextSettings = {
      ...(section.settings as Record<string, unknown>),
      overlay: {
        ...(section.settings as Record<string, unknown>).overlay as object,
        elements: els,
      },
    };
    // Okamžitý sync do sections state (kvůli globální historii) — označíme si ho
    // jako vlastní, aby ho sync-effect nepovažoval za externí změnu.
    prevSettingsRef.current = els;
    updateSectionLocal?.(section.id, { settings: nextSettings as Section["settings"] });
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void patchSection(section.id, { settings: nextSettings as Section["settings"] });
    }, 600);
  }, [isAdmin, patchSection, section, updateSectionLocal]);

  // Historie žije globálně v TenantStudioView. Pozor: snapshot sekcí se bere
  // PŘED lokální mutací — overlay elementy doputují do sections až přes persist.
  const commitHistory = useCallback(() => {
    recordHistory?.(section.id);
  }, [recordHistory, section.id]);

  function handleChange(next: FreeformEl[]) {
    setElements(next);
    persist(next);
  }

  // Keyboard shortcuts when overlay is active and selected
  useEffect(() => {
    if (!isAdmin || !selected) return;
    function onKey(e: KeyboardEvent) {
      const active = document.activeElement;
      const inField = (active && (active as HTMLElement).isContentEditable) ||
                      active?.tagName === "INPUT" || active?.tagName === "TEXTAREA";
      // ⌘Z/⌘⇧Z řeší globální handler v TenantStudioView (jednotná historie)
      if (e.key === "Escape") { setSelectedId(null); return; }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        if (inField) return;
        e.preventDefault();
        commitHistory();
        const next = elementsRef.current.filter(el => el.id !== selectedId);
        setElements(next);
        setSelectedId(null);
        persist(next);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, selected, selectedId]);

  const zIndex = layer === "above" ? 15 : 5;

  // Mobile: render elements stacked vertically, no editing
  if (isMobile && !isAdmin) {
    const stacked = [...elements]
      .filter((el) => !el.mobileHidden)
      .sort((a, b) => a.y - b.y);
    if (!stacked.length) return null;
    return (
      <div
        aria-label={`Overlay vrstva (${layer})`}
        style={{ position: "absolute", inset: 0, zIndex, pointerEvents: "none", overflow: "hidden" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 16px" }}>
          {stacked.map((el) => (
            <div key={el.id} className={animClass(el) || undefined} style={{ minHeight: 4 }}>
              <RenderElement el={el} mobile />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Public read-only: render elements at their absolute positions, no handles
  if (!isAdmin) {
    if (!elements.length) return null;
    return (
      <div
        aria-label={`Overlay vrstva (${layer})`}
        style={{ position: "absolute", inset: 0, zIndex, pointerEvents: "none", overflow: "hidden" }}
      >
        {elements.map((el) => (
          <div
            key={el.id}
            className={animClass(el) || undefined}
            style={{
              position: "absolute",
              left: `${(el.x / canvasW) * 100}%`,
              top:  `${(el.y / canvasH) * 100}%`,
              width: `${(el.w / canvasW) * 100}%`,
              height: el.h,
            }}
          >
            <RenderElement el={el} />
          </div>
        ))}
      </div>
    );
  }

  // Admin — full canvas with handles (only when section is selected)
  // When not selected: show elements as non-interactive shadows
  if (!selected) {
    if (!elements.length) return null;
    return (
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, zIndex, pointerEvents: "none", overflow: "hidden" }}
      >
        {elements.map((el) => (
          <div
            key={el.id}
            style={{
              position: "absolute",
              left: `${(el.x / canvasW) * 100}%`,
              top:  `${(el.y / canvasH) * 100}%`,
              width: `${(el.w / canvasW) * 100}%`,
              height: el.h,
              opacity: 0.5,
            }}
          >
            <RenderElement el={el} />
          </div>
        ))}
      </div>
    );
  }

  // Admin + selected: full FreeformCanvas
  return (
    <div
      aria-label={`Overlay vrstva (${layer}) — editovatelná`}
      style={{
        position: "absolute",
        inset: 0,
        zIndex,
        // Canvas itself sets pointer-events; wrapper allows clicks through to
        // section content when user clicks on empty canvas area.
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div style={{ pointerEvents: "auto", width: "100%", height: canvasH }}>
        <FreeformCanvas
          elements={elements}
          onChange={handleChange}
          onCommitHistory={commitHistory}
          selectedId={selectedId}
          onSelect={setSelectedId}
          width={canvasW}
          height={canvasH}
          background="transparent"
          isAdmin={isAdmin}
          tenantSlug={tenantSlug}
          canUndo={!!canUndo}
          canRedo={!!canRedo}
          onUndo={onUndo ?? (() => {})}
          onRedo={onRedo ?? (() => {})}
        />
      </div>
    </div>
  );
}

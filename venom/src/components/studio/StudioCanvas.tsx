"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import clsx from "clsx";
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
import { SectionRenderer } from "@/components/tenant/SectionRenderer";
import { applyOverrides } from "@/lib/overrides";
import { useStudio } from "./StudioContext";
import { SectionFrame } from "./SectionFrame";
import { ClonedStudioFrame } from "./ClonedStudioFrame";
import { InsertionGap } from "./InsertionGap";
import { DesignOverrides } from "./design/DesignOverrides";
import { buildSectionLibrary } from "@/sections/variants";
import { getSectionIcon, getSectionLabel } from "./studio-icons";
import type { Section } from "@/lib/db";
import type { StudioState } from "./TenantStudioView";

/** SortableSectionFrame — wraps a section in dnd-kit useSortable and forwards
 *  the drag handle props to SectionFrame so the grip handle in the section
 *  header can initiate the drag. Used only for "middle" sections (everything
 *  except navbar / footer) and only on desktop / tablet breakpoints. */
function SortableSectionFrame({
  section, state, children,
}: {
  section: Section;
  state: StudioState;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });
  return (
    <SectionFrame
      section={section}
      state={state}
      dragAttributes={attributes}
      dragListeners={listeners}
      setDragRef={setNodeRef}
      isDragging={isDragging}
      dragStyle={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {children}
    </SectionFrame>
  );
}

const CANVAS_LIBRARY = buildSectionLibrary().filter(
  (e) => e.type !== "navbar" && e.type !== "footer" && e.type !== "full-page-clone" && e.type !== "astera-home"
);

/** Drop zone + click-to-add area at the bottom of the canvas */
function CanvasDropZone({ insertAtIndex, state }: { insertAtIndex: number; state: StudioState }) {
  const [dragOver, setDragOver] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOut(e: MouseEvent) {
      if (ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, [open]);

  function dropSection(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const raw = e.dataTransfer.getData("text/x-venom-section");
    if (!raw) return;
    try {
      const { type, variant } = JSON.parse(raw) as { type: string; variant: string };
      void state.addSection(type, variant ?? "default", insertAtIndex);
    } catch { /* ignore */ }
  }

  return (
    <div
      className={clsx(
        "relative flex min-h-[80px] cursor-pointer items-center justify-center transition-colors duration-150",
        dragOver ? "bg-[var(--vs-accent-bg)]" : "hover:bg-[rgba(212,212,216,0.05)]"
      )}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setDragOver(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false); }}
      onDrop={dropSection}
      onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
    >
      <div className={clsx(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-medium transition-all duration-150 select-none",
        dragOver
          ? "border-[var(--vs-accent)] bg-[var(--vs-accent-solid)] text-white shadow-[var(--vs-glow-brand)]"
          : "border-dashed border-[rgba(212,212,216,0.35)] text-[#6b7280] hover:border-[var(--vs-accent)] hover:text-[var(--vs-accent-hi)] hover:bg-[rgba(212,212,216,0.08)]"
      )}>
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        {dragOver ? "Pustit sem — přidat sekci" : "Přidat sekci"}
      </div>

      {open && (
        <div
          ref={ref}
          className="vs-glass vs-pop absolute bottom-full left-1/2 z-30 mb-2 w-[440px] max-w-[90vw] -translate-x-1/2 rounded-xl border border-[var(--vs-border-strong)] p-3 shadow-[var(--vs-shadow-xl)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--vs-text-muted)]">
            Přidat sekci na konec
          </div>
          <div className="grid max-h-[320px] grid-cols-2 gap-2 overflow-y-auto">
            {CANVAS_LIBRARY.map((item) => {
              const Icon = getSectionIcon(item.type);
              return (
                <button
                  key={`${item.type}-${item.variant}`}
                  type="button"
                  onClick={() => { setOpen(false); void state.addSection(item.type, item.variant, insertAtIndex); }}
                  className="group/btn flex flex-col items-start gap-1.5 rounded-lg border border-[var(--vs-border)] bg-[var(--vs-surface)] p-2.5 text-left text-xs transition-[border,background,transform] duration-150 hover:border-[var(--vs-accent-ring)] hover:bg-[var(--vs-surface-2)] hover:-translate-y-[1px]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--vs-surface-2)] text-[var(--vs-text-muted)] group-hover/btn:bg-[var(--vs-accent-bg)] group-hover/btn:text-[var(--vs-accent-hi)]">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="text-[12px] font-medium text-[var(--vs-text)]">{item.label}</div>
                  <div className="text-[10.5px] leading-snug text-[var(--vs-text-dim)]">{item.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const WIDTHS: Record<string, number> = {
  desktop: 1280,
  tablet: 1024,
  mobile: 390,
};

const PAD_TOP = 0; // template starts flush at top

export function StudioCanvas({ state }: { state: StudioState }) {
  const studio = useStudio();
  const outerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [canvasW, setCanvasW] = useState(0);
  // Refresh key for mobile/tablet iframe — increments to force a reload after saves
  const [iframeRefreshKey, setIframeRefreshKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(false);

  const refreshIframe = useCallback(() => {
    setIframeLoading(true);
    setIframeRefreshKey(k => k + 1);
  }, []);

  // Auto-refresh iframe when switching TO mobile/tablet breakpoint
  const prevBreakpoint = useRef(studio.breakpoint);
  useEffect(() => {
    if (prevBreakpoint.current === "desktop" && studio.breakpoint !== "desktop") {
      refreshIframe();
    }
    prevBreakpoint.current = studio.breakpoint;
  }, [studio.breakpoint, refreshIframe]);

  // Bridge: allow other studio components to refresh the iframe and to
  // live-patch the hero background object-position inside the iframe DOM
  // (used by the focus picker on mobile/tablet breakpoints).
  useEffect(() => {
    function onRefresh() { refreshIframe(); }
    function onLiveFocus(e: Event) {
      const ev = e as CustomEvent<{ sectionId: number; focus: { x: number; y: number } }>;
      const doc = iframeRef.current?.contentDocument;
      if (!doc || !ev.detail) return;
      const sel = `[data-sr-id="${ev.detail.sectionId}"],[data-section-id="${ev.detail.sectionId}"]`;
      const root = doc.querySelector(sel) ?? doc;
      const imgs = root.querySelectorAll("img");
      const pos = `${ev.detail.focus.x}% ${ev.detail.focus.y}%`;
      imgs.forEach((img) => {
        (img as HTMLImageElement).style.objectPosition = pos;
      });
    }
    window.addEventListener("studio:request-iframe-refresh", onRefresh);
    window.addEventListener("studio:request-iframe-live-focus", onLiveFocus as EventListener);
    return () => {
      window.removeEventListener("studio:request-iframe-refresh", onRefresh);
      window.removeEventListener("studio:request-iframe-live-focus", onLiveFocus as EventListener);
    };
  }, [refreshIframe]);

  // Track outer container width so we can scale the template to fit.
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    setCanvasW(el.clientWidth);
    const ro = new ResizeObserver(() => setCanvasW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Click outside any frame deselects
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("[data-section-frame]")) return;
      studio.setSelection(null);
    }
    const el = outerRef.current;
    el?.addEventListener("click", onClick);
    return () => el?.removeEventListener("click", onClick);
  }, [studio]);

  // Scroll to sub-layer target (full-page-clone only)
  useEffect(() => {
    const sel = studio.cloneScrollTarget;
    if (!sel || !outerRef.current) return;
    const el = outerRef.current.querySelector(sel) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    const prev = el.style.outline;
    el.style.outline = "3px solid var(--vs-accent)";
    el.style.outlineOffset = "2px";
    const timer = setTimeout(() => {
      el.style.outline = prev;
      el.style.outlineOffset = "";
    }, 1400);
    return () => clearTimeout(timer);
  }, [studio.cloneScrollTarget]);

  const designTokens = state.sections[0]?.settings?.designTokens as Record<string, string> | undefined;
  // In studio: show ALL sections (incl. hidden) so user can toggle visibility.
  // Hidden sections get a dim overlay via SectionFrame.
  const renderOrder = [...state.sections].sort((a, b) => a.order_index - b.order_index);
  const width = WIDTHS[studio.breakpoint] ?? 1280;
  const isDesktop = studio.breakpoint === "desktop";

  const available = canvasW > 0 ? canvasW : width;
  const scale = Math.min(1, available / width);
  const effectiveZoom = studio.zoom === "fit" ? scale : (studio.zoom / 100);

  // Page URL for iframe preview
  const pageUrl = state.page && !state.page.is_homepage
    ? `/demo/${state.tenant.slug}/${state.page.slug}`
    : `/demo/${state.tenant.slug}`;

  const isMobileBreakpoint = studio.breakpoint === "mobile";
  const middleSections = renderOrder.filter(
    (s) => s.section_type !== "navbar" && s.section_type !== "footer" && s.section_type !== "full-page-clone"
  );
  const middleIds = middleSections.map((s) => s.id);
  const sortableEnabled = !isMobileBreakpoint && middleIds.length > 1;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = middleIds.indexOf(Number(active.id));
    const newIdx = middleIds.indexOf(Number(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = [...middleIds];
    reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, Number(active.id));
    const navbarIds = renderOrder.filter((s) => s.section_type === "navbar").map((s) => s.id);
    const footerIds = renderOrder.filter((s) => s.section_type === "footer").map((s) => s.id);
    void state.reorderSections([...navbarIds, ...reordered, ...footerIds]);
  }

  function renderOne(section: Section) {
    if (section.section_type === "full-page-clone") {
      return (
        <SectionFrame key={section.id} section={section} state={state}>
          <ClonedStudioFrame
            tenantSlug={state.tenant.slug}
            width={width}
            scrollTo={studio.cloneScrollTarget}
          />
        </SectionFrame>
      );
    }
    const baseContent = (section.settings?.content ?? {}) as Record<string, unknown>;
    let overridden = applyOverrides(baseContent, state.overrides, section.id);

    // Apply heroBg studio settings as content overrides so HeroSection can read them.
    // heroOverride (live drag state) takes precedence over saved settings.heroBg.
    if (section.section_type === "hero") {
      const liveBg = studio.heroOverride?.sectionId === section.id
        ? studio.heroOverride.bg
        : section.settings?.heroBg as Record<string, unknown> | undefined;
      if (liveBg?.tab === "color") {
        overridden = { ...overridden, __heroBgTab: "color", __heroBgColor: liveBg.color ?? "#1a1a1a" };
      } else if (liveBg?.tab === "image") {
        // Always inject image tab overrides — imageUrl may be empty if template default is used
        const imgOverride: Record<string, unknown> = { __heroBgTab: "image" };
        if (liveBg.imageUrl) imgOverride.backgroundImage = liveBg.imageUrl as string;
        // In mobile preview, show mobile focus; otherwise show desktop focus
        const focusToShow = (studio.breakpoint === "mobile" && liveBg.imageFocusMobile)
          ? liveBg.imageFocusMobile
          : liveBg.imageFocus;
        if (focusToShow) {
          imgOverride.__heroBgFocus = focusToShow;
          imgOverride.backgroundImageFocus = focusToShow;
        }
        overridden = { ...overridden, ...imgOverride };
      } else if (liveBg?.tab === "video") {
        overridden = { ...overridden, __heroBgTab: "video", __heroBgVideoUrl: liveBg.videoUrl ?? "" };
      }
    }

    // Merge live transient padding (during section-resize drag) into layout
    // so SectionRenderer wrapper renders the in-progress value. Cleared on
    // pointerup by SectionResizeHandle which commits the final value.
    let layoutPatched = section.settings?.layout;
    if (studio.transientPadding?.sectionId === section.id) {
      const { sectionId: _sid, ...padOverride } = studio.transientPadding;
      void _sid;
      layoutPatched = { ...(layoutPatched ?? {}), ...padOverride };
    }

    const needsContentPatch = overridden !== baseContent;
    const needsLayoutPatch = layoutPatched !== section.settings?.layout;
    const patched = (needsContentPatch || needsLayoutPatch)
      ? { ...section, settings: { ...section.settings, content: overridden, ...(needsLayoutPatch ? { layout: layoutPatched } : {}) } }
      : section;

    const hiddenOn = ((section.settings?.hiddenOn as string[] | undefined) ?? []);
    const isHiddenOnBreakpoint =
      (studio.breakpoint === "mobile" && hiddenOn.includes("mobile")) ||
      (studio.breakpoint === "tablet" && hiddenOn.includes("tablet"));

    const inner = (
      <div className={isHiddenOnBreakpoint ? "relative" : undefined}>
        <SectionRenderer section={patched} tenantId={state.tenant.id} tenantSlug={state.tenant.slug} isAdmin={false} onSaveAsteraContent={state.saveAsteraContent} />
        {isHiddenOnBreakpoint && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.55)] pointer-events-none z-10">
            <span className="rounded-full bg-[var(--vs-surface)] border border-[var(--vs-border-strong)] px-3 py-1 text-[11px] font-medium text-[var(--vs-text-muted)]">
              Skryto na {studio.breakpoint === "mobile" ? "mobilu" : "tabletu"}
            </span>
          </div>
        )}
      </div>
    );

    const isSortable = sortableEnabled && middleIds.includes(section.id);
    if (isSortable) {
      return (
        <SortableSectionFrame key={section.id} section={section} state={state}>
          {inner}
        </SortableSectionFrame>
      );
    }
    return (
      <SectionFrame key={section.id} section={section} state={state}>
        {inner}
      </SectionFrame>
    );
  }

  /** Renders the full section list (navbar + middle + footer) shared between
   *  desktop and tablet/mobile frames. Middle sections are wrapped in
   *  DndContext + SortableContext when sortable is enabled (desktop/tablet).
   *  On mobile breakpoint the arrows in SectionFrame toolbar are the only
   *  reorder affordance — drag handle is hidden because no sortable wrapper.
   */
  function renderSectionList() {
    const items = renderOrder.map((section, i) => {
      const scope =
        section.section_type === "navbar" ? "header" :
        section.section_type === "footer" ? "footer" :
        "section";
      const isFooter = section.section_type === "footer";
      const isLast = i === renderOrder.length - 1;
      return (
        <div key={section.id} data-design-scope={scope}>
          {renderOne(section)}
          {!isLast && !isFooter && (
            <InsertionGap insertAtIndex={i + 1} state={state} />
          )}
        </div>
      );
    });
    if (!sortableEnabled) return <>{items}</>;
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={middleIds} strategy={verticalListSortingStrategy}>
          {items}
        </SortableContext>
      </DndContext>
    );
  }

  // Mirror only the *dotted* extended design tokens (header.bg.desktop,
  // h1.size.desktop, …) as CSS variables on the canvas wrapper. Flat keys
  // like `spacing` / `colorPrimary` / `fontBody` are explicitly handled below.
  // Critically, `--spacing` is reserved by Tailwind v4 as the base unit for
  // gap/padding/margin utilities — overwriting it with a non-length value
  // (e.g. "relaxed") breaks every spacing utility on the canvas.
  const extendedTokenVars: Record<string, string> = {};
  if (designTokens) {
    for (const [k, v] of Object.entries(designTokens)) {
      if (!k.includes(".")) continue;
      if (v === null || v === undefined || v === "") continue;
      const cssKey = "--" + k.replace(/\./g, "-");
      extendedTokenVars[cssKey] = typeof v === "number" ? `${v}px` : String(v);
    }
  }

  const templateStyle = {
    ...extendedTokenVars,
    "--color-primary": designTokens?.colorPrimary ?? "#6366f1",
    "--color-secondary": designTokens?.colorSecondary ?? "#4f46e5",
    "--color-bg": designTokens?.colorBackground ?? "#ffffff",
    "--color-surface": designTokens?.colorSurface ?? "#f9fafb",
    "--color-text": designTokens?.colorText ?? "#111827",
    "--color-text-muted": designTokens?.colorTextMuted ?? "#6b7280",
    "--color-accent": designTokens?.colorAccent ?? "#6366f1",
    "--color-border": designTokens?.colorBorder ?? "#e5e7eb",
    "--font-heading": designTokens?.fontHeading ?? "Inter, sans-serif",
    "--font-body": designTokens?.fontBody ?? "Inter, sans-serif",
    "--radius": designTokens?.borderRadius ?? "8px",
    backgroundColor: designTokens?.colorBackground ?? "#ffffff",
    color: designTokens?.colorText ?? "#111827",
    fontFamily: designTokens?.fontBody ?? "Inter, sans-serif",
    overflow: "hidden",
    transform: "translate3d(0,0,0)",
    position: "relative",
  } as React.CSSProperties;

  return (
    <div
      ref={outerRef}
      className={`vs-canvas-bg h-full overflow-y-auto ${effectiveZoom > 1 ? "overflow-x-auto" : "overflow-x-hidden"}`}
    >
      {isDesktop ? (
        /* Desktop — flush to right edge, scales to fill canvas width */
        <div
          data-breakpoint="desktop"
          data-studio-canvas-preview
          data-design-host
          className="mx-auto"
          style={{ width, zoom: effectiveZoom, ...templateStyle, backgroundColor: "transparent", boxShadow: "0 0 0 1px rgba(148,156,255,0.10), 0 24px 64px rgba(0,0,0,0.55)" }}
        >
          <DesignOverrides tokens={designTokens} hostSelector="[data-design-host]" />
          {/*
            sr-only h1 fallback — see TenantPublicView for rationale. Ensures
            Studio "Typografie → Nadpis 1" panel can target every template
            even when the template's hero is purely visual.
          */}
          <h1
            data-design-h1-fallback
            style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}
          >
            {state.page?.title ?? state.tenant?.slug ?? "Úvod"}
          </h1>
          {renderSectionList()}
          {/* Drop zone at bottom — append after all content sections (before footer) */}
          <CanvasDropZone
            insertAtIndex={Math.max(0, renderOrder.filter(s => s.section_type !== "footer").length)}
            state={state}
          />
        </div>
      ) : (
        /* Tablet / Mobile — iframe with real viewport so CSS media queries fire correctly */
        (() => {
          const isMobile = studio.breakpoint === "mobile";
          // Status bar: shown only on mobile (like iPhone). Sits between bezel and iframe.
          const statusBarH = isMobile ? 44 : 0;
          const iframeH = (isMobile ? 844 : 1366) - statusBarH;
          const deviceH = iframeH + statusBarH; // = 844 or 1024
          const borderPx = 8;
          const framedW = width + borderPx * 2;
          const framedH = deviceH + borderPx * 2;
          const scaledH = framedH * effectiveZoom;
          const marginH = -(framedH - scaledH);
          const iframeSrc = `${pageUrl}?_preview=${iframeRefreshKey}`;

          return (
            <div className="flex flex-col items-center py-8 px-4 min-h-full gap-3">
              {/* Refresh button */}
              <button
                type="button"
                onClick={refreshIframe}
                title="Načíst aktuální verzi stránky"
                className="flex items-center gap-1.5 rounded-full border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-3 py-1.5 text-[11px] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)] hover:border-[var(--vs-accent-ring)] transition-colors shrink-0 shadow-[var(--vs-shadow-sm)]"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-3.5 w-3.5">
                  <path d="M14 8A6 6 0 1 1 8 2a6 6 0 0 1 4.24 1.76L14 2v4h-4l1.42-1.42A4 4 0 1 0 12 8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Aktualizovat náhled
              </button>

              {/* Device frame */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    transform: `scale(${effectiveZoom})`,
                    transformOrigin: "top center",
                    marginBottom: marginH,
                    width: framedW,
                    height: framedH,
                    borderRadius: isMobile ? "52px" : "28px",
                    border: `${borderPx}px solid #1c1c1e`,
                    boxShadow: "0 0 0 1px #3a3a3c, inset 0 0 0 1px #3a3a3c, 0 40px 100px -16px rgba(0,0,0,0.9)",
                    overflow: "hidden",
                    position: "relative",
                    background: "#000",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Status bar — part of the device chrome, ABOVE the iframe */}
                  {isMobile && (
                    <div style={{
                      height: statusBarH,
                      background: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 28px",
                      flexShrink: 0,
                    }}>
                      {/* Time */}
                      <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "-apple-system, sans-serif", letterSpacing: "-0.3px" }}>9:41</span>
                      {/* Dynamic Island pill */}
                      <div style={{
                        position: "absolute",
                        top: 10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 116,
                        height: 34,
                        background: "#000",
                        borderRadius: 20,
                        border: "1px solid #2a2a2a",
                      }} />
                      {/* Status icons */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {/* Signal */}
                        <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
                          <rect x="0" y="4" width="3" height="8" rx="1" />
                          <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" />
                          <rect x="9" y="1" width="3" height="11" rx="1" />
                          <rect x="13.5" y="0" width="3" height="12" rx="1" />
                        </svg>
                        {/* WiFi */}
                        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M1 4.5C3.8 1.8 12.2 1.8 15 4.5" />
                          <path d="M3.2 6.8C5.1 4.9 10.9 4.9 12.8 6.8" />
                          <path d="M5.5 9.1C6.6 8 9.4 8 10.5 9.1" />
                          <circle cx="8" cy="11.5" r="1" fill="white" stroke="none" />
                        </svg>
                        {/* Battery */}
                        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity="0.35" />
                          <rect x="2" y="2" width="17" height="8" rx="2" fill="white" />
                          <path d="M23 4v4a2 2 0 0 0 0-4z" fill="white" fillOpacity="0.4" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Loading overlay */}
                  {iframeLoading && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      top: statusBarH,
                      background: "rgba(0,0,0,0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 50,
                    }}>
                      <svg className="animate-spin" style={{ width: 28, height: 28, color: "#a1a1aa" }} fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}

                  <iframe
                    key={iframeRefreshKey}
                    ref={iframeRef}
                    src={iframeSrc}
                    title={`${isMobile ? "Mobilní" : "Tabletový"} náhled`}
                    onLoad={() => setIframeLoading(false)}
                    style={{
                      width,
                      height: iframeH,
                      border: "none",
                      display: "block",
                      background: "#fff",
                      flex: "1 0 auto",
                    }}
                  />
                </div>
              </div>

              {/* Dimensions badge */}
              <p className="text-[10px] text-[var(--vs-text-dim)] shrink-0" style={{ marginTop: marginH < 0 ? marginH + 8 : 8 }}>
                {width} × {iframeH} px
              </p>
            </div>
          );
        })()
      )}
    </div>
  );
}

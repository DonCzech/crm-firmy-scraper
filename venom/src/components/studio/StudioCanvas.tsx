"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import clsx from "clsx";
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
        dragOver ? "bg-blue-500/10" : "hover:bg-[rgba(59,130,246,0.04)]"
      )}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setDragOver(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false); }}
      onDrop={dropSection}
      onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
    >
      <div className={clsx(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-medium transition-all duration-150 select-none",
        dragOver
          ? "border-blue-500 bg-blue-600 text-white shadow-lg"
          : "border-dashed border-[rgba(59,130,246,0.3)] text-[#4b5563] hover:border-[#3b82f6] hover:text-[#60a5fa]"
      )}>
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        {dragOver ? "Pustit sem — přidat sekci" : "Přidat sekci"}
      </div>

      {open && (
        <div
          ref={ref}
          className="absolute bottom-full left-1/2 z-30 mb-2 w-[440px] max-w-[90vw] -translate-x-1/2 rounded-lg border border-[#27272a] bg-[#141416] p-3 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#a1a1aa]">
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
                  className="group/btn flex flex-col items-start gap-1.5 rounded-md border border-[#27272a] bg-[#1a1a1c] p-2.5 text-left text-xs transition-colors duration-150 hover:border-blue-500/50 hover:bg-[#1f1f22]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-[#27272a] text-[#a1a1aa] group-hover/btn:bg-blue-500/10 group-hover/btn:text-blue-400">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="text-[12px] font-medium text-white">{item.label}</div>
                  <div className="text-[10.5px] leading-snug text-[#71717a]">{item.description}</div>
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
  tablet: 768,
  mobile: 390,
};

const PAD_TOP = 0; // template starts flush at top

export function StudioCanvas({ state }: { state: StudioState }) {
  const studio = useStudio();
  const outerRef = useRef<HTMLDivElement>(null);
  const [canvasW, setCanvasW] = useState(0);

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
    el.style.outline = "3px solid #6366f1";
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

  // Page URL for iframe preview
  const pageUrl = state.page && !state.page.is_homepage
    ? `/demo/${state.tenant.slug}/${state.page.slug}`
    : `/demo/${state.tenant.slug}`;

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
        if (liveBg.imageFocus) {
          imgOverride.__heroBgFocus = liveBg.imageFocus;
          // Also inject as standard backgroundImageFocus so GenericEditableImage + readFocus works
          imgOverride.backgroundImageFocus = liveBg.imageFocus;
        }
        overridden = { ...overridden, ...imgOverride };
      } else if (liveBg?.tab === "video") {
        overridden = { ...overridden, __heroBgTab: "video", __heroBgVideoUrl: liveBg.videoUrl ?? "" };
      }
    }

    const patched = overridden !== baseContent
      ? { ...section, settings: { ...section.settings, content: overridden } }
      : section;
    return (
      <SectionFrame key={section.id} section={section} state={state}>
        <SectionRenderer section={patched} tenantId={state.tenant.id} tenantSlug={state.tenant.slug} isAdmin={false} onSaveAsteraContent={state.saveAsteraContent} />
      </SectionFrame>
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
      className="h-full overflow-y-auto overflow-x-hidden bg-[var(--vs-bg-soft)]"
    >
      {isDesktop ? (
        /* Desktop — flush to right edge, scales to fill canvas width */
        <div
          data-breakpoint="desktop"
          data-studio-canvas-preview
          data-design-host
          className="ml-auto"
          style={{ width, zoom: scale, ...templateStyle, backgroundColor: "transparent" }}
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
          {renderOrder.map((section, i) => {
            const scope =
              section.section_type === "navbar" ? "header" :
              section.section_type === "footer" ? "footer" :
              "section";
            // Don't put an InsertionGap after footer (last section)
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
          })}
          {/* Drop zone at bottom — append after all content sections (before footer) */}
          <CanvasDropZone
            insertAtIndex={Math.max(0, renderOrder.filter(s => s.section_type !== "footer").length)}
            state={state}
          />
        </div>
      ) : (
        /* Tablet / Mobile — iframe so vw units use correct viewport */
        <div className="flex justify-center items-start py-8 px-4 min-h-full">
          <div
            style={{
              borderRadius: studio.breakpoint === "mobile" ? "44px" : "22px",
              border: "8px solid #1c1c1e",
              boxShadow: "0 0 0 1px #3a3a3c, 0 40px 80px -16px rgba(0,0,0,0.8)",
              overflow: "hidden",
              zoom: scale,
              width,
            }}
          >
            <iframe
              title={`${studio.breakpoint} preview`}
              src={pageUrl}
              style={{
                width: "100%",
                height: studio.breakpoint === "mobile" ? 844 : 1024,
                border: "none",
                display: "block",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

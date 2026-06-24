"use client";

import { useEffect, useRef, useState } from "react";
import { SectionRenderer } from "@/components/tenant/SectionRenderer";
import { applyOverrides } from "@/lib/overrides";
import { useStudio } from "./StudioContext";
import { SectionFrame } from "./SectionFrame";
import { ClonedStudioFrame } from "./ClonedStudioFrame";
import { InsertionGap } from "./InsertionGap";
import type { Section } from "@/lib/db";
import type { StudioState } from "./TenantStudioView";

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
    const overridden = applyOverrides(baseContent, state.overrides, section.id);
    const patched = overridden !== baseContent
      ? { ...section, settings: { ...section.settings, content: overridden } }
      : section;
    return (
      <SectionFrame key={section.id} section={section} state={state}>
        <SectionRenderer section={patched} tenantId={state.tenant.id} tenantSlug={state.tenant.slug} isAdmin={true} onSaveAsteraContent={state.saveAsteraContent} />
      </SectionFrame>
    );
  }

  const templateStyle = {
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
          className="ml-auto"
          style={{ width, zoom: scale, ...templateStyle, backgroundColor: "transparent" }}
        >
          {renderOrder.map((section, i) => (
            <div key={section.id}>
              {renderOne(section)}
              {i < renderOrder.length - 1 && (
                <InsertionGap insertAtIndex={i + 1} state={state} />
              )}
            </div>
          ))}
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

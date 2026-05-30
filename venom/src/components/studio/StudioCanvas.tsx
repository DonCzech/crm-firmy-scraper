"use client";

import { useEffect, useRef } from "react";
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

export function StudioCanvas({ state }: { state: StudioState }) {
  const studio = useStudio();
  const ref = useRef<HTMLDivElement>(null);

  // Click outside any frame deselects
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("[data-section-frame]")) return;
      studio.setSelection(null);
    }
    const el = ref.current;
    el?.addEventListener("click", onClick);
    return () => el?.removeEventListener("click", onClick);
  }, [studio]);

  // Scroll to sub-layer target (full-page-clone only)
  useEffect(() => {
    const sel = studio.cloneScrollTarget;
    if (!sel || !ref.current) return;
    const el = ref.current.querySelector(sel) as HTMLElement | null;
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
  const visible = [...state.sections].filter(s => s.is_visible).sort((a, b) => a.order_index - b.order_index);
  // Resolve full insertion order based on order_index — single source of truth
  // for both render and inline-insertion gap indices.
  const renderOrder: Section[] = visible;
  const width = WIDTHS[studio.breakpoint];

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

  // Unified canvas: render navbar (if any), then main sections in order, then footer.
  // full-page-clone is rendered via iframe in place — width same as device preset.
  // JSON sections rendered via SectionRenderer with Tailwind responsive classes.
  return (
    <div ref={ref} className="h-full overflow-auto p-6 bg-[#0a0a0b]">
      <div className="mx-auto" style={{ width }}>
        <div
          data-breakpoint={studio.breakpoint}
          data-studio-canvas-preview
          className="rounded-md bg-white text-black shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-black/10"
          style={{
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
            // Containing block for `position:fixed` descendants — per CSS spec, any
            // element with `transform` becomes the containing block for fixed children.
            // This prevents template navbars / sticky CTAs from escaping the preview
            // and overlapping the studio left/right panels.
            transform: "translate3d(0,0,0)",
            position: "relative",
          } as React.CSSProperties}
        >
          {/* Gap above the first section */}
          <InsertionGap insertAtIndex={0} state={state} />
          {renderOrder.map((section, i) => (
            <div key={section.id}>
              {renderOne(section)}
              {/* Gap below this section / above the next */}
              <InsertionGap insertAtIndex={i + 1} state={state} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

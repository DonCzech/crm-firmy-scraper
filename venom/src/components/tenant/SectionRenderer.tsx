import type { CSSProperties } from "react";
import type { Section } from "@/lib/db";
import { ClonedSiteRenderer } from "./ClonedSiteRenderer";
import { AsteraHomeTemplate } from "../templates/AsteraHomeTemplate";
import { SECTION_RENDERERS } from "@/sections/registry";
import { SectionContentProvider } from "./SectionContentContext";
import type { SiteContent } from "@/lib/content-types";

interface Props {
  section: Section;
  tenantId: number;
  tenantSlug?: string;
  isAdmin: boolean;
  onSaveAsteraContent?: (section: Section, content: SiteContent) => Promise<void>;
}

export function SectionRenderer({ section, tenantSlug, isAdmin, onSaveAsteraContent }: Props) {
  const content = (section.settings?.content ?? {}) as Record<string, unknown>;
  const variant = section.section_variant;
  const anchorId = (section.settings as { anchorId?: string } | undefined)?.anchorId;

  // ── Special sections with non-standard prop shapes ────────────────────────
  if (section.section_type === "full-page-clone") {
    const { html, cssUrls, jsUrls } = (section.settings ?? {}) as {
      html: string; cssUrls?: string[]; jsUrls?: string[];
    };
    return (
      <ClonedSiteRenderer
        html={html ?? ""}
        cssUrls={cssUrls}
        jsUrls={jsUrls}
        isAdmin={isAdmin}
        sectionId={section.id}
        tenantSlug={tenantSlug}
      />
    );
  }
  if (section.section_type === "astera-home") {
    return (
      <AsteraHomeTemplate
        content={content as unknown as SiteContent}
        tenantSlug={tenantSlug}
        isAdmin={isAdmin}
        adminEmail={isAdmin ? `${tenantSlug}@demo.local` : undefined}
        onSaveContent={
          isAdmin && onSaveAsteraContent
            ? (nextContent) => onSaveAsteraContent(section, nextContent)
            : undefined
        }
      />
    );
  }

  // ── Registry-driven dispatch ──────────────────────────────────────────────
  const Renderer = SECTION_RENDERERS[section.section_type];
  if (!Renderer) {
    if (isAdmin) {
      return (
        <div className="py-8 px-6 bg-gray-50 border border-dashed border-gray-300 text-center text-sm text-gray-500">
          Sekce: <code>{section.section_type}</code> / varianta: <code>{variant}</code>
        </div>
      );
    }
    return null;
  }

  // ── For hero sections, merge saved heroBg settings into content ───────────
  // Allows HeroInspectorPanel changes to appear on the public site too.
  // Skip when StudioCanvas already injected live overrides (__heroBgTab = studio mode).
  let effectiveContent = content;
  if (section.section_type === "hero" && !content.__heroBgTab) {
    const heroBg = (section.settings as Record<string, unknown> | undefined)?.heroBg as Record<string, unknown> | undefined;
    if (heroBg?.tab === "image") {
      const overrides: Record<string, unknown> = {};
      if (heroBg.imageUrl) overrides.backgroundImage = heroBg.imageUrl;
      if (heroBg.imageFocus) {
        overrides.__heroBgFocus = heroBg.imageFocus;
        overrides.backgroundImageFocus = heroBg.imageFocus;
      }
      effectiveContent = { ...content, ...overrides };
    } else if (heroBg?.tab === "color") {
      effectiveContent = { ...content, __heroBgTab: "color", __heroBgColor: heroBg.color ?? "#1a1a1a" };
    } else if (heroBg?.tab === "video") {
      effectiveContent = { ...content, __heroBgTab: "video", __heroBgVideoUrl: heroBg.videoUrl ?? "" };
    }
  }

  const rendered = (
    <SectionContentProvider content={effectiveContent}>
      <Renderer
        content={effectiveContent}
        variant={variant}
        isAdmin={isAdmin}
        tenantSlug={tenantSlug}
        sectionId={section.id}
      />
    </SectionContentProvider>
  );

  // T1.2 — section layout settings (extra outer padding + background color).
  // Applied here as the single source of truth so both Studio canvas and
  // public render react identically. CSS vars also published for templates
  // that will be migrated by T1.4 codemod to read them natively.
  const layout = (section.settings?.layout ?? {}) as {
    paddingTop?: number; paddingBottom?: number; paddingX?: number;
    backgroundColor?: string;
  };
  const wrapStyle: CSSProperties = {};
  const vars: Record<string, string> = {};
  if (typeof layout.paddingTop === "number" && layout.paddingTop > 0) {
    wrapStyle.paddingTop = layout.paddingTop;
    vars["--section-pt"] = `${layout.paddingTop}px`;
  }
  if (typeof layout.paddingBottom === "number" && layout.paddingBottom > 0) {
    wrapStyle.paddingBottom = layout.paddingBottom;
    vars["--section-pb"] = `${layout.paddingBottom}px`;
  }
  if (typeof layout.paddingX === "number" && layout.paddingX > 0) {
    wrapStyle.paddingLeft = layout.paddingX;
    wrapStyle.paddingRight = layout.paddingX;
    vars["--section-px"] = `${layout.paddingX}px`;
  }
  if (layout.backgroundColor) {
    wrapStyle.backgroundColor = layout.backgroundColor;
  }
  const hasLayout = Object.keys(wrapStyle).length > 0;
  const finalStyle: CSSProperties = hasLayout || anchorId
    ? { ...wrapStyle, ...(vars as CSSProperties), ...(anchorId ? { scrollMarginTop: 90 } : {}) }
    : {};

  if (anchorId || hasLayout) {
    return (
      <div id={anchorId} style={finalStyle}>
        {rendered}
      </div>
    );
  }
  return rendered;
}

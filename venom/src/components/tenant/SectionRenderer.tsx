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
      if (heroBg.imageFocusMobile) {
        overrides.__heroBgFocusMobile = heroBg.imageFocusMobile;
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

  // T1.2 + T1.4 — section layout settings (padding + background color).
  // Applied here as the single source of truth so both Studio canvas and
  // public render react identically.
  //
  // T1.4 behaviour: when a slider value is explicitly set (even 0), the wrapper
  // takes over ALL padding responsibility for that axis. A scoped <style> block
  // zeroes out the template's own section padding so slider = absolute value,
  // not additive. When the slider hasn't been touched (value is undefined),
  // the template keeps its own built-in padding unchanged.
  const layout = (section.settings?.layout ?? {}) as {
    paddingTop?: number; paddingBottom?: number; paddingX?: number;
    backgroundColor?: string;
    responsive?: {
      tablet?: { paddingTop?: number; paddingBottom?: number; paddingX?: number };
      mobile?: { paddingTop?: number; paddingBottom?: number; paddingX?: number };
    };
  };

  const hasPt = typeof layout.paddingTop === "number";
  const hasPb = typeof layout.paddingBottom === "number";
  const hasPx = typeof layout.paddingX === "number";

  const wrapStyle: CSSProperties = {};
  if (hasPt) wrapStyle.paddingTop    = layout.paddingTop;
  if (hasPb) wrapStyle.paddingBottom = layout.paddingBottom;
  if (hasPx) { wrapStyle.paddingLeft = layout.paddingX; wrapStyle.paddingRight = layout.paddingX; }
  if (layout.backgroundColor) wrapStyle.backgroundColor = layout.backgroundColor;

  const hasLayout = Object.keys(wrapStyle).length > 0;
  const hasAnchor = !!anchorId;

  // 3b — per-breakpoint padding overrides (inspektor při aktivním tablet/mobile
  // breakpointu). Undefined osa = dědí desktop/base hodnotu. Media blok musí
  // přebít inline style wrapperu i padding šablony ⇒ !important.
  const bpPadCss = (
    query: string,
    pad: { paddingTop?: number; paddingBottom?: number; paddingX?: number } | undefined
  ): string | null => {
    if (!pad) return null;
    const pt = typeof pad.paddingTop === "number";
    const pb = typeof pad.paddingBottom === "number";
    const px = typeof pad.paddingX === "number";
    if (!pt && !pb && !px) return null;
    return [
      `@media ${query} {`,
      `  [data-sr-id="${section.id}"] {`,
      pt ? `    padding-top: ${pad.paddingTop}px !important;` : "",
      pb ? `    padding-bottom: ${pad.paddingBottom}px !important;` : "",
      px ? `    padding-left: ${pad.paddingX}px !important; padding-right: ${pad.paddingX}px !important;` : "",
      "  }",
      `  [data-sr-id="${section.id}"] section {`,
      pt ? "    padding-top: 0 !important;" : "",
      pb ? "    padding-bottom: 0 !important;" : "",
      px ? "    padding-left: 0 !important; padding-right: 0 !important;" : "",
      "  }",
      "}",
    ].filter(Boolean).join("\n");
  };
  const tabletCss = bpPadCss("(min-width: 768px) and (max-width: 1023px)", layout.responsive?.tablet);
  const mobileCss = bpPadCss("(max-width: 767px)", layout.responsive?.mobile);
  const hasResponsive = !!(tabletCss || mobileCss);

  // Scoped CSS that zeroes the template section's own padding on overridden axes.
  // Uses `!important` to beat both Tailwind classes and inline styles.
  // Targets `[data-sr-id] section` — safe because section components don't nest
  // multiple sibling <section> elements.
  const overrideCss = (hasPt || hasPb || hasPx || hasResponsive) ? [
    (hasPt || hasPb || hasPx) ? [
      `[data-sr-id="${section.id}"] section {`,
      hasPt ? "  padding-top: 0 !important;" : "",
      hasPb ? "  padding-bottom: 0 !important;" : "",
      hasPx ? "  padding-left: 0 !important; padding-right: 0 !important;" : "",
      "}",
    ].filter(Boolean).join("\n") : "",
    tabletCss ?? "",
    mobileCss ?? "",
  ].filter(Boolean).join("\n") : null;

  const finalStyle: CSSProperties = (hasLayout || hasAnchor)
    ? { ...wrapStyle, ...(hasAnchor ? { scrollMarginTop: 90 } : {}) }
    : {};

  if (hasLayout || hasAnchor || hasResponsive) {
    return (
      <div id={anchorId} data-sr-id={section.id} style={finalStyle}>
        {overrideCss && <style dangerouslySetInnerHTML={{ __html: overrideCss }} />}
        {rendered}
      </div>
    );
  }
  return rendered;
}

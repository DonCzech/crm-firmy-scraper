import type { Section } from "@/lib/db";
import { ClonedSiteRenderer } from "./ClonedSiteRenderer";
import { AsteraHomeTemplate } from "../templates/AsteraHomeTemplate";
import { SECTION_RENDERERS } from "@/sections/registry";
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

  const rendered = (
    <Renderer
      content={content}
      variant={variant}
      isAdmin={isAdmin}
      tenantSlug={tenantSlug}
      sectionId={section.id}
    />
  );
  if (anchorId) {
    return (
      <div id={anchorId} style={{ scrollMarginTop: 90 }}>
        {rendered}
      </div>
    );
  }
  return rendered;
}

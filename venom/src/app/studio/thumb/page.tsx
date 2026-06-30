import { queryOne } from "@/lib/db";
import type { Section } from "@/lib/db";
import { SectionRenderer } from "@/components/tenant/SectionRenderer";
import { DesignOverrides } from "@/components/studio/design/DesignOverrides";

export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ type?: string; variant?: string }>;
}

export default async function ThumbPage({ searchParams }: Props) {
  const { type, variant } = await searchParams;
  if (!type) {
    return <p style={{ padding: 20, color: "#999" }}>?type= required</p>;
  }

  // Find a real section from any non-suspended demo tenant
  const section = await queryOne<Section>(
    `SELECT s.* FROM sections s
     JOIN tenants t ON s.tenant_id = t.id
     WHERE s.section_type = $1
       AND s.section_variant = $2
       AND t.status != 'suspended'
     ORDER BY s.id
     LIMIT 1`,
    [type, variant ?? "default"],
  ).catch(() => null);

  const effectiveSection: Section = section ?? {
    id: 0,
    tenant_id: 0,
    page_id: 0,
    section_type: type,
    section_variant: variant ?? "default",
    order_index: 0,
    is_visible: true,
    settings: { content: {} },
  };

  const designTokens = effectiveSection.settings?.designTokens as Record<string, string> | undefined;

  return (
    <div
      data-design-host
      style={{
        width: 800,
        overflow: "hidden",
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
      } as React.CSSProperties}
    >
      <DesignOverrides tokens={designTokens} hostSelector="[data-design-host]" />
      <SectionRenderer
        section={effectiveSection}
        isAdmin={false}
        tenantId={effectiveSection.tenant_id}
      />
    </div>
  );
}

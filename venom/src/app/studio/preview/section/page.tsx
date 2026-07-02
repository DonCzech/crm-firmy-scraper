/**
 * Isolated section preview route — `/studio/preview/section?type=&variant=&tenant=`.
 *
 * Used by `scripts/generate-section-thumbnails.mjs` (Playwright) to capture
 * one section's screenshot in isolation. Server component does the DB
 * lookup; rendering is delegated to a client wrapper because
 * `src/sections/registry.ts` ships `ssr: false` for the freeform section,
 * which Next 16 forbids inside Server Components.
 */

import { query, getTenantById } from "@/lib/db";
import type { Section } from "@/lib/db";
import { SectionPreviewClient } from "./SectionPreviewClient";

export const dynamic = "force-dynamic";

interface SearchParams {
  type?: string;
  variant?: string;
  tenant?: string;
}

async function findSectionForVariant(
  type: string, variant: string, tenantSlug?: string,
): Promise<{ section: Section; tenantId: number } | null> {
  const filterTenant = tenantSlug ? `AND t.slug = $3` : "";
  const params: unknown[] = [type, variant];
  if (tenantSlug) params.push(tenantSlug);

  const rows = await query<Section & { tenant_id: number }>(
    `SELECT s.* FROM sections s
     JOIN tenants t ON t.id = s.tenant_id
     WHERE s.section_type = $1 AND s.section_variant = $2 ${filterTenant}
     ORDER BY s.updated_at DESC NULLS LAST, s.id DESC
     LIMIT 1`,
    params,
  );
  if (rows.length === 0) return null;
  return { section: rows[0], tenantId: rows[0].tenant_id };
}

export default async function SectionPreviewPage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const { type, variant, tenant: tenantSlug } = await searchParams;
  if (!type || !variant) {
    return <div style={{ padding: 24, fontFamily: "system-ui" }}>Chybí <code>?type=&variant=</code></div>;
  }

  const match = await findSectionForVariant(type, variant, tenantSlug);
  const section: Section = match?.section ?? {
    id: -1, tenant_id: 0, page_id: 0,
    section_type: type, section_variant: variant,
    order_index: 0, is_visible: true,
    settings: { content: {} },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as unknown as Section;

  const tenant = match ? await getTenantById(match.tenantId) : null;

  return (
    <div data-section-preview style={{ background: "white" }}>
      <style>{`
        html, body { margin: 0; padding: 0; background: white; }
        body > div, #__next { background: white; }
        nav[data-embedded-navbar], header[data-embedded-navbar] { display: none !important; }
      `}</style>
      <SectionPreviewClient
        section={section}
        tenantId={tenant?.id ?? 0}
        tenantSlug={tenant?.slug ?? "preview"}
      />
    </div>
  );
}

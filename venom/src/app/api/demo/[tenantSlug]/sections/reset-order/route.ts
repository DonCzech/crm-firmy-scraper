import { NextRequest } from "next/server";
import { query, queryOne, withTransaction, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { invalidateTemplateCache } from "@/lib/section-resolver";

/**
 * POST /api/demo/:tenantSlug/sections/reset-order
 *
 * Non-destructive section order reset. Pulls the tenant's current
 * template_versions.default_sections, then for each section currently on
 * the tenant's homepage we look up the matching default by
 * (section_type, section_variant) and reassign order_index from the
 * template. Sections that don't have a matching default (custom adds)
 * are kept and pushed to the end in their existing relative order.
 *
 * Returns:
 *   { ok: true, reordered: N, customKept: M }
 *
 * Auth: tenant access cookie required.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

interface DefaultSectionEntry {
  type: string;
  variant?: string;
  order: number;
}

interface SectionRow {
  id: number;
  section_type: string;
  section_variant: string;
  order_index: number;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) {
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Find the homepage
  const homepage = await queryOne<{ id: number }>(
    "SELECT id FROM pages WHERE tenant_id = $1 AND is_homepage = true LIMIT 1",
    [tenant.id]
  );
  if (!homepage) return Response.json({ error: "No homepage found" }, { status: 404 });

  // Load template defaults
  const tplVersion = await queryOne<{ default_sections: DefaultSectionEntry[] }>(
    `SELECT tv.default_sections
       FROM template_versions tv
      WHERE tv.template_id = $1 AND tv.version = $2`,
    [tenant.template_id, tenant.template_version]
  );
  if (!tplVersion) {
    return Response.json({ error: "Template version not seeded" }, { status: 500 });
  }
  const defaults = Array.isArray(tplVersion.default_sections)
    ? tplVersion.default_sections
    : [];

  // Load current page sections
  const sections = await query<SectionRow>(
    "SELECT id, section_type, section_variant, order_index FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index",
    [tenant.id, homepage.id]
  );

  // Build a lookup of section types/variants → desired order_index from template.
  // Prefer (type+variant) match, fall back to (type-only). Track which defaults
  // have already been consumed so two current sections of the same type pick
  // distinct slots when the template lists them more than once.
  const consumed = new Set<number>();
  function findSlot(s: SectionRow): number | null {
    // Exact variant match first
    for (let i = 0; i < defaults.length; i++) {
      const d = defaults[i];
      if (consumed.has(i)) continue;
      if (d.type === s.section_type && (d.variant ?? "default") === s.section_variant) {
        consumed.add(i);
        return d.order;
      }
    }
    // Fall back to type-only
    for (let i = 0; i < defaults.length; i++) {
      const d = defaults[i];
      if (consumed.has(i)) continue;
      if (d.type === s.section_type) {
        consumed.add(i);
        return d.order;
      }
    }
    return null;
  }

  const matched: Array<{ id: number; order: number }> = [];
  const custom: Array<{ id: number; originalOrder: number }> = [];
  for (const s of sections) {
    const slot = findSlot(s);
    if (slot === null) custom.push({ id: s.id, originalOrder: s.order_index });
    else matched.push({ id: s.id, order: slot });
  }

  // Custom sections keep their relative order but are placed AFTER everything
  // in the template. Use a base higher than max template order.
  const maxTemplateOrder = defaults.reduce((acc, d) => Math.max(acc, d.order), -1);
  custom.sort((a, b) => a.originalOrder - b.originalOrder);
  const customMapped = custom.map((c, i) => ({ id: c.id, order: maxTemplateOrder + 1 + i }));

  // Apply
  await withTransaction(async (client) => {
    // Bump every section's order_index out of the way first so the unique
    // (page_id, order_index) constraint can't fail mid-update.
    const ids = [...matched.map((m) => m.id), ...customMapped.map((m) => m.id)];
    if (ids.length > 0) {
      await client.query(
        "UPDATE sections SET order_index = order_index + 100000 WHERE id = ANY($1::int[]) AND tenant_id = $2",
        [ids, tenant.id]
      );
    }
    for (const m of matched) {
      await client.query(
        "UPDATE sections SET order_index = $1, updated_at = now() WHERE id = $2 AND tenant_id = $3",
        [m.order, m.id, tenant.id]
      );
    }
    for (const m of customMapped) {
      await client.query(
        "UPDATE sections SET order_index = $1, updated_at = now() WHERE id = $2 AND tenant_id = $3",
        [m.order, m.id, tenant.id]
      );
    }
  });

  invalidateTemplateCache();

  await auditLog("sections_order_reset", {
    tenantId: tenant.id,
    targetType: "page",
    targetId: String(homepage.id),
    extra: { reordered: matched.length, customKept: customMapped.length },
  });

  return Response.json({
    ok: true,
    reordered: matched.length,
    customKept: customMapped.length,
  });
}

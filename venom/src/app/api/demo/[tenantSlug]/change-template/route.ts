import { NextRequest } from "next/server";
import { z } from "zod";
import { query, queryOne, withTransaction, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { invalidateSlotsCache } from "@/lib/section-resolver";

/**
 * F2 Sprint 2 — Change template for a tenant.
 *
 * Flow:
 *   1. Validate target template_key exists in templates table (seeded by seed-all-templates.mjs)
 *   2. Load target's default_sections from template_versions (current_version)
 *   3. In transaction:
 *      - DELETE old sections (per page)
 *      - INSERT new sections from default_sections (content_source='v2' from day 0)
 *      - UPDATE tenant.template_id + template_version
 *   4. tenant_data_slots stay intact → brand, contact, hours, social, SEO survive
 *   5. tenant_overrides stay intact but will be no-ops (target sections don't match old paths)
 *
 * Preview mode (GET) — show diff: how many sections lost, which slots survive.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const PostBodySchema = z.object({
  targetTemplateKey: z.string().min(1).max(50),
  /** Set to true to skip the "preserve slots" preview confirmation. */
  confirm: z.boolean().default(false),
});

// GET — preview diff
export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const target = new URL(req.url).searchParams.get("to");
  if (!target) return Response.json({ error: "Missing ?to=<template_key>" }, { status: 400 });

  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const targetRow = await queryOne<{ id: number; current_version: string; name: string; industry: string }>(
    "SELECT id, current_version, name, industry FROM templates WHERE key = $1 AND status = 'active'",
    [target]
  );
  if (!targetRow) return Response.json({ error: `Target template ${target} not found or inactive` }, { status: 404 });

  const targetVersion = await queryOne<{ default_sections: Array<{ type: string; variant: string; order: number }> }>(
    "SELECT default_sections FROM template_versions WHERE template_id = $1 AND version = $2",
    [targetRow.id, targetRow.current_version]
  );
  if (!targetVersion) return Response.json({ error: "Target version not seeded" }, { status: 500 });

  // Current state
  const currentSections = await query<{ id: number; section_type: string }>(
    "SELECT id, section_type FROM sections WHERE tenant_id = $1",
    [tenant.id]
  );
  const slots = await query<{ slot_key: string }>(
    "SELECT slot_key FROM tenant_data_slots WHERE tenant_id = $1",
    [tenant.id]
  );

  return Response.json({
    from: {
      templateId: tenant.template_id,
      sectionsCount: currentSections.length,
    },
    to: {
      templateId: targetRow.id,
      templateKey: target,
      name: targetRow.name,
      industry: targetRow.industry,
      version: targetRow.current_version,
      sectionsCount: targetVersion.default_sections.length,
      sectionTypes: targetVersion.default_sections.map((s) => s.type),
    },
    preserved: {
      dataSlots: slots.map((s) => s.slot_key),
      blogPosts: true,
      media: true,
      domains: true,
    },
    discarded: {
      sectionsCount: currentSections.length,
      reason: "Sections rebuilt from new template defaults; data slots persist.",
    },
  });
}

// POST — apply the change
export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PostBodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const targetRow = await queryOne<{ id: number; current_version: string }>(
    "SELECT id, current_version FROM templates WHERE key = $1 AND status = 'active'",
    [parsed.data.targetTemplateKey]
  );
  if (!targetRow) return Response.json({ error: "Target template not found" }, { status: 404 });

  const targetVersion = await queryOne<{ default_sections: Array<{ type: string; variant: string; order: number; visible?: boolean; anchorId?: string }> }>(
    "SELECT default_sections FROM template_versions WHERE template_id = $1 AND version = $2",
    [targetRow.id, targetRow.current_version]
  );
  if (!targetVersion) return Response.json({ error: "Target version not seeded" }, { status: 500 });

  const oldTemplateId = tenant.template_id;
  const oldVersion = tenant.template_version;

  await withTransaction(async (client) => {
    // 1. Get home page
    const pageRes = await client.query<{ id: number }>(
      "SELECT id FROM pages WHERE tenant_id = $1 AND is_homepage = true LIMIT 1",
      [tenant.id]
    );
    if (pageRes.rows.length === 0) throw new Error("Tenant has no homepage");
    const pageId = pageRes.rows[0].id;

    // 2. Wipe old sections
    await client.query("DELETE FROM sections WHERE tenant_id = $1 AND page_id = $2", [tenant.id, pageId]);
    // 3. Insert new sections — content_source='v2' from day 0 (read-through, content comes from
    //    template_versions.default_sections at render time, slot refs resolved against tenant_data_slots)
    for (const s of targetVersion.default_sections) {
      await client.query(
        `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, '{}'::jsonb, 'v2')`,
        [
          tenant.id,
          pageId,
          s.type,
          s.variant ?? "default",
          s.order,
          s.visible !== false,
          JSON.stringify({ anchorId: s.anchorId }),
        ]
      );
    }

    // 4. Update tenant
    await client.query(
      "UPDATE tenants SET template_id = $1, template_version = $2, updated_at = now() WHERE id = $3",
      [targetRow.id, targetRow.current_version, tenant.id]
    );
  });

  // Slots cache (resolver reads slots → invalidate so user sees instant)
  invalidateSlotsCache(tenant.id);

  await auditLog("tenant_changed_template", {
    tenantId: tenant.id,
    targetType: "tenant",
    targetId: String(tenant.id),
    extra: {
      from: { templateId: oldTemplateId, version: oldVersion },
      to: { templateId: targetRow.id, key: parsed.data.targetTemplateKey, version: targetRow.current_version },
    },
  });

  return Response.json({
    ok: true,
    newTemplateKey: parsed.data.targetTemplateKey,
    newSectionsCount: targetVersion.default_sections.length,
  });
}

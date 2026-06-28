import { NextRequest } from "next/server";
import { z } from "zod";
import { query, queryOne, withTransaction, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * GET  /api/demo/<slug>/backup
 *   Dumps the tenant's editable state to a JSON payload (pages, sections,
 *   data slots, domains, design tokens). Used as a manual backup or to seed
 *   a new tenant from an existing one. Streams as an attachment.
 *
 * POST /api/demo/<slug>/backup
 *   Restores from a previously-dumped JSON. Wipes the tenant's pages +
 *   sections + data slots then re-inserts in a single transaction.
 *   Does NOT touch tenant row itself, domains or blog posts (those have
 *   stricter constraints / external dependencies).
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const BACKUP_VERSION = 1;

interface BackupShape {
  version: number;
  exportedAt: string;
  tenantSlug: string;
  designTokens: Record<string, unknown> | null;
  pages: Array<{
    slug: string;
    title: string;
    is_homepage: boolean;
    status: string;
    seo_title: string | null;
    seo_description: string | null;
    og_image: string | null;
    noindex: boolean | null;
    sections: Array<{
      section_type: string;
      section_variant: string;
      order_index: number;
      is_visible: boolean;
      settings: Record<string, unknown>;
      content_overrides: Record<string, unknown>;
      content_source: string | null;
    }>;
  }>;
  dataSlots: Array<{ slot_key: string; value: unknown }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const pages = await query<{
    id: number; slug: string; title: string; is_homepage: boolean; status: string;
    seo_title: string | null; seo_description: string | null; og_image: string | null;
    noindex: boolean | null;
  }>(
    "SELECT id, slug, title, is_homepage, status, seo_title, seo_description, og_image, noindex FROM pages WHERE tenant_id = $1 ORDER BY is_homepage DESC, slug",
    [tenant.id]
  );

  const allSections = await query<{
    page_id: number; section_type: string; section_variant: string; order_index: number;
    is_visible: boolean; settings: Record<string, unknown>; content_overrides: Record<string, unknown>;
    content_source: string | null;
  }>(
    "SELECT page_id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source FROM sections WHERE tenant_id = $1 ORDER BY page_id, order_index",
    [tenant.id]
  );

  const dataSlots = await query<{ slot_key: string; value: unknown }>(
    "SELECT slot_key, value FROM tenant_data_slots WHERE tenant_id = $1",
    [tenant.id]
  );

  // Pull designTokens from any section's settings (mirrored across all).
  const dtRow = allSections.find((s) => s.settings && typeof s.settings === "object" && "designTokens" in s.settings);
  const designTokens = dtRow ? ((dtRow.settings as { designTokens?: Record<string, unknown> }).designTokens ?? null) : null;

  const payload: BackupShape = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tenantSlug: tenant.slug,
    designTokens,
    pages: pages.map((p) => ({
      slug: p.slug,
      title: p.title,
      is_homepage: p.is_homepage,
      status: p.status,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
      og_image: p.og_image,
      noindex: p.noindex,
      sections: allSections
        .filter((s) => s.page_id === p.id)
        .map((s) => ({
          section_type: s.section_type,
          section_variant: s.section_variant,
          order_index: s.order_index,
          is_visible: s.is_visible,
          settings: s.settings,
          content_overrides: s.content_overrides,
          content_source: s.content_source,
        })),
    })),
    dataSlots: dataSlots.map((s) => ({ slot_key: s.slot_key, value: s.value })),
  };

  await auditLog("backup_exported", {
    tenantId: tenant.id,
    targetType: "tenant",
    targetId: String(tenant.id),
    extra: { pages: pages.length, sections: allSections.length },
  });

  const filename = `webero-backup-${tenant.slug}-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}

const RestoreSchema = z.object({
  version: z.number(),
  pages: z.array(z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    is_homepage: z.boolean(),
    status: z.string(),
    seo_title: z.string().nullable(),
    seo_description: z.string().nullable(),
    og_image: z.string().nullable(),
    noindex: z.boolean().nullable(),
    sections: z.array(z.object({
      section_type: z.string(),
      section_variant: z.string(),
      order_index: z.number().int(),
      is_visible: z.boolean(),
      settings: z.record(z.unknown()),
      content_overrides: z.record(z.unknown()),
      content_source: z.string().nullable(),
    })),
  })),
  dataSlots: z.array(z.object({ slot_key: z.string(), value: z.unknown() })),
}).passthrough();

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = RestoreSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  if (parsed.data.version !== BACKUP_VERSION) {
    return Response.json({ error: `Nepodporovaná verze zálohy (${parsed.data.version}, očekávána ${BACKUP_VERSION})` }, { status: 400 });
  }
  if (!parsed.data.pages.some((p) => p.is_homepage)) {
    return Response.json({ error: "Záloha neobsahuje úvodní stránku" }, { status: 400 });
  }

  // Stash current state into page_revisions so a botched restore is undoable.
  // We snapshot every page's sections one by one before the wipe.
  const existingPages = await query<{ id: number }>("SELECT id FROM pages WHERE tenant_id = $1", [tenant.id]);
  for (const p of existingPages) {
    const snap = await query("SELECT * FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index", [tenant.id, p.id]);
    if (snap.length > 0) {
      await query(
        "INSERT INTO page_revisions (tenant_id, page_id, sections_snapshot, created_by) VALUES ($1, $2, $3, 'pre-restore')",
        [tenant.id, p.id, JSON.stringify(snap)]
      );
    }
  }

  let restoredPages = 0;
  let restoredSections = 0;
  let restoredSlots = 0;
  await withTransaction(async (client) => {
    // Wipe (sections first due to FK), then data slots.
    await client.query("DELETE FROM sections WHERE tenant_id = $1", [tenant.id]);
    await client.query("DELETE FROM pages WHERE tenant_id = $1", [tenant.id]);
    await client.query("DELETE FROM tenant_data_slots WHERE tenant_id = $1", [tenant.id]);

    for (const p of parsed.data.pages) {
      const ins = await client.query<{ id: number }>(
        `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description, og_image, noindex)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          tenant.id, p.slug, p.title, p.is_homepage, p.status,
          p.seo_title, p.seo_description, p.og_image, p.noindex,
        ]
      );
      const pageId = ins.rows[0]?.id;
      if (!pageId) continue;
      restoredPages += 1;
      for (const s of p.sections) {
        await client.query(
          `INSERT INTO sections (
             tenant_id, page_id, section_type, section_variant, order_index,
             is_visible, settings, content_overrides, content_source
           ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9)`,
          [
            tenant.id, pageId, s.section_type, s.section_variant, s.order_index,
            s.is_visible, JSON.stringify(s.settings), JSON.stringify(s.content_overrides),
            s.content_source,
          ]
        );
        restoredSections += 1;
      }
    }

    for (const slot of parsed.data.dataSlots) {
      await client.query(
        `INSERT INTO tenant_data_slots (tenant_id, slot_key, value, updated_at)
         VALUES ($1, $2, $3::jsonb, now())`,
        [tenant.id, slot.slot_key, JSON.stringify(slot.value)]
      );
      restoredSlots += 1;
    }
  });

  await auditLog("backup_restored", {
    tenantId: tenant.id,
    targetType: "tenant",
    targetId: String(tenant.id),
    extra: { restoredPages, restoredSections, restoredSlots },
  });

  return Response.json({ ok: true, restoredPages, restoredSections, restoredSlots });
}

// queryOne kept available for future inspection endpoints.
void queryOne;

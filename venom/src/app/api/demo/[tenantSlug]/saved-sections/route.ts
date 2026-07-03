import { NextRequest } from "next/server";
import { query, queryOne } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

export const dynamic = "force-dynamic";

/** „Moje sekce" (3d) — uživatelské šablony sekcí. Snapshot type+variant+settings,
 *  vkládá se přes „+ Přidat → Sekce → Moje sekce". */

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await query(`
    CREATE TABLE IF NOT EXISTS saved_sections (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      section_type TEXT NOT NULL,
      section_variant TEXT NOT NULL DEFAULT 'default',
      settings JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);
  tableReady = true;
}

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTable();
  const rows = await query(
    `SELECT id, label, section_type, section_variant, settings, created_at
     FROM saved_sections WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [tenant.id]
  );
  return Response.json({ saved: rows });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { sectionId?: number; label?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const sectionId = Number(body.sectionId);
  const label = String(body.label ?? "").trim().slice(0, 80);
  if (!Number.isInteger(sectionId)) return Response.json({ error: "Invalid sectionId" }, { status: 400 });
  if (!label) return Response.json({ error: "Zadej název šablony" }, { status: 400 });

  // Snapshot sekce vč. plně vyřešeného obsahu (v2 sekce mají content v overrides —
  // ukládáme settings tak, jak je klient drží po merge, viz body.settings fallback níže)
  const section = await queryOne<{ section_type: string; section_variant: string; settings: Record<string, unknown> }>(
    "SELECT section_type, section_variant, settings FROM sections WHERE id = $1 AND tenant_id = $2",
    [sectionId, tenant.id]
  );
  if (!section) return Response.json({ error: "Section not found" }, { status: 404 });

  await ensureTable();
  const inserted = await query<{ id: number }>(
    `INSERT INTO saved_sections (tenant_id, label, section_type, section_variant, settings)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [tenant.id, label, section.section_type, section.section_variant, JSON.stringify(section.settings ?? {})]
  );
  return Response.json({ ok: true, id: inserted[0].id });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(req.nextUrl.searchParams.get("id") ?? "", 10);
  if (isNaN(id)) return Response.json({ error: "Invalid id" }, { status: 400 });

  await ensureTable();
  await query("DELETE FROM saved_sections WHERE id = $1 AND tenant_id = $2", [id, tenant.id]);
  return Response.json({ ok: true });
}

import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

/** GET /api/demo/[slug]/revisions?pageId=N — seznam verzí stránky (nejnovější první). */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const pageId = parseInt(req.nextUrl.searchParams.get("pageId") ?? "", 10);
  if (isNaN(pageId)) return Response.json({ error: "Invalid pageId" }, { status: 400 });

  const rows = await query<{ id: number; created_at: string; created_by: string | null; section_count: number }>(
    `SELECT id, created_at, created_by,
            jsonb_array_length(sections_snapshot) AS section_count
     FROM page_revisions
     WHERE tenant_id = $1 AND page_id = $2
     ORDER BY created_at DESC
     LIMIT 50`,
    [tenant.id, pageId]
  );
  return Response.json({ revisions: rows });
}

/** POST /api/demo/[slug]/revisions { pageId, label? } — snapshot aktuálního stavu stránky. */
export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { pageId?: number; label?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const pageId = Number(body.pageId);
  if (!Number.isInteger(pageId)) return Response.json({ error: "Invalid pageId" }, { status: 400 });
  const label = typeof body.label === "string" ? body.label.slice(0, 60) : "manual";

  const sections = await query(
    "SELECT * FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index",
    [tenant.id, pageId]
  );
  if (!sections.length) return Response.json({ error: "Stránka nemá žádné sekce" }, { status: 400 });

  // Dedup: pokud poslední snapshot je identický, nevytvářet duplicitní řádek
  const last = await query<{ id: number; sections_snapshot: unknown }>(
    "SELECT id, sections_snapshot FROM page_revisions WHERE tenant_id = $1 AND page_id = $2 ORDER BY created_at DESC LIMIT 1",
    [tenant.id, pageId]
  );
  if (last[0] && JSON.stringify(last[0].sections_snapshot) === JSON.stringify(sections)) {
    return Response.json({ ok: true, deduped: true, revisionId: last[0].id });
  }

  const inserted = await query<{ id: number }>(
    "INSERT INTO page_revisions (tenant_id, page_id, sections_snapshot, created_by) VALUES ($1, $2, $3, $4) RETURNING id",
    [tenant.id, pageId, JSON.stringify(sections), label]
  );
  return Response.json({ ok: true, revisionId: inserted[0].id });
}

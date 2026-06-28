import { NextRequest } from "next/server";
import { query, queryOne, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * POST /api/demo/<slug>/pages/<id>/clear
 *
 * "Blank starter" — removes every main section on the page, leaving only
 * navbar and footer so the user gets an empty canvas to design from scratch.
 * Snapshots the existing sections into page_revisions first so the action
 * is reversible from the Verze panel.
 */
interface RouteParams { params: Promise<{ tenantSlug: string; pageId: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug, pageId } = await params;
  const pid = parseInt(pageId, 10);
  if (isNaN(pid)) return Response.json({ error: "Invalid page ID" }, { status: 400 });

  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const page = await queryOne<{ id: number; title: string }>(
    "SELECT id, title FROM pages WHERE id = $1 AND tenant_id = $2",
    [pid, tenant.id]
  );
  if (!page) return Response.json({ error: "Page not found" }, { status: 404 });

  // Snapshot before wipe so user can restore from Verze.
  const existing = await query(
    "SELECT * FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index",
    [tenant.id, pid]
  );
  if (existing.length > 0) {
    await query(
      "INSERT INTO page_revisions (tenant_id, page_id, sections_snapshot, created_by) VALUES ($1, $2, $3, 'pre-clear')",
      [tenant.id, pid, JSON.stringify(existing)]
    );
  }

  // Delete only main sections; keep navbar + footer so the page stays usable.
  const deleted = await query<{ id: number }>(
    "DELETE FROM sections WHERE tenant_id = $1 AND page_id = $2 AND section_type NOT IN ('navbar', 'footer') RETURNING id",
    [tenant.id, pid]
  );

  // Renumber the surviving navbar/footer to indices 0, 1.
  await query(
    `WITH ordered AS (
       SELECT id, ROW_NUMBER() OVER (ORDER BY section_type DESC, order_index) - 1 AS new_order
         FROM sections WHERE tenant_id = $1 AND page_id = $2
     )
     UPDATE sections s SET order_index = o.new_order
       FROM ordered o WHERE s.id = o.id`,
    [tenant.id, pid]
  );

  await auditLog("page_cleared", {
    tenantId: tenant.id,
    targetType: "page",
    targetId: String(pid),
    extra: { sectionsRemoved: deleted.length, pageTitle: page.title },
  });

  return Response.json({ ok: true, removed: deleted.length });
}

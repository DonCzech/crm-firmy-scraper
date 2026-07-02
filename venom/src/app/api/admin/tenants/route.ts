import { NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { query } from "@/lib/db";

function getAdmin(req: NextRequest) {
  const cookies = req.headers.get("cookie") ?? "";
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyToken(match[1]);
}

// GET /api/admin/tenants — list all tenants with size info
export async function GET(req: NextRequest) {
  if (!getAdmin(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const tenants = await query<{
    id: number; slug: string; email: string; template_id: number | null;
    lifecycle_status: string; created_at: string;
    sections_count: number; pages_count: number;
  }>(`
    SELECT
      t.id, t.slug, t.email, t.template_id, t.lifecycle_status, t.created_at,
      COUNT(DISTINCT s.id)::int AS sections_count,
      COUNT(DISTINCT p.id)::int AS pages_count
    FROM tenants t
    LEFT JOIN sections s ON s.tenant_id = t.id
    LEFT JOIN pages p ON p.tenant_id = t.id
    GROUP BY t.id, t.slug, t.email, t.template_id, t.lifecycle_status, t.created_at
    ORDER BY t.created_at DESC
  `);

  return Response.json({ tenants });
}

// DELETE /api/admin/tenants — bulk delete by id list
export async function DELETE(req: NextRequest) {
  if (!getAdmin(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { ids: number[] };
  const ids = body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return Response.json({ error: "ids required" }, { status: 400 });
  }

  // Cascade delete all child tables in correct order
  const childTables = [
    "sections",
    "pages",
    "page_revisions",
    "tenant_overrides",
    "tenant_data_slots",
    "tenant_modules",
    "tenant_contacts",
    "tenant_css_classes",
    "tenant_http_headers",
    "tenant_redirects",
    "tenant_events",
    "domains",
    "media",
    "blog_posts",
    "contact_submissions",
    "form_leads",
    "subscriptions",
  ];

  for (const table of childTables) {
    await query(
      `DELETE FROM ${table} WHERE tenant_id = ANY($1::int[])`,
      [ids]
    ).catch(() => {/* table may not exist in all envs */});
  }

  // Finally delete tenants themselves
  const result = await query<{ id: number }>(
    `DELETE FROM tenants WHERE id = ANY($1::int[]) RETURNING id`,
    [ids]
  );

  return Response.json({ deleted: result.length });
}

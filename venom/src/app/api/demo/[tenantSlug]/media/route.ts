import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * F2 Sprint 3 — tenant media library.
 *
 * GET /api/demo/:tenantSlug/media?limit=&offset=
 *   Returns a paginated list of media items uploaded for this tenant. Used by
 *   AssetsPanel in studio.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

interface MediaRow {
  id: number;
  url: string;
  filename: string;
  original_name: string | null;
  mime_type: string;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  created_at: string;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "200", 10) || 200, 500);
  const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "0", 10) || 0, 0);

  const rows = await query<MediaRow>(
    `SELECT id, url, filename, original_name, mime_type, size_bytes,
            width, height, alt_text, created_at
       FROM media
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
    [tenant.id, limit, offset]
  );

  return Response.json({
    items: rows.map((r) => ({
      id: r.id,
      url: r.url,
      filename: r.original_name ?? r.filename,
      width: r.width,
      height: r.height,
      mime_type: r.mime_type,
      size_bytes: r.size_bytes,
      alt_text: r.alt_text,
      created_at: r.created_at,
    })),
    count: rows.length,
  });
}

import { NextRequest } from "next/server";
import { getTenantBySlug, query, withTransaction, auditLog } from "@/lib/db";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import type { PoolClient } from "pg";
import { assertSameOrigin } from "@/lib/demo-auth";

interface RouteParams {
  params: Promise<{ tenantSlug: string; revisionId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug, revisionId } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });

  const cookieStore = await cookies();
  const token = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || !token) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(tenant.access_token);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const revId = parseInt(revisionId, 10);
  if (isNaN(revId)) return Response.json({ error: "Invalid revision ID" }, { status: 400 });

  const revRows = await query<{ page_id: number; sections_snapshot: unknown[] }>(
    "SELECT page_id, sections_snapshot FROM page_revisions WHERE id = $1 AND tenant_id = $2",
    [revId, tenant.id]
  );
  if (!revRows.length) return Response.json({ error: "Revision not found" }, { status: 404 });

  const { page_id, sections_snapshot } = revRows[0];
  const sections = sections_snapshot as Array<Record<string, unknown>>;

  await withTransaction(async (client: PoolClient) => {
    // Save current state as a new revision before restoring
    const currentSections = await query(
      "SELECT * FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index",
      [tenant.id, page_id]
    );
    if (currentSections.length > 0) {
      await client.query(
        "INSERT INTO page_revisions (tenant_id, page_id, sections_snapshot, created_by) VALUES ($1, $2, $3, 'restore-pre-snapshot')",
        [tenant.id, page_id, JSON.stringify(currentSections)]
      );
    }

    // Delete current sections for this page
    await client.query("DELETE FROM sections WHERE tenant_id = $1 AND page_id = $2", [tenant.id, page_id]);

    // Restore from snapshot
    for (const sec of sections) {
      await client.query(
        `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          tenant.id,
          page_id,
          sec.section_type,
          sec.section_variant ?? "default",
          sec.order_index,
          sec.is_visible ?? true,
          JSON.stringify(sec.settings ?? {}),
        ]
      );
    }
  });

  await auditLog("revision_restored", {
    tenantId: tenant.id,
    targetType: "page",
    targetId: String(page_id),
    extra: { revision_id: revId },
  });

  revalidatePath(`/demo/${tenantSlug}`);

  return Response.json({ ok: true });
}

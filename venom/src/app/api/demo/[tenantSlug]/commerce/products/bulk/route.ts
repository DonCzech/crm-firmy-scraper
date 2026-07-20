import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { requireCommerceAdmin, jsonError } from "@/lib/commerce/api-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const { action, productIds } = await req.json() as { action: string; productIds: number[] };
  if (!Array.isArray(productIds) || productIds.length === 0) return jsonError("Žádné produkty");

  const statusMap: Record<string, string> = {
    activate: "active",
    deactivate: "draft",
    archive: "archived",
  };

  const newStatus = statusMap[action];
  if (!newStatus) return jsonError("Neznámá akce");

  const placeholders = productIds.map((_, i) => `$${i + 3}`).join(",");
  await query(
    `UPDATE products SET status = $1, updated_at = now() WHERE tenant_id = $2 AND id IN (${placeholders})`,
    [newStatus, guard.tenant.id, ...productIds]
  );

  return Response.json({ ok: true, updated: productIds.length });
}

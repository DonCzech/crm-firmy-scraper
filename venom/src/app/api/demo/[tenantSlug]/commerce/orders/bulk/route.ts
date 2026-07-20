import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { requireCommerceAdmin, jsonError } from "@/lib/commerce/api-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const { action, orderIds } = await req.json();
  if (!Array.isArray(orderIds) || orderIds.length === 0) return jsonError("Žádné objednávky");

  const validActions = ["confirm", "ship", "complete", "cancel"];
  if (!validActions.includes(action)) return jsonError("Neplatná akce");

  const statusMap: Record<string, string> = {
    confirm: "confirmed",
    ship: "shipped",
    complete: "completed",
    cancel: "cancelled",
  };

  const newStatus = statusMap[action];
  const placeholders = orderIds.map((_: number, i: number) => `$${i + 3}`).join(",");

  const result = await query(
    `UPDATE orders SET status = $1, updated_at = now()
     WHERE tenant_id = $2 AND id IN (${placeholders})
     RETURNING id`,
    [newStatus, guard.tenant.id, ...orderIds]
  );

  return Response.json({ updated: result.length, status: newStatus });
}

import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { StockAdjustSchema } from "@/lib/commerce/api-schemas";
import { adjustStock } from "@/lib/commerce/products";

/** Webero Commerce — quick stock adjustment (POST { variant_id, delta, reason }). */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(req);
  if (body === null) return jsonError("Neplatný JSON");
  const parsed = StockAdjustSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Neplatná data");

  const qty = await adjustStock(
    guard.tenant.id,
    parsed.data.variant_id,
    parsed.data.delta,
    parsed.data.reason,
    guard.tenant.email,
    parsed.data.note
  );
  if (qty === null) return jsonError("Varianta nenalezena", 404);
  return Response.json({ ok: true, stock_qty: qty });
}

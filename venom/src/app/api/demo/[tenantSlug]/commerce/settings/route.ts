import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { ShopPatchSchema } from "@/lib/commerce/api-schemas";
import { updateShop } from "@/lib/commerce/shop";
import { auditLog } from "@/lib/db";

/** Webero Commerce — shop settings (GET, PATCH). */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  return Response.json({ shop: guard.shop });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(req);
  if (body === null) return jsonError("Neplatný JSON");
  const parsed = ShopPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Neplatná data");

  const shop = await updateShop(guard.tenant.id, parsed.data);
  await auditLog("commerce_shop_updated", {
    tenantId: guard.tenant.id,
    actorEmail: guard.tenant.email,
    targetType: "shop",
    targetId: String(guard.shop.id),
    extra: { fields: Object.keys(parsed.data) },
  });
  return Response.json({ shop });
}

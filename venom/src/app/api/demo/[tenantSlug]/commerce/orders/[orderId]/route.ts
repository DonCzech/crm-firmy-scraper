import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { OrderPatchSchema } from "@/lib/commerce/api-schemas";
import { getOrder, updateOrderStatus } from "@/lib/commerce/orders";
import { sendOrderShippedEmail } from "@/lib/commerce/emails";
import { isAddonActive } from "@/lib/commerce/addons";
import { queueOrderStatusSms } from "@/lib/commerce/sms";

/**
 * Webero Commerce — single order.
 * GET   detail (items snapshot + timeline)
 * PATCH status / payment_status / admin_note (validated transitions,
 *       storno vrací sklad, každá změna = order_event)
 */
interface RouteParams { params: Promise<{ tenantSlug: string; orderId: string }> }

function parseId(raw: string): number | null {
  const id = parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug, orderId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const id = parseId(orderId);
  if (!id) return jsonError("Neplatné ID objednávky");

  const order = await getOrder(guard.tenant.id, id);
  if (!order) return jsonError("Objednávka nenalezena", 404);
  return Response.json({ order });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug, orderId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const id = parseId(orderId);
  if (!id) return jsonError("Neplatné ID objednávky");

  const body = await parseJsonBody(req);
  if (body === null) return jsonError("Neplatný JSON");
  const parsed = OrderPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Neplatná data");

  try {
    const order = await updateOrderStatus(guard.tenant.id, id, parsed.data, guard.tenant.email);
    if (!order) return jsonError("Objednávka nenalezena", 404);
    // Přechod na „Odesláno" → informační e-mail zákazníkovi (fire-and-forget)
    if (parsed.data.status === "shipped") {
      sendOrderShippedEmail(order, guard.shop).catch((e) => console.error("[orders] shipped email failed:", e));
    }
    // Modul sms-upozorneni: SMS trigger na změnu stavu / přijetí platby
    const smsTrigger = parsed.data.status ?? (parsed.data.payment_status === "paid" ? "paid" : null);
    if (smsTrigger && (await isAddonActive(guard.tenant.id, "sms-upozorneni"))) {
      queueOrderStatusSms(guard.tenant.id, id, smsTrigger, guard.shop.name || "Obchod")
        .catch((e) => console.error("[orders] sms failed:", e));
    }
    return Response.json({ order });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Aktualizace objednávky selhala", 400);
  }
}

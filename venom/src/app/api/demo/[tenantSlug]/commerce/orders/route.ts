import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { OrderCreateSchema } from "@/lib/commerce/api-schemas";
import { listOrders, createOrder } from "@/lib/commerce/orders";
import type { OrderStatus, PaymentStatus } from "@/lib/commerce/types";

/**
 * Webero Commerce — orders collection.
 * GET  list (pagination, status/payment filter, search by number/email)
 * POST manual order creation (Fáze 1; public checkout přijde ve Fázi 4)
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const ORDER_STATUSES = new Set(["pending", "confirmed", "processing", "shipped", "completed", "cancelled", "all"]);
const PAYMENT_STATUSES = new Set(["pending", "authorized", "paid", "failed", "cancelled", "refunded", "partially_refunded", "all"]);

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") ?? "all";
  const paymentStatus = sp.get("paymentStatus") ?? "all";

  const result = await listOrders(guard.tenant.id, {
    page: parseInt(sp.get("page") ?? "1", 10) || 1,
    perPage: parseInt(sp.get("perPage") ?? "50", 10) || 50,
    status: ORDER_STATUSES.has(status) ? (status as OrderStatus | "all") : "all",
    paymentStatus: PAYMENT_STATUSES.has(paymentStatus) ? (paymentStatus as PaymentStatus | "all") : "all",
    search: sp.get("search") ?? undefined,
  });

  return Response.json(result);
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(req);
  if (body === null) return jsonError("Neplatný JSON");
  const parsed = OrderCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Neplatná data");

  try {
    const order = await createOrder(guard.tenant.id, parsed.data, guard.tenant.email);
    return Response.json({ order }, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Vytvoření objednávky selhalo", 400);
  }
}

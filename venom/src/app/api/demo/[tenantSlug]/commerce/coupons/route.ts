import { NextRequest } from "next/server";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/commerce/coupons";

interface RouteParams { params: Promise<{ tenantSlug: string }> }

/** Jediné typy, které umí validateCoupon — cokoliv jiného by vzniklo jako mrtvý kupón. */
const COUPON_TYPES = new Set(["percentage", "fixed", "free_shipping"]);

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  const coupons = await listCoupons(guard.tenant.id);
  return Response.json({ coupons });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  const body = await parseJsonBody(req);
  if (!body || typeof body !== "object") return jsonError("Neplatný JSON");
  const d = body as Record<string, unknown>;
  if (!d.code || !d.type || d.value === undefined) return jsonError("code, type a value jsou povinné");
  if (!COUPON_TYPES.has(String(d.type))) return jsonError("type musí být percentage, fixed nebo free_shipping");
  try {
    const coupon = await createCoupon(guard.tenant.id, {
      code: String(d.code),
      type: String(d.type),
      value: Number(d.value),
      min_order_cents: d.min_order_cents != null ? Number(d.min_order_cents) : null,
      max_uses: d.max_uses != null ? Number(d.max_uses) : null,
      applies_to: d.applies_to ? String(d.applies_to) : "order",
      valid_from: d.valid_from ? String(d.valid_from) : null,
      valid_until: d.valid_until ? String(d.valid_until) : null,
      is_active: d.is_active !== false,
    });
    return Response.json({ coupon }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Vytvoření kupónu selhalo";
    if (msg.includes("duplicate key")) return jsonError("Kupón s tímto kódem už existuje", 409);
    return jsonError(msg, 400);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  const body = await parseJsonBody(req);
  if (!body || typeof body !== "object") return jsonError("Neplatný JSON");
  const d = body as Record<string, unknown>;
  if (!d.id) return jsonError("id je povinné");
  if (d.type != null && !COUPON_TYPES.has(String(d.type))) return jsonError("type musí být percentage, fixed nebo free_shipping");
  const coupon = await updateCoupon(guard.tenant.id, Number(d.id), {
    code: d.code != null ? String(d.code) : undefined,
    type: d.type != null ? String(d.type) : undefined,
    value: d.value != null ? Number(d.value) : undefined,
    min_order_cents: d.min_order_cents !== undefined ? (d.min_order_cents != null ? Number(d.min_order_cents) : null) : undefined,
    max_uses: d.max_uses !== undefined ? (d.max_uses != null ? Number(d.max_uses) : null) : undefined,
    applies_to: d.applies_to != null ? String(d.applies_to) : undefined,
    valid_from: d.valid_from !== undefined ? (d.valid_from ? String(d.valid_from) : null) : undefined,
    valid_until: d.valid_until !== undefined ? (d.valid_until ? String(d.valid_until) : null) : undefined,
    is_active: d.is_active !== undefined ? Boolean(d.is_active) : undefined,
  });
  if (!coupon) return jsonError("Kupón nenalezen", 404);
  return Response.json({ coupon });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) return jsonError("id je povinné");
  const ok = await deleteCoupon(guard.tenant.id, id);
  if (!ok) return jsonError("Kupón nenalezen", 404);
  return Response.json({ ok: true });
}

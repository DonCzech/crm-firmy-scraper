import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug } from "@/lib/db";
import { assertSameOrigin } from "@/lib/demo-auth";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { setCartItemQty, getCartView } from "@/lib/commerce/cart";

/** Public storefront API — změna počtu kusů (qty 0 = odebrat). */
interface RouteParams { params: Promise<{ tenantSlug: string; itemId: string }> }

const BodySchema = z.object({ qty: z.number().int().min(0).max(999) });

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug, itemId } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return Response.json({ error: "Not found" }, { status: 404 });

  const id = parseInt(itemId, 10);
  if (!Number.isInteger(id) || id <= 0) return Response.json({ error: "Neplatná položka" }, { status: 400 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Neplatný požadavek" }, { status: 400 }); }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Neplatný požadavek" }, { status: 400 });

  const token = req.cookies.get(`webero_cart_${tenantSlug}`)?.value;
  if (!token) return Response.json({ error: "Košík nenalezen" }, { status: 404 });

  const result = await setCartItemQty(tenant.id, token, id, parsed.data.qty);
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 });

  const cart = await getCartView(tenant.id, token, shop.currency);
  return Response.json({ cart: { ...cart, token: undefined } });
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug } from "@/lib/db";
import { assertSameOrigin } from "@/lib/demo-auth";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getCartView } from "@/lib/commerce/cart";
import { validateCoupon } from "@/lib/commerce/coupons";

/**
 * Public storefront API — ověření slevového kupónu proti aktuálnímu košíku.
 * Slevu počítá server; klient dostane jen výsledek pro zobrazení.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const BodySchema = z.object({ code: z.string().min(1).max(40) });

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return Response.json({ error: "Not found" }, { status: 404 });

  const cartToken = req.cookies.get(`webero_cart_${tenantSlug}`)?.value;
  if (!cartToken) return Response.json({ error: "Košík je prázdný" }, { status: 400 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Neplatný požadavek" }, { status: 400 }); }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Zadejte kód kupónu" }, { status: 400 });

  const cart = await getCartView(tenant.id, cartToken, shop.currency);
  if (!cart.items.length) return Response.json({ error: "Košík je prázdný" }, { status: 400 });

  const v = await validateCoupon(tenant.id, parsed.data.code, cart.subtotal_cents);
  if (!v.ok) return Response.json({ error: v.error }, { status: 400 });

  return Response.json({
    code: v.coupon.code,
    type: v.coupon.type,
    discount_cents: v.discount_cents,
    free_shipping: v.free_shipping,
  });
}

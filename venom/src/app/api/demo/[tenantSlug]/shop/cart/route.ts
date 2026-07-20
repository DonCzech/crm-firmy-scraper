import { NextRequest } from "next/server";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getCartView } from "@/lib/commerce/cart";

/** Public storefront API — košík aktuálního návštěvníka (cookie token). */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return Response.json({ error: "Not found" }, { status: 404 });

  const token = req.cookies.get(`webero_cart_${tenantSlug}`)?.value ?? null;
  const cart = await getCartView(tenant.id, token, shop.currency);
  return Response.json({ cart: { ...cart, token: undefined } });
}

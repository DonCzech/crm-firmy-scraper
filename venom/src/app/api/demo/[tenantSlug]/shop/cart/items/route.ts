import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug } from "@/lib/db";
import { assertSameOrigin } from "@/lib/demo-auth";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { addCartItem, getCartView } from "@/lib/commerce/cart";

/** Public storefront API — přidání do košíku. Nastavuje httpOnly cookie token. */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const BodySchema = z.object({
  variant_id: z.number().int().positive(),
  qty: z.number().int().min(1).max(999).default(1),
});

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Neplatný požadavek" }, { status: 400 }); }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Neplatný požadavek" }, { status: 400 });

  const token = req.cookies.get(`webero_cart_${tenantSlug}`)?.value ?? null;
  // Shop (kvůli měně) a zápis do košíku na sobě nezávisí — paralelně ušetříme roundtrip na DB.
  const [shop, result] = await Promise.all([
    getShopByTenantId(tenant.id),
    addCartItem(tenant.id, token, parsed.data.variant_id, parsed.data.qty),
  ]);
  if (!shop) return Response.json({ error: "Not found" }, { status: 404 });
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 });

  const cart = await getCartView(tenant.id, result.token, shop.currency);
  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append(
    "Set-Cookie",
    `webero_cart_${tenantSlug}=${result.token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`
  );
  return new Response(JSON.stringify({ cart: { ...cart, token: undefined } }), { status: 200, headers });
}

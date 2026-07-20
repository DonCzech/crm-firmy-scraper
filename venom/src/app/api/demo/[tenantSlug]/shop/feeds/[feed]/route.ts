import { NextRequest } from "next/server";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { renderGoogleFeed, renderHeurekaFeed } from "@/lib/commerce/feeds";

/**
 * Public produktové feedy:
 *   GET /api/demo/{slug}/shop/feeds/google  — Google Merchant XML
 *   GET /api/demo/{slug}/shop/feeds/heureka — Heureka XML
 */
interface RouteParams { params: Promise<{ tenantSlug: string; feed: string }> }

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug, feed } = await params;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return Response.json({ error: "Not found" }, { status: 404 });

  const origin = req.nextUrl.origin;
  let xml: string;
  if (feed === "google") {
    xml = await renderGoogleFeed(tenant.id, tenantSlug, origin, shop.name || "Obchod", shop.currency || "CZK");
  } else if (feed === "heureka") {
    xml = await renderHeurekaFeed(tenant.id, tenantSlug, origin);
  } else {
    return Response.json({ error: "Neznámý feed. Použijte google nebo heureka." }, { status: 404 });
  }

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=900",
    },
  });
}

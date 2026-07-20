import { NextRequest } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { isAddonActive } from "@/lib/commerce/addons";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getLabelOrder, ensureTrackingNumber, renderLabelHtml } from "@/lib/commerce/shipping-labels";

export const dynamic = "force-dynamic";

/** Modul „Tisk štítků“ — HTML print view přepravního štítku s barcode. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string; orderId: string }> }) {
  const { tenantSlug, orderId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  if (!(await isAddonActive(guard.tenant.id, "tisk-stitku"))) {
    return Response.json({ error: "Modul Tisk štítků není aktivní" }, { status: 403 });
  }

  await initCommerceDb();
  const order = await getLabelOrder(guard.tenant.id, Number(orderId));
  if (!order) return Response.json({ error: "Objednávka nenalezena" }, { status: 404 });

  const [shop, tracking] = await Promise.all([
    getShopByTenantId(guard.tenant.id),
    ensureTrackingNumber(guard.tenant.id, order),
  ]);

  const html = renderLabelHtml({
    shopName: shop?.name || "Obchod",
    order,
    tracking,
    autoPrint: req.nextUrl.searchParams.get("print") === "1",
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

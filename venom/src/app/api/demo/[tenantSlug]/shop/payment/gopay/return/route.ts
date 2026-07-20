import { NextRequest, NextResponse } from "next/server";
import { processGoPayShopPayment } from "@/lib/commerce/shop-payments";

/**
 * GoPay return URL — zákazník se vrací z brány. Ověří stav platby u GoPay
 * (idempotentně) a přesměruje na potvrzení objednávky.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const sp = req.nextUrl.searchParams;
  const gopayId = parseInt(sp.get("id") ?? "", 10);
  const orderNumber = sp.get("order") ?? "";
  const token = sp.get("t") ?? "";

  let paid = false;
  if (Number.isInteger(gopayId) && gopayId > 0) {
    try {
      const result = await processGoPayShopPayment(gopayId);
      paid = result?.paid ?? false;
    } catch (e) {
      console.error("[gopay return] process failed:", e);
    }
  }

  const url = new URL(`/demo/${tenantSlug}/obchod/objednavka/${orderNumber}`, req.nextUrl.origin);
  url.searchParams.set("t", token);
  if (!paid) url.searchParams.set("platba", "neuspesna");
  return NextResponse.redirect(url);
}

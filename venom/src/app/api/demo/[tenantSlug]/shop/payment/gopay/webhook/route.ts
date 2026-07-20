import { NextRequest } from "next/server";
import { processGoPayShopPayment } from "@/lib/commerce/shop-payments";

/**
 * GoPay notification URL (server-to-server). GoPay posílá GET s ?id=<payment id>.
 * Stav se vždy ověřuje dotazem na GoPay API (ne z parametrů) a zapisuje
 * idempotentně — opakovaná notifikace je no-op.
 */
export async function GET(req: NextRequest) {
  const gopayId = parseInt(req.nextUrl.searchParams.get("id") ?? "", 10);
  if (!Number.isInteger(gopayId) || gopayId <= 0) {
    return new Response("missing id", { status: 400 });
  }
  try {
    const result = await processGoPayShopPayment(gopayId);
    if (!result) return new Response("unknown payment", { status: 404 });
    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("[gopay webhook] failed:", e);
    // 500 → GoPay notifikaci zopakuje
    return new Response("error", { status: 500 });
  }
}

export const POST = GET;

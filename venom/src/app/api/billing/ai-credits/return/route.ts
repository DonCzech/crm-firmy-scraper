import { NextRequest, NextResponse } from "next/server";
import { getGoPayPayment } from "@/lib/gopay";
import { initDb, query } from "@/lib/db";
import { creditTopup } from "@/lib/ai-designer/credits";
import { getCreditPack } from "@/lib/ai-designer/pricing";

/**
 * GET /api/billing/ai-credits/return — návrat z GoPay brány po dobití kreditů.
 * Připsání je idempotentní (unikátní ledger index na order_number) — webhook
 * i return mohou doběhnout oba, kredit se připíše právě jednou.
 */
export async function GET(req: NextRequest) {
  await initDb();

  const orderId = req.nextUrl.searchParams.get("orderId") ?? "";
  const tenantSlug = req.nextUrl.searchParams.get("tenantSlug") ?? "";
  const returnTo = req.nextUrl.searchParams.get("returnTo") === "builder" ? "builder" : "admin";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const studioUrl = `${appUrl}/demo/${encodeURIComponent(tenantSlug)}/${returnTo}`;

  if (!orderId || !tenantSlug) return NextResponse.redirect(`${studioUrl}?ai_credits=error`);

  try {
    const rows = await query<{ tenant_id: number; gopay_id: string | null; order_number: string }>(
      `SELECT tenant_id, gopay_id, order_number FROM gopay_payments
        WHERE order_number = $1 AND type = 'ai_credits' LIMIT 1`,
      [orderId]
    );
    const row = rows[0];
    if (!row?.gopay_id) return NextResponse.redirect(`${studioUrl}?ai_credits=error`);

    const payment = await getGoPayPayment(Number(row.gopay_id));

    await query(
      `UPDATE gopay_payments SET status = $2, raw_response = $3, updated_at = now() WHERE order_number = $1`,
      [orderId, payment.state === "PAID" ? "paid" : payment.state.toLowerCase(), JSON.stringify(payment)]
    );

    if (payment.state !== "PAID") {
      return NextResponse.redirect(`${studioUrl}?ai_credits=pending`);
    }

    // AIC-<pack>-<ts>-<rand>
    const packId = orderId.split("-")[1] ?? "";
    const pack = getCreditPack(packId);
    if (!pack) return NextResponse.redirect(`${studioUrl}?ai_credits=error`);

    await creditTopup(row.tenant_id, row.order_number, pack.credits);
    return NextResponse.redirect(`${studioUrl}?ai_credits=success&credits=${pack.credits}`);
  } catch (err) {
    console.error("[ai-credits/return]", err);
    return NextResponse.redirect(`${studioUrl}?ai_credits=error`);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getGoPayPayment } from "@/lib/gopay";
import { activateGoPaySubscription, initDb, query } from "@/lib/db";

export const dynamic = "force-dynamic";

const PROCESSING_STATES = new Set(["CREATED", "PAYMENT_METHOD_CHOSEN", "AUTHORIZED"]);

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function redirect(req: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, req.url), { status: 302 });
}

export async function GET(req: NextRequest) {
  await initDb();

  const orderId = req.nextUrl.searchParams.get("orderId") || "";
  const gopayId = req.nextUrl.searchParams.get("id") || "";
  const tenantSlug = req.nextUrl.searchParams.get("tenantSlug") || "";

  const studioBase = tenantSlug ? `/demo/${tenantSlug}/admin` : "/";

  if (!orderId || !gopayId || !/^\d+$/.test(gopayId)) {
    return redirect(req, `${studioBase}?tab=billing&payment=failed&reason=missing_params`);
  }

  const rows = await query<{ tenant_id: number }>(
    "SELECT tenant_id FROM gopay_payments WHERE order_number = $1 LIMIT 1",
    [orderId]
  );
  const tenantId = rows[0]?.tenant_id ?? null;
  if (!tenantId) {
    return redirect(req, `${studioBase}?tab=billing&payment=failed&reason=order_not_found`);
  }

  try {
    let payment = await getGoPayPayment(Number(gopayId));
    for (let i = 0; i < 20 && PROCESSING_STATES.has(payment.state); i++) {
      await sleep(1500);
      payment = await getGoPayPayment(Number(gopayId));
    }

    const { activated } = await activateGoPaySubscription({ tenantId, orderId, gopayId, payment });

    if (!activated || payment.state !== "PAID") {
      return redirect(req, `${studioBase}?tab=billing&payment=failed&reason=${encodeURIComponent(payment.state.toLowerCase())}`);
    }

    return redirect(req, `${studioBase}?tab=billing&payment=success`);
  } catch (err) {
    console.error("[billing/gopay/return]", err);
    return redirect(req, `${studioBase}?tab=billing&payment=failed&reason=verification_error`);
  }
}

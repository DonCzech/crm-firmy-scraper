import { NextRequest } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { query } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { createGoPayPayment } from "@/lib/gopay";
import { CREDIT_PACKS, MODE_PRICING, getCreditPack } from "@/lib/ai-designer/pricing";
import { getWallet, getLedger } from "@/lib/ai-designer/credits";

/**
 * GET  /api/demo/<slug>/ai/designer/credits — zůstatek, ceník, historie
 * POST /api/demo/<slug>/ai/designer/credits — dobití přes GoPay (vrací gw_url)
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const wallet = await getWallet(tenant.id);
  const ledger = await getLedger(tenant.id);
  return Response.json({
    balance: wallet.balance,
    reserved: wallet.reserved,
    packs: CREDIT_PACKS,
    modes: Object.values(MODE_PRICING).map(({ id, label, credits, hint }) => ({ id, label, credits, hint })),
    ledger,
  });
}

const TopupSchema = z.object({
  pack: z.string().min(1).max(30),
  // odkud uživatel dobíjí — GoPay ho po platbě vrátí na stejné místo
  returnTo: z.enum(["studio", "builder"]).default("studio"),
});

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = TopupSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Neplatná data" }, { status: 422 });

  const pack = getCreditPack(parsed.data.pack);
  if (!pack) return Response.json({ error: "Neznámý balíček" }, { status: 422 });

  // Order number kóduje balíček — webhook/return z něj idempotentně odvodí kredity.
  const orderId = `AIC-${pack.id}-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  try {
    const payment = await createGoPayPayment({
      amountInCents: pack.amountCents,
      currency: "CZK",
      orderId,
      description: `Webero AI kredity — balíček ${pack.label} (${pack.credits} kreditů)`,
      returnUrl: `${appUrl}/api/billing/ai-credits/return?orderId=${encodeURIComponent(orderId)}&tenantSlug=${encodeURIComponent(tenantSlug)}&returnTo=${parsed.data.returnTo}`,
      notificationUrl: `${appUrl}/api/billing/gopay/webhook`,
      buyerEmail: tenant.email || undefined,
    });

    if (!payment.gw_url) throw new Error("GoPay nevrátil platební URL");

    await query(
      `INSERT INTO gopay_payments
         (tenant_id, gopay_id, order_number, type, amount_cents, currency, status, gw_url, raw_response)
       VALUES ($1, $2, $3, 'ai_credits', $4, 'CZK', 'pending', $5, $6)
       ON CONFLICT (order_number) DO NOTHING`,
      [tenant.id, String(payment.id), orderId, pack.amountCents, payment.gw_url, JSON.stringify(payment)]
    );

    return Response.json({ url: payment.gw_url, orderId });
  } catch (err) {
    console.error("[ai-credits/topup]", err);
    return Response.json({ error: "payment_creation_failed" }, { status: 500 });
  }
}

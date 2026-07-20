import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { deactivateGiftCard, getGiftCardTransactions } from "@/lib/commerce/gift-cards";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; cardId: string }> }
) {
  const { tenantSlug, cardId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const cardRows = await query<{ id: number; code: string; initial_cents: number; balance_cents: number; currency: string; is_active: boolean; expires_at: string | null; created_at: string }>(
      `SELECT * FROM commerce_gift_cards WHERE tenant_id = $1 AND id = $2`, [guard.tenant.id, Number(cardId)]
    );
    const card = cardRows?.[0] ?? null;
    const transactions = card ? await getGiftCardTransactions(guard.tenant.id, card.id) : [];
    return NextResponse.json({ card, transactions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; cardId: string }> }
) {
  const { tenantSlug, cardId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const body = await req.json();
    if (body.action === "deactivate") {
      const card = await deactivateGiftCard(guard.tenant.id, Number(cardId));
      return NextResponse.json({ card });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

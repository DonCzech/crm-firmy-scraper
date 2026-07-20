import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const perPage = Math.min(100, Math.max(1, Number(searchParams.get("perPage") || 50)));
    const offset = (page - 1) * perPage;

    const countResult = await query<{ count: string }>(
      `SELECT count(*) FROM stock_movements WHERE tenant_id = $1`,
      [guard.tenant.id]
    );
    const total = Number(countResult?.[0]?.count ?? 0);

    const movements = await query<{
      id: number; variant_id: number; delta: number; qty_after: number;
      reason: string; actor_email: string | null; created_at: string;
      product_title: string; variant_label: string; sku: string | null;
    }>(
      `SELECT sm.id, sm.variant_id, sm.delta, sm.qty_after, sm.reason, sm.actor_email, sm.created_at,
        p.title AS product_title, COALESCE(pv.title, '') AS variant_label, pv.sku
       FROM stock_movements sm
       JOIN product_variants pv ON pv.id = sm.variant_id
       JOIN products p ON p.id = pv.product_id
       WHERE sm.tenant_id = $1
       ORDER BY sm.created_at DESC
       LIMIT $2 OFFSET $3`,
      [guard.tenant.id, perPage, offset]
    ) ?? [];

    return NextResponse.json({ movements, total });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

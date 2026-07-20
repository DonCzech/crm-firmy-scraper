import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { getAccount, getTransactions, earnPoints, spendPoints } from "@/lib/commerce/loyalty";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; customerId: string }> }
) {
  const { tenantSlug, customerId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "20", 10);

    const cid = Number(customerId);
    const account = await getAccount(guard.tenant.id, cid);
    const { data: transactions, total } = await getTransactions(guard.tenant.id, cid, { page, perPage });
    return NextResponse.json({ account, transactions, total });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; customerId: string }> }
) {
  const { tenantSlug, customerId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const body = await req.json();
    const { points, type, description, orderId } = body;
    const cid = Number(customerId);

    let account;
    if (points < 0) {
      account = await spendPoints(guard.tenant.id, cid, Math.abs(points), orderId ?? null, description ?? null);
    } else {
      account = await earnPoints(guard.tenant.id, cid, points, type ?? "manual", orderId ?? null, description ?? null);
    }
    return NextResponse.json({ account });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

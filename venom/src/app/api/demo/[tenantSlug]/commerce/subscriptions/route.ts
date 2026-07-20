import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { listSubscriptions, createSubscription } from "@/lib/commerce/subscriptions";

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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "20", 10);
    const status = searchParams.get("status") || undefined;
    const customer_id = searchParams.get("customer_id") || undefined;

    const { items, total } = await listSubscriptions(guard.tenant.id, {
      page, perPage,
      status: status as any,
      customer_id: customer_id ? Number(customer_id) : undefined,
    });
    return NextResponse.json({ items, total });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const body = await req.json();
    const subscription = await createSubscription(guard.tenant.id, body);
    return NextResponse.json({ subscription });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

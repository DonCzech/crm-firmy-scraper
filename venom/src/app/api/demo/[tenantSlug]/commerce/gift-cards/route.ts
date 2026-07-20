import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { listGiftCards, createGiftCard } from "@/lib/commerce/gift-cards";

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
    const isActive = searchParams.get("status") === "active" ? true : searchParams.get("status") === "disabled" ? false : undefined;
    const page = Number(searchParams.get("page") || 1);
    const perPage = Number(searchParams.get("perPage") || 20);
    const cards = await listGiftCards(guard.tenant.id, { page, perPage, is_active: isActive });
    return NextResponse.json({ cards });
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
    const card = await createGiftCard(guard.tenant.id, body);
    return NextResponse.json({ card });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

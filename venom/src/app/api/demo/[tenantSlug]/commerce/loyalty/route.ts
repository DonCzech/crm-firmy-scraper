import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { getLoyaltyStats } from "@/lib/commerce/loyalty";

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
    const stats = await getLoyaltyStats(guard.tenant.id);
    return NextResponse.json({ stats });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

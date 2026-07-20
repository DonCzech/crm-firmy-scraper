import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import {
  getAddonsOverview,
  isValidPlan,
  setAddonEnabled,
  setTenantPlan,
} from "@/lib/commerce/addons";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  try {
    const overview = await getAddonsOverview(guard.tenant.id);
    return NextResponse.json(overview);
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

  try {
    const body = await req.json();
    const action = String(body?.action ?? "");

    if (action === "activate" || action === "deactivate") {
      const slug = String(body?.slug ?? "");
      if (!slug) return NextResponse.json({ error: "Chybí slug modulu" }, { status: 400 });
      await setAddonEnabled(guard.tenant.id, slug, action === "activate");
    } else if (action === "set_plan") {
      const plan = String(body?.plan ?? "");
      if (!isValidPlan(plan)) return NextResponse.json({ error: "Neznámý tarif" }, { status: 400 });
      await setTenantPlan(guard.tenant.id, plan);
    } else {
      return NextResponse.json({ error: "Neznámá akce" }, { status: 400 });
    }

    const overview = await getAddonsOverview(guard.tenant.id);
    return NextResponse.json(overview);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

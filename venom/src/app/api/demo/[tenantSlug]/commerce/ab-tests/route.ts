import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { listABTests, createABTest } from "@/lib/commerce/ab-testing";

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
    const status = searchParams.get("status") || undefined;

    const tests = await listABTests(guard.tenant.id, status);
    return NextResponse.json({ tests });
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
    const test = await createABTest(guard.tenant.id, body);
    return NextResponse.json({ test });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

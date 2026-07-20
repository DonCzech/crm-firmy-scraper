import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { getABTest, startABTest, stopABTest, calculateSignificance } from "@/lib/commerce/ab-testing";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; testId: string }> }
) {
  const { tenantSlug, testId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const test = await getABTest(guard.tenant.id, Number(testId));
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });
    const significance = calculateSignificance(test);
    return NextResponse.json({ test, significance });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; testId: string }> }
) {
  const { tenantSlug, testId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const body = await req.json();
    const { action, winner } = body;

    let test;
    switch (action) {
      case "start":
        test = await startABTest(guard.tenant.id, Number(testId));
        break;
      case "stop":
        test = await stopABTest(guard.tenant.id, Number(testId), winner);
        break;
      default:
        return NextResponse.json({ error: "Invalid action. Use 'start' or 'stop'." }, { status: 400 });
    }
    return NextResponse.json({ test });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

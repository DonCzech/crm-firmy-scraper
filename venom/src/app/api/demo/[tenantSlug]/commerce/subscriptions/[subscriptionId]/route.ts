import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import {
  getSubscription,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from "@/lib/commerce/subscriptions";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; subscriptionId: string }> }
) {
  const { tenantSlug, subscriptionId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const sid = Number(subscriptionId);
    const subscription = await getSubscription(guard.tenant.id, sid);
    return NextResponse.json({ subscription });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; subscriptionId: string }> }
) {
  const { tenantSlug, subscriptionId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const body = await req.json();
    const { action, ...data } = body;
    const sid = Number(subscriptionId);

    let subscription;
    switch (action) {
      case "pause":
        subscription = await pauseSubscription(guard.tenant.id, sid);
        break;
      case "resume":
        subscription = await resumeSubscription(guard.tenant.id, sid);
        break;
      case "cancel":
        subscription = await cancelSubscription(guard.tenant.id, sid);
        break;
      default:
        subscription = await updateSubscription(guard.tenant.id, sid, data);
        break;
    }
    return NextResponse.json({ subscription });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

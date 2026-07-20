import { NextRequest, NextResponse } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { updateWebhook, deleteWebhook, testWebhook, getWebhookLogs } from "@/lib/commerce/webhooks";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; webhookId: string }> }
) {
  const { tenantSlug, webhookId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const logs = await getWebhookLogs(guard.tenant.id, Number(webhookId));
    return NextResponse.json({ logs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; webhookId: string }> }
) {
  const { tenantSlug, webhookId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const body = await req.json();
    if (body.action === "test") {
      const result = await testWebhook(guard.tenant.id, Number(webhookId));
      return NextResponse.json({ result });
    }
    const webhook = await updateWebhook(guard.tenant.id, Number(webhookId), body);
    return NextResponse.json({ webhook });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; webhookId: string }> }
) {
  const { tenantSlug, webhookId } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    await deleteWebhook(guard.tenant.id, Number(webhookId));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

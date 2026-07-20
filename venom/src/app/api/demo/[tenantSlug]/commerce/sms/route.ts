import { NextRequest } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { isAddonActive } from "@/lib/commerce/addons";
import { listSms, getSmsStats } from "@/lib/commerce/sms";

export const dynamic = "force-dynamic";

/** Modul „SMS upozornění“ — outbox + statistiky. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  if (!(await isAddonActive(guard.tenant.id, "sms-upozorneni"))) {
    return Response.json({ error: "Modul SMS upozornění není aktivní" }, { status: 403 });
  }

  await initCommerceDb();
  const [messages, stats] = await Promise.all([
    listSms(guard.tenant.id),
    getSmsStats(guard.tenant.id),
  ]);
  return Response.json({ messages, stats });
}

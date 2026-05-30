import { NextRequest } from "next/server";
import { getTenantBySlug, getSubscriptionByTenantId } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await context.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });

  const sub = await getSubscriptionByTenantId(tenant.id);

  return Response.json({
    slug: tenantSlug,
    sub_status: sub?.status ?? "trial",
    days_remaining: sub?.days_remaining ?? 30,
    trial_ends_at: sub?.trial_ends_at ?? null,
  });
}

import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/user-auth";
import { activateSubscription, query } from "@/lib/db";

// POST /api/account/billing/activate
// Body: { tenantSlug }
export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { tenantSlug } = await request.json();
  if (!tenantSlug) return Response.json({ error: "tenantSlug required" }, { status: 400 });

  const tenants = await query<{ id: number }>(
    "SELECT id FROM tenants WHERE slug = $1 AND user_account_id = $2",
    [tenantSlug, payload.id]
  );
  if (!tenants.length) return Response.json({ error: "Tenant not found" }, { status: 404 });

  await activateSubscription(tenants[0].id);
  return Response.json({ ok: true, message: "Předplatné aktivováno. Příští platba za 30 dní." });
}

import { NextRequest } from "next/server";
import { getTenantBySlug, query } from "@/lib/db";
import { initCommerceDb } from "@/lib/commerce/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "not found" }, { status: 404 });

  const { variantId, email } = await req.json();
  if (!variantId || !email || !email.includes("@")) {
    return Response.json({ error: "invalid data" }, { status: 400 });
  }

  await initCommerceDb();
  await query(
    `INSERT INTO commerce_stock_notifications (tenant_id, variant_id, email)
     VALUES ($1, $2, $3)
     ON CONFLICT (tenant_id, variant_id, email) DO NOTHING`,
    [tenant.id, variantId, email.toLowerCase().trim()]
  );

  return Response.json({ ok: true });
}

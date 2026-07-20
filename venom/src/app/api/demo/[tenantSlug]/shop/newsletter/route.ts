import { NextRequest } from "next/server";
import { getTenantBySlug, query } from "@/lib/db";
import { initCommerceDb } from "@/lib/commerce/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "not found" }, { status: 404 });

  const { email } = await req.json();
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return Response.json({ error: "invalid email" }, { status: 400 });
  }

  await initCommerceDb();
  await query(
    `INSERT INTO commerce_newsletter (tenant_id, email)
     VALUES ($1, $2)
     ON CONFLICT (tenant_id, email) DO UPDATE SET subscribed_at = now()`,
    [tenant.id, email.toLowerCase().trim()]
  );

  return Response.json({ ok: true });
}

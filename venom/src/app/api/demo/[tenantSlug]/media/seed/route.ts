import { NextRequest } from "next/server";
import { query, getTenantBySlug } from "@/lib/db";
import { requireTenantAdmin } from "@/lib/demo-auth";
import { seedDemoMedia } from "@/lib/seed-demo-media";

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

const DEMO_FOLDER = "Demo obrázky";

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const force = new URL(req.url).searchParams.get("force") === "1";

  const authResult = await requireTenantAdmin(tenantSlug);
  const tenant = authResult.tenant ?? await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!authResult.ok && process.env.NODE_ENV === "production") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (force) {
    // Remove existing demo rows so seedDemoMedia re-inserts them
    await query(
      `DELETE FROM media WHERE tenant_id = $1 AND folder = $2`,
      [tenant.id, DEMO_FOLDER]
    );
  }

  const { count } = await seedDemoMedia(tenant.id);
  return Response.json({ ok: true, seeded: count > 0, count });
}

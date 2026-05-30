import { NextRequest } from "next/server";
import { createDemoTenantFromTemplate } from "@/lib/tenant-factory";

// POST /api/admin/seed-barber
// Seeds a barber-01 demo tenant for preview/testing.
// Protected by SETUP_SECRET to prevent abuse.
export async function POST(req: NextRequest) {
  const { secret, slug } = await req.json().catch(() => ({}));

  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret || secret !== setupSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const tenantSlug = (slug as string | undefined) ?? "demo-barber";

  try {
    const result = await createDemoTenantFromTemplate({
      email: `${tenantSlug}@demo.local`,
      templateKey: "barber-01",
      industry: "barber",
      slug: tenantSlug,
    });
    return Response.json({ ok: true, ...result }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}

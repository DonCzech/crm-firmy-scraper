import { NextRequest } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { isAddonActive } from "@/lib/commerce/addons";
import { runSeoAudit, getLatestSeoAudit } from "@/lib/commerce/seo-audit";

export const dynamic = "force-dynamic";

/** Modul „Pokročilé SEO" — GET poslední report, POST spustí nový audit. */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

async function gate(req: NextRequest, tenantSlug: string) {
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return { response: guard.response };
  if (!(await isAddonActive(guard.tenant.id, "pokrocile-seo"))) {
    return { response: Response.json({ error: "Modul Pokročilé SEO není aktivní" }, { status: 403 }) };
  }
  return { guard };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const g = await gate(req, tenantSlug);
  if (!g.guard) return g.response;
  const report = await getLatestSeoAudit(g.guard.tenant.id);
  return Response.json({ report });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const g = await gate(req, tenantSlug);
  if (!g.guard) return g.response;
  const report = await runSeoAudit(g.guard.tenant.id);
  return Response.json({ report });
}

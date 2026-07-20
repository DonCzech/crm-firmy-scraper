import { NextRequest } from "next/server";
import { z } from "zod";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { restoreSnapshot } from "@/lib/ai-designer/apply";
import { revalidatePath } from "next/cache";

/**
 * POST /api/demo/<slug>/ai/designer/undo — vrátí web do stavu před daným
 * AI požadavkem (obnoví snapshot overrides, sekcí a vlastního kódu).
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const BodySchema = z.object({ requestId: z.number().int().positive() });

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Neplatná data" }, { status: 422 });

  const restored = await restoreSnapshot(tenant.id, parsed.data.requestId);
  if (!restored) {
    return Response.json({ error: "Snapshot nenalezen nebo už byl obnoven" }, { status: 404 });
  }

  revalidatePath(`/demo/${tenantSlug}`);
  return Response.json({ ok: true });
}

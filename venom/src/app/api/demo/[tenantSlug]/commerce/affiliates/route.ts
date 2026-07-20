import { NextRequest } from "next/server";
import { z } from "zod";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { isAddonActive } from "@/lib/commerce/addons";
import {
  listAffiliates, listConversions, createAffiliate, updateAffiliate,
  deleteAffiliate, updateConversionStatus,
} from "@/lib/commerce/affiliates";

export const dynamic = "force-dynamic";

/** Modul „Provizní systém" — správa partnerů + konverzí. */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

async function gate(req: NextRequest, tenantSlug: string) {
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return { response: guard.response };
  if (!(await isAddonActive(guard.tenant.id, "provizni-system"))) {
    return { response: Response.json({ error: "Modul Provizní systém není aktivní" }, { status: 403 }) };
  }
  return { guard };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const g = await gate(req, tenantSlug);
  if (!g.guard) return g.response;
  const tenantId = g.guard.tenant.id;

  const [affiliates, conversions] = await Promise.all([
    listAffiliates(tenantId),
    listConversions(tenantId),
  ]);
  return Response.json({ affiliates, conversions });
}

const BodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    name: z.string().min(2).max(120),
    email: z.string().email().optional().or(z.literal("")),
    code: z.string().max(24).optional(),
    commission_pct: z.number().min(0).max(50),
  }),
  z.object({
    action: z.literal("update"),
    id: z.number().int().positive(),
    status: z.enum(["active", "paused"]).optional(),
    commission_pct: z.number().min(0).max(50).optional(),
  }),
  z.object({ action: z.literal("delete"), id: z.number().int().positive() }),
  z.object({
    action: z.literal("conversion-status"),
    id: z.number().int().positive(),
    status: z.enum(["pending", "approved", "paid", "rejected"]),
  }),
]);

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const g = await gate(req, tenantSlug);
  if (!g.guard) return g.response;
  const tenantId = g.guard.tenant.id;

  const body = await parseJsonBody(req);
  if (body === null) return jsonError("Neplatný JSON");
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Neplatná data");
  const data = parsed.data;

  switch (data.action) {
    case "create": {
      const result = await createAffiliate(tenantId, {
        name: data.name, email: data.email || null, code: data.code, commission_pct: data.commission_pct,
      });
      if ("error" in result) return jsonError(result.error);
      return Response.json({ ok: true, ...result });
    }
    case "update": {
      const ok = await updateAffiliate(tenantId, data.id, { status: data.status, commission_pct: data.commission_pct });
      if (!ok) return jsonError("Partner nenalezen", 404);
      return Response.json({ ok: true });
    }
    case "delete": {
      const ok = await deleteAffiliate(tenantId, data.id);
      if (!ok) return jsonError("Partner nenalezen", 404);
      return Response.json({ ok: true });
    }
    case "conversion-status": {
      const ok = await updateConversionStatus(tenantId, data.id, data.status);
      if (!ok) return jsonError("Konverze nenalezena", 404);
      return Response.json({ ok: true });
    }
  }
}

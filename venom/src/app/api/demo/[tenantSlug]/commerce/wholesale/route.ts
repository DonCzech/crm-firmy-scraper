import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { isAddonActive } from "@/lib/commerce/addons";
import {
  listWholesalePartners,
  createWholesalePartner,
  updateWholesalePartner,
  deleteWholesalePartner,
} from "@/lib/commerce/wholesale";

/** Modul „Velkoobchod (B2B)" — admin API pro správu partnerů. */
export const dynamic = "force-dynamic";

interface Ctx { params: Promise<{ tenantSlug: string }> }

async function gate(req: NextRequest, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return { response: guard.response };
  if (!(await isAddonActive(guard.tenant.id, "velkoobchod"))) {
    return { response: jsonError("Modul Velkoobchod není aktivní", 403) };
  }
  return { tenant: guard.tenant };
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const g = await gate(req, ctx);
  if ("response" in g) return g.response;
  return NextResponse.json({ partners: await listWholesalePartners(g.tenant.id) });
}

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    email: z.string().trim().email(),
    company: z.string().trim().min(2).max(160),
    ico: z.string().trim().max(20).optional(),
    discount_pct: z.number().min(0).max(60),
  }),
  z.object({
    action: z.literal("update"),
    id: z.number().int().positive(),
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    discount_pct: z.number().min(0).max(60).optional(),
  }),
  z.object({ action: z.literal("delete"), id: z.number().int().positive() }),
]);

export async function POST(req: NextRequest, ctx: Ctx) {
  const g = await gate(req, ctx);
  if ("response" in g) return g.response;

  const parsed = bodySchema.safeParse(await parseJsonBody(req));
  if (!parsed.success) return jsonError("Neplatný požadavek");
  const data = parsed.data;

  if (data.action === "create") {
    const res = await createWholesalePartner(g.tenant.id, data);
    if ("error" in res) return jsonError(res.error);
    return NextResponse.json({ ok: true, id: res.id });
  }

  if (data.action === "update") {
    const ok = await updateWholesalePartner(g.tenant.id, data.id, { status: data.status, discount_pct: data.discount_pct });
    if (!ok) return jsonError("Partner nenalezen", 404);
    return NextResponse.json({ ok: true });
  }

  const ok = await deleteWholesalePartner(g.tenant.id, data.id);
  if (!ok) return jsonError("Partner nenalezen", 404);
  return NextResponse.json({ ok: true });
}

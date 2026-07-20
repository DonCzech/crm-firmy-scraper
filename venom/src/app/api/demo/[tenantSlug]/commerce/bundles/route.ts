import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { isAddonActive } from "@/lib/commerce/addons";
import { listBundles, createBundle, updateBundleStatus, deleteBundle } from "@/lib/commerce/bundles";
import { query } from "@/lib/db";

/** Modul „Sady produktů" — admin API pro správu bundlů. */
export const dynamic = "force-dynamic";

interface Ctx { params: Promise<{ tenantSlug: string }> }

async function gate(req: NextRequest, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return { response: guard.response };
  if (!(await isAddonActive(guard.tenant.id, "sady-produktu"))) {
    return { response: jsonError("Modul Sady produktů není aktivní", 403) };
  }
  return { tenant: guard.tenant };
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const g = await gate(req, ctx);
  if ("response" in g) return g.response;

  const [bundles, variants] = await Promise.all([
    listBundles(g.tenant.id),
    query<{ variant_id: number; product_title: string; variant_title: string | null; sku: string | null; price_cents: number }>(
      `SELECT pv.id AS variant_id, p.title AS product_title, pv.title AS variant_title, pv.sku, pv.price_cents
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       WHERE p.tenant_id = $1 AND p.status = 'active'
       ORDER BY p.title, pv.id`,
      [g.tenant.id]
    ),
  ]);
  return NextResponse.json({ bundles, variants });
}

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    name: z.string().trim().min(2).max(120),
    discount_pct: z.number().min(1).max(50),
    items: z.array(z.object({ variant_id: z.number().int().positive(), qty: z.number().int().min(1).max(20) })).min(2).max(10),
  }),
  z.object({ action: z.literal("status"), id: z.number().int().positive(), status: z.enum(["active", "paused"]) }),
  z.object({ action: z.literal("delete"), id: z.number().int().positive() }),
]);

export async function POST(req: NextRequest, ctx: Ctx) {
  const g = await gate(req, ctx);
  if ("response" in g) return g.response;

  const parsed = bodySchema.safeParse(await parseJsonBody(req));
  if (!parsed.success) return jsonError("Neplatný požadavek");
  const data = parsed.data;

  if (data.action === "create") {
    const res = await createBundle(g.tenant.id, { name: data.name, discount_pct: data.discount_pct, items: data.items });
    if ("error" in res) return jsonError(res.error);
    return NextResponse.json({ ok: true, id: res.id });
  }

  if (data.action === "status") {
    const ok = await updateBundleStatus(g.tenant.id, data.id, data.status);
    if (!ok) return jsonError("Sada nenalezena", 404);
    return NextResponse.json({ ok: true });
  }

  const ok = await deleteBundle(g.tenant.id, data.id);
  if (!ok) return jsonError("Sada nenalezena", 404);
  return NextResponse.json({ ok: true });
}

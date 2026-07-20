import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { query } from "@/lib/db";
import { getSearchStats, clearSearchStats } from "@/lib/commerce/search";
import { normalizeSearchSettings, readSearchSettings, type SearchSettings } from "@/lib/commerce/search-settings";
import { getShopByTenantId, updateShop } from "@/lib/commerce/shop";

export const dynamic = "force-dynamic";

interface RouteParams { params: Promise<{ tenantSlug: string }> }

interface BoostedProduct { id: number; title: string; image_url: string | null }

async function getBoostedProducts(tenantId: number, ids: number[]): Promise<BoostedProduct[]> {
  if (!ids.length) return [];
  const rows = await query<BoostedProduct>(
    `SELECT p.id, p.title,
            (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
     FROM products p WHERE p.tenant_id = $1 AND p.id = ANY($2::int[])`,
    [tenantId, ids]
  );
  // Zachovat pořadí dle nastavení
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter((r): r is BoostedProduct => !!r);
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const shop = await getShopByTenantId(guard.tenant.id);
    if (!shop) return jsonError("Obchod není aktivní", 404);
    const settings = readSearchSettings(shop);
    const [stats, boosted] = await Promise.all([
      getSearchStats(guard.tenant.id),
      getBoostedProducts(guard.tenant.id, settings.boosted_product_ids),
    ]);
    return NextResponse.json({ settings, stats, boosted });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Chyba" }, { status: 400 });
  }
}

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("settings"),
    settings: z.object({
      min_chars: z.number().int().min(1).max(4),
      typo_tolerance: z.boolean(),
      max_products: z.number().int().min(3).max(12),
      show_phrases: z.boolean(),
      show_categories: z.boolean(),
      show_brands: z.boolean(),
      synonyms: z.array(z.array(z.string().max(40))).max(100),
      boosted_product_ids: z.array(z.number().int().positive()).max(50),
    }),
  }),
  z.object({ action: z.literal("clear_stats") }),
]);

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  const body = await parseJsonBody(req);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Neplatný požadavek");

  try {
    if (parsed.data.action === "clear_stats") {
      await clearSearchStats(guard.tenant.id);
      return NextResponse.json({ ok: true });
    }

    const shop = await getShopByTenantId(guard.tenant.id);
    if (!shop) return jsonError("Obchod není aktivní", 404);
    const next: SearchSettings = normalizeSearchSettings(parsed.data.settings);
    await updateShop(guard.tenant.id, {
      settings: { ...(shop.settings as Record<string, unknown>), search: next },
    });
    return NextResponse.json({ ok: true, settings: next });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Chyba" }, { status: 400 });
  }
}

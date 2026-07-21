import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { getShopByTenantId, updateShop } from "@/lib/commerce/shop";
import { fetchCategoryTree } from "@/lib/commerce/section-data";
import {
  normalizeMegaMenuSettings,
  readMegaMenuSettings,
  type MegaMenuSettings,
} from "@/lib/commerce/menu-settings";

export const dynamic = "force-dynamic";

interface RouteParams { params: Promise<{ tenantSlug: string }> }

/**
 * Správa megamenu storefrontu: GET vrací nastavení + strom kategorií pro
 * editor, POST ukládá nastavení do shops.settings.megamenu. Kategorie samotné
 * (strom, pořadí, fotky, viditelnost) se spravují v záložce Kategorie.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const shop = await getShopByTenantId(guard.tenant.id);
    if (!shop) return jsonError("Obchod není aktivní", 404);
    const [settings, tree] = await Promise.all([
      Promise.resolve(readMegaMenuSettings(shop)),
      fetchCategoryTree(guard.tenant.id),
    ]);
    return NextResponse.json({ settings, tree });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Chyba" }, { status: 400 });
  }
}

const toneSchema = z.enum(["accent", "danger", "success", "neutral"]);

const bodySchema = z.object({
  settings: z.object({
    hidden_category_ids: z.array(z.number().int().positive()).max(200),
    badges: z.array(z.object({
      category_id: z.number().int().positive(),
      text: z.string().min(1).max(24),
      tone: toneSchema,
    })).max(40),
    promos: z.array(z.object({
      id: z.string().max(40).optional(),
      category_slug: z.string().max(80).nullable(),
      image_url: z.string().max(500),
      title: z.string().max(80),
      subtitle: z.string().max(140),
      href: z.string().max(500),
    })).max(30),
    custom_links: z.array(z.object({
      label: z.string().min(1).max(40),
      href: z.string().min(1).max(500),
      tone: toneSchema,
    })).max(12),
    show_counts: z.boolean(),
    show_images: z.boolean(),
    max_depth: z.number().int().min(2).max(3),
  }),
});

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  const body = await parseJsonBody(req);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return jsonError("Neplatný požadavek");

  try {
    const shop = await getShopByTenantId(guard.tenant.id);
    if (!shop) return jsonError("Obchod není aktivní", 404);
    const next: MegaMenuSettings = normalizeMegaMenuSettings(parsed.data.settings);
    await updateShop(guard.tenant.id, {
      settings: { ...(shop.settings as Record<string, unknown>), megamenu: next },
    });
    return NextResponse.json({ ok: true, settings: next });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Chyba" }, { status: 400 });
  }
}

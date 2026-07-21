import { NextRequest } from "next/server";
import { getTenantBySlug, type Tenant } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import type { Shop } from "@/lib/commerce/types";
import { isAddonActive } from "@/lib/commerce/addons";
import { getSearchSuggestions, getTopSearchData, logSearchQuery, logSuggestQuery } from "@/lib/commerce/search";
import { readSearchSettings, DEFAULT_SEARCH_SETTINGS, type SearchSettings } from "@/lib/commerce/search-settings";

export const dynamic = "force-dynamic";

const EMPTY = { phrases: [], categories: [], brands: [], products: [] };

/**
 * Statická „identita" e-shopu pro našeptávač: tenant + aktivace modulu + shop +
 * odvozené SearchSettings. Nemění se mezi stisky kláves, takže ji cachujeme
 * v paměti procesu — bez toho každý keystroke zaplatí 3 sériové round-tripy do
 * Neonu (tenant → addon → shop) ještě NEŽ začne samotné hledání. To byl hlavní
 * důvod „pomalého" našeptávače; vlastní SQL běží ~0,3 ms. TTL je krátké, aby se
 * změna nastavení/aktivace projevila do minuty. Produkty se čtou vždy živě.
 */
interface ShopSearchContext {
  tenant: Tenant;
  active: boolean;
  shop: Shop | null;
  settings: SearchSettings;
}
const CTX_TTL_MS = 60_000;
const ctxCache = new Map<string, { exp: number; ctx: ShopSearchContext | null }>();

async function resolveShopContext(tenantSlug: string): Promise<ShopSearchContext | null> {
  const hit = ctxCache.get(tenantSlug);
  if (hit && hit.exp > Date.now()) return hit.ctx;

  const tenant = await getTenantBySlug(tenantSlug);
  let ctx: ShopSearchContext | null = null;
  if (tenant) {
    // addon aktivace a shop potřebují jen tenant.id → paralelně (ne sériově)
    const [active, shop] = await Promise.all([
      isAddonActive(tenant.id, "chytre-vyhledavani"),
      getShopByTenantId(tenant.id),
    ]);
    ctx = { tenant, active, shop, settings: shop ? readSearchSettings(shop) : DEFAULT_SEARCH_SETTINGS };
  }
  ctxCache.set(tenantSlug, { exp: Date.now() + CTX_TTL_MS, ctx });
  return ctx;
}

/**
 * Našeptávač ve stylu Luigi's Box: s dotazem vrací návrhy, bez dotazu „top" obsah.
 * Modul chytre-vyhledavani: bez aktivace vrací prázdno (input degraduje na
 * obyčejné hledání přes ?q=), s aktivací řídí chování SearchSettings.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const ctx = await resolveShopContext(tenantSlug);
  if (!ctx) return Response.json(EMPTY);
  if (!ctx.active) return Response.json({ ...EMPTY, mode: "off" });
  if (!ctx.shop) return Response.json(EMPTY);

  const { tenant, settings } = ctx;
  const hasQuery = q.length >= settings.min_chars;
  const data = hasQuery
    ? await getSearchSuggestions(tenant.id, q, settings)
    : await getTopSearchData(tenant.id);

  // Statistiky: každý dotaz našeptávače + počet výsledků (mimo kritickou cestu)
  if (hasQuery) {
    const resultsCount = data.products.length + data.categories.length + data.brands.length;
    logSuggestQuery(tenant.id, q, resultsCount).catch((e) => console.error("[search] log failed:", e));
  }

  return Response.json({ ...data, mode: hasQuery ? "query" : "top" });
}

/** Log „potvrzeného" hledání (klik na výsledek / Enter) — plní nejhledanější fráze. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ ok: false }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const q = typeof (body as { q?: unknown }).q === "string" ? (body as { q: string }).q : "";
  if (q.trim().length >= 2) await logSearchQuery(tenant.id, q);
  return Response.json({ ok: true });
}

import { NextRequest } from "next/server";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { isAddonActive } from "@/lib/commerce/addons";
import { getSearchSuggestions, getTopSearchData, logSearchQuery, logSuggestQuery } from "@/lib/commerce/search";
import { readSearchSettings } from "@/lib/commerce/search-settings";

export const dynamic = "force-dynamic";

const EMPTY = { phrases: [], categories: [], brands: [], products: [] };

/**
 * Našeptávač ve stylu Luigi's Box: s dotazem vrací návrhy, bez dotazu „top" obsah.
 * Modul chytre-vyhledavani: bez aktivace vrací prázdno (input degraduje na
 * obyčejné hledání přes ?q=), s aktivací řídí chování SearchSettings.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json(EMPTY);
  if (!(await isAddonActive(tenant.id, "chytre-vyhledavani"))) {
    return Response.json({ ...EMPTY, mode: "off" });
  }
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return Response.json(EMPTY);

  const settings = readSearchSettings(shop);
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

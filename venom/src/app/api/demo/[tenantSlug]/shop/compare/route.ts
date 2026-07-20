import { NextRequest, NextResponse } from "next/server";
import { getTenantBySlug, query } from "@/lib/db";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { getProductParams } from "@/lib/commerce/params";

/** Modul „Porovnávač produktů“ — data pro /obchod/porovnani (max 4 sluggy). */
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return NextResponse.json({ error: "Tenant nenalezen" }, { status: 404 });

  const active = await getActiveAddonSlugs(tenant.id);
  if (!active.has("porovnavac")) {
    return NextResponse.json({ error: "Modul Porovnávač není aktivní" }, { status: 403 });
  }

  const slugs = (req.nextUrl.searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (!slugs.length) return NextResponse.json({ products: [] });

  const rows = await query<{
    id: number; slug: string; title: string; brand: string | null;
    price_cents: number; image_url: string | null;
  }>(
    `SELECT p.id, p.slug, p.title, p.brand,
            COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
            (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
     FROM products p
     WHERE p.tenant_id = $1 AND p.status = 'active' AND p.slug = ANY($2)`,
    [tenant.id, slugs]
  );

  const products = await Promise.all(
    rows.map(async (p) => ({
      ...p,
      params: await getProductParams(tenant.id, p.id).catch(() => []),
    }))
  );

  // Zachovat pořadí, v jakém uživatel produkty přidal
  products.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
  return NextResponse.json({ products });
}

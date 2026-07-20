import { NextRequest } from "next/server";
import { getTenantBySlug } from "@/lib/db";
import { listCategories } from "@/lib/commerce/categories";

/**
 * Public storefront API — strom kategorií obchodu.
 * Používá eshop-05 navbar (content.categoriesSource === "shop"): mega menu
 * se pak řídí kategoriemi spravovanými v administraci (Obchod → Kategorie)
 * místo statického obsahu šablony.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });

  const categories = await listCategories(tenant.id);
  return Response.json({
    categories: categories
      .filter((c) => c.is_visible)
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        parent_id: c.parent_id,
        product_count: c.product_count,
        image_url: c.image_url ?? null,
      })),
  });
}

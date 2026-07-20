import { listCategories } from "@/lib/commerce/categories";
import { getUniqueBrands } from "@/lib/commerce/products";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { ShopHeader } from "./ShopHeader";
import { AffiliateTracker } from "./AffiliateTracker";
import { getTemplateChromeKey, TemplateShopHeader } from "./TemplateShopChrome";

interface Props {
  tenantId: number;
  tenantSlug: string;
  shopName: string;
  activeCategory?: string | null;
}

/** Server wrapper: načte kategorie + značky a vyrenderuje e-shop header. */
export async function ShopHeaderServer({ tenantId, tenantSlug, shopName, activeCategory = null }: Props) {
  const [categories, brands, addons, chromeKey] = await Promise.all([
    listCategories(tenantId),
    getUniqueBrands(tenantId),
    getActiveAddonSlugs(tenantId),
    getTemplateChromeKey(tenantId),
  ]);

  // Šablony s vlastním chrome (eshop-02+) → navbar šablony místo sdíleného headeru
  if (chromeKey) {
    return (
      <>
        {addons.has("provizni-system") && <AffiliateTracker tenantSlug={tenantSlug} />}
        <TemplateShopHeader tenantId={tenantId} tenantSlug={tenantSlug} />
      </>
    );
  }

  return (
    <>
    {addons.has("provizni-system") && <AffiliateTracker tenantSlug={tenantSlug} />}
    <ShopHeader
      tenantSlug={tenantSlug}
      shopName={shopName}
      categories={categories.filter((c) => c.is_visible).map((c) => ({
        id: c.id, slug: c.slug, name: c.name, parent_id: c.parent_id, product_count: c.product_count, image_url: c.image_url,
      }))}
      brands={brands}
      activeCategory={activeCategory}
      currencySwitcher={addons.has("cizi-meny")}
      localeSwitcher={addons.has("cizi-jazyky")}
    />
    </>
  );
}

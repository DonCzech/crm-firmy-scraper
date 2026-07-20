import { listCategories } from "@/lib/commerce/categories";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { buildFooterModuleLinks } from "./footerModuleLinks";
import { ShopFooter } from "./ShopFooter";
import { getTemplateChromeKey, TemplateShopFooter } from "./TemplateShopChrome";

interface Props {
  tenantId: number;
  tenantSlug: string;
  shopName: string;
}

/** Server wrapper: načte top-level kategorie a vyrenderuje e-shop footer. */
export async function ShopFooterServer({ tenantId, tenantSlug, shopName }: Props) {
  const [categories, addons, chromeKey] = await Promise.all([
    listCategories(tenantId),
    getActiveAddonSlugs(tenantId),
    getTemplateChromeKey(tenantId),
  ]);

  // Šablony s vlastním chrome (eshop-02+) → footer šablony místo sdíleného
  if (chromeKey) {
    return <TemplateShopFooter tenantId={tenantId} tenantSlug={tenantSlug} />;
  }

  return (
    <ShopFooter
      tenantSlug={tenantSlug}
      shopName={shopName}
      categories={categories
        .filter((c) => c.is_visible && !c.parent_id)
        .map((c) => ({ slug: c.slug, name: c.name }))}
      moduleLinks={buildFooterModuleLinks(addons, tenantSlug)}
      whatsapp={addons.has("whatsapp-chat")}
    />
  );
}

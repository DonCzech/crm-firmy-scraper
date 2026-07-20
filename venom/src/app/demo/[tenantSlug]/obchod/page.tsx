import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getTenantBySlug, query } from "@/lib/db";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { getDisplayFx, parseDisplayCurrency, convertCents, FX_COOKIE_PREFIX } from "@/lib/commerce/currency";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { listCategories } from "@/lib/commerce/categories";
import { listProducts, getUniqueBrands } from "@/lib/commerce/products";
import { getCategoryBySlug } from "@/lib/commerce/categories";
import { getFilterableParams } from "@/lib/commerce/params";
import { CartToast } from "@/components/storefront/CartToast";
import { ProductListing } from "@/components/storefront/ProductListing";
import { Eshop05Listing } from "@/components/storefront/Eshop05Listing";
import { Eshop06Listing } from "@/components/storefront/Eshop06Listing";
import { Eshop07Listing } from "@/components/storefront/Eshop07Listing";
import { Eshop08Listing } from "@/components/storefront/Eshop08Listing";
import { Eshop09Listing } from "@/components/storefront/Eshop09Listing";
import { Eshop10Listing } from "@/components/storefront/Eshop10Listing";
import { Eshop11Listing } from "@/components/storefront/Eshop11Listing";
import { Eshop12Listing } from "@/components/storefront/Eshop12Listing";
import { Eshop13Listing } from "@/components/storefront/Eshop13Listing";
import { Eshop14Listing } from "@/components/storefront/Eshop14Listing";
import { Eshop15Listing } from "@/components/storefront/Eshop15Listing";
import { Eshop16Listing } from "@/components/storefront/Eshop16Listing";
import { Eshop20Listing } from "@/components/storefront/Eshop20Listing";
import { Eshop17Listing } from "@/components/storefront/Eshop17Listing";
import { Eshop18Listing } from "@/components/storefront/Eshop18Listing";
import { Eshop19Listing } from "@/components/storefront/Eshop19Listing";
import { CookieConsent } from "@/components/storefront/CookieConsent";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ShopFooter } from "@/components/storefront/ShopFooter";
import { getTemplateChromeKey, TemplateShopHeader, TemplateShopFooter } from "@/components/storefront/TemplateShopChrome";
import { buildFooterModuleLinks } from "@/components/storefront/footerModuleLinks";
import { ShopHomepage } from "@/components/storefront/ShopHomepage";
import { getTranslationsMap } from "@/lib/commerce/translations";
import { expandQuerySynonyms, readSearchSettings } from "@/lib/commerce/search-settings";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ kategorie?: string; strana?: string; znacka?: string; q?: string; vse?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  const shop = await getShopByTenantId(tenant.id);
  return {
    title: shop?.name ? `Obchod — ${shop.name}` : "Obchod",
    robots: tenant.status === "demo" ? { index: false } : undefined,
  };
}

async function StorefrontListingPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const { kategorie, strana, znacka, q, vse } = await searchParams;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return notFound();

  const isHomepage = !kategorie && !znacka && !q && !strana && !vse;

  const category = kategorie ? await getCategoryBySlug(tenant.id, kategorie) : null;
  const page = Math.max(1, parseInt(strana ?? "1", 10) || 1);

  const [addons, chromeKey] = await Promise.all([
    getActiveAddonSlugs(tenant.id),
    getTemplateChromeKey(tenant.id),
  ]);

  // Modul cizi-meny: zobrazovací měna dle cookie + reálný kurz ČNB
  const cookieStore = await cookies();
  const fx = addons.has("cizi-meny")
    ? await getDisplayFx(parseDisplayCurrency(cookieStore.get(`${FX_COOKIE_PREFIX}${tenantSlug}`)?.value))
    : { currency: "CZK" as const, rate_czk: 1 };
  const displayCurrency = fx.currency === "CZK" ? shop.currency : fx.currency;

  const [categories, { items, total, perPage }, filterableParamsRaw, brandsRaw] = await Promise.all([
    listCategories(tenant.id),
    listProducts(tenant.id, {
      status: "active",
      categoryId: category?.id,
      includeDescendants: true,
      brand: znacka || undefined,
      search: q || undefined,
      // Modul chytre-vyhledavani: dotaz rozšíříme o synonyma z nastavení
      searchAlternatives:
        q && addons.has("chytre-vyhledavani")
          ? expandQuerySynonyms(q, readSearchSettings(shop).synonyms)
          : undefined,
      page,
      perPage: isHomepage ? 100 : 24,
      sort: "updated",
    }),
    getFilterableParams(tenant.id).catch(() => []),
    getUniqueBrands(tenant.id),
  ]);

  // Moduly filtry-vyrobcu / parametricke-filtry řídí dostupnost filtrů
  const brands = addons.has("filtry-vyrobcu") ? brandsRaw : [];
  const filterableParams = addons.has("parametricke-filtry") ? filterableParamsRaw : [];

  // Modul top-10: nejprodávanější podle skutečných objednávek za 30 dní
  let bestsellerIds: number[] = [];
  if (addons.has("top-10") && isHomepage) {
    const rows = await query<{ product_id: number }>(
      `SELECT oi.product_id
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE oi.tenant_id = $1 AND oi.product_id IS NOT NULL AND o.created_at > now() - interval '30 days'
       GROUP BY oi.product_id
       ORDER BY SUM(oi.qty) DESC LIMIT 10`,
      [tenant.id]
    ).catch(() => []);
    bestsellerIds = rows.map((r) => r.product_id);
  }

  // Modul cizi-jazyky: přeložené titulky produktů a názvy kategorií dle cookie jazyka
  const locale = cookieStore.get(`webero_locale_${tenantSlug}`)?.value ?? "cs";
  if (addons.has("cizi-jazyky") && locale !== "cs") {
    const [productT, categoryT] = await Promise.all([
      getTranslationsMap(tenant.id, "product", items.map((p) => p.id), locale),
      getTranslationsMap(tenant.id, "category", categories.map((c) => c.id), locale),
    ]);
    for (const p of items) {
      const t = productT.get(p.id);
      if (t?.title) p.title = t.title;
      if (t?.subtitle) p.subtitle = t.subtitle;
    }
    for (const c of categories) {
      const t = categoryT.get(c.id);
      if (t?.name) c.name = t.name;
      if (t?.description) c.description = t.description;
    }
  }

  // eshop-08 (bonami): DO KOŠÍKU přímo z listingu potřebuje default variant id
  const defaultVariantIds = new Map<number, number>();
  if ((chromeKey === "eshop-08" || chromeKey === "eshop-09" || chromeKey === "eshop-12" || chromeKey === "eshop-14" || chromeKey === "eshop-15" || chromeKey === "eshop-16" || chromeKey === "eshop-18" || chromeKey === "eshop-19" || chromeKey === "eshop-20") && items.length) {
    const rows = await query<{ product_id: number; id: number }>(
      `SELECT DISTINCT ON (product_id) product_id, id FROM product_variants
       WHERE tenant_id = $1 AND product_id = ANY($2::int[])
       ORDER BY product_id, is_default DESC, id`,
      [tenant.id, items.map((p) => p.id)]
    ).catch(() => []);
    for (const r of rows) defaultVariantIds.set(r.product_id, r.id);
  }

  const visibleCategories = categories.filter((c) => c.is_visible);
  const pages = Math.max(1, Math.ceil(total / perPage));
  const basePath = `/demo/${tenantSlug}/obchod`;

  const headerCategories = visibleCategories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    parent_id: c.parent_id,
    product_count: c.product_count,
    image_url: c.image_url,
    description: c.description,
  }));

  return (
    <div className="bg-white">
      {chromeKey ? (
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
      ) : (
        <ShopHeader
          tenantSlug={tenantSlug}
          shopName={shop.name || "Obchod"}
          categories={headerCategories}
          brands={brands}
          activeCategory={kategorie ?? null}
          currencySwitcher={addons.has("cizi-meny")}
          localeSwitcher={addons.has("cizi-jazyky")}
        />
      )}
      <main className="min-h-screen bg-white text-[#111]">
        {(() => {
          // eshop-09: doplňkové služby košíku (skrytá kategorie) nepatří do katalogu
          const listItems = (chromeKey === "eshop-09" || chromeKey === "eshop-20") ? items.filter((p) => !p.slug.startsWith("sluzba-")) : items;
          const mappedItems = listItems.map((p) => {
            let flags: Record<string, boolean> = {};
            try { flags = JSON.parse(p.flags || "{}"); } catch { /* noop */ }
            return {
              id: p.id,
              slug: p.slug,
              title: p.title,
              subtitle: p.subtitle,
              brand: p.brand,
              image_url: p.image_url,
              price_min_cents: convertCents(p.price_min_cents, fx),
              price_max_cents: convertCents(p.price_max_cents, fx),
              compare_at_max_cents: p.compare_at_max_cents == null ? p.compare_at_max_cents : convertCents(p.compare_at_max_cents, fx),
              stock_total: p.stock_total,
              is_new: addons.has("stitky-v-obrazku") && !!flags.new,
              is_sale: addons.has("stitky-v-obrazku") && !!flags.sale,
              is_featured: !!flags.featured,
            };
          });

          // eshop-05 (pompo): žádná generická shop homepage — rovnou katalog
          // s dlaždicemi kategorií a Nejprodávanějšími (pompo nemá mezistránku)
          // eshop-06 (svetplodu): rovnou katalog s banner headerem, bez mezistránky
          if (isHomepage && chromeKey === "eshop-06") {
            return (
              <div className="mx-auto max-w-[1320px] px-6 py-2">
                <Eshop06Listing
                  items={mappedItems}
                  categories={headerCategories}
                  activeCategory={null}
                  basePath={basePath}
                  currency={displayCurrency}
                  shopName={shop.name}
                  total={total}
                  page={page}
                  pages={pages}
                  filterableParams={filterableParams.map((p) => ({
                    id: p.id, slug: p.slug, name: p.name, type: p.type, unit: p.unit, values: p.values,
                  }))}
                  initialBrand={null}
                  initialQuery={null}
                />
              </div>
            );
          }

          // eshop-08 (bonami): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-08") {
            return (
              <div className="mx-auto max-w-[1360px] px-6 pb-10">
                <Eshop08Listing
                  items={mappedItems.map((m) => ({ ...m, default_variant_id: defaultVariantIds.get(m.id) ?? null }))}
                  categories={headerCategories}
                  activeCategory={kategorie ?? null}
                  basePath={basePath}
                  currency={displayCurrency}
                  shopName={shop.name}
                  total={total}
                  page={page}
                  pages={pages}
                  initialBrand={znacka ?? null}
                  initialQuery={q ?? null}
                />
              </div>
            );
          }

          // eshop-10 (BOTIQ): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-10") {
            return (
              <div className="mx-auto max-w-[1460px] px-6 pb-10">
                <Eshop10Listing
                  items={mappedItems}
                  categories={headerCategories}
                  activeCategory={kategorie ?? null}
                  basePath={basePath}
                  currency={displayCurrency}
                  shopName={shop.name}
                  total={total}
                  page={page}
                  pages={pages}
                  initialBrand={znacka ?? null}
                  initialQuery={q ?? null}
                />
              </div>
            );
          }

          // eshop-19 (Grunt, dek.cz DNA): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-19") {
            const es19Items = listItems.map((p) => {
              let flags: Record<string, unknown> = {};
              try { flags = JSON.parse(p.flags || "{}"); } catch { /* noop */ }
              return {
                id: p.id,
                slug: p.slug,
                title: p.title,
                subtitle: p.subtitle,
                brand: p.brand,
                image_url: p.image_url,
                price_min_cents: convertCents(p.price_min_cents, fx),
                compare_at_max_cents: p.compare_at_max_cents == null ? null : convertCents(p.compare_at_max_cents, fx),
                stock_total: p.stock_total,
                default_variant_id: defaultVariantIds.get(p.id) ?? null,
                is_new: !!flags.new,
                is_deal: !!flags.deal,
                unit: typeof flags.unit === "string" ? flags.unit : "ks",
              };
            });
            return (
              <Eshop19Listing
                items={es19Items}
                categories={headerCategories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, parent_id: c.parent_id, product_count: c.product_count, image_url: c.image_url }))}
                activeCategory={kategorie ?? null}
                categoryName={category?.name ?? (q ? `Hledání: ${q}` : "Celý sortiment")}
                categoryDescription={category?.description ?? null}
                basePath={basePath}
                tenantSlug={tenantSlug}
                currency={displayCurrency}
                total={total}
                page={page}
                pages={pages}
                perPage={perPage}
              />
            );
          }

          // eshop-20 (Vykuk, dedoles DNA): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-20") {
            const es20Items = listItems.map((p) => {
              let flags: Record<string, unknown> = {};
              try { flags = JSON.parse(p.flags || "{}"); } catch { /* noop */ }
              return {
                id: p.id,
                slug: p.slug,
                title: p.title,
                subtitle: p.subtitle,
                brand: p.brand,
                image_url: p.image_url,
                price_min_cents: convertCents(p.price_min_cents, fx),
                compare_at_max_cents: p.compare_at_max_cents == null ? null : convertCents(p.compare_at_max_cents, fx),
                stock_total: p.stock_total,
                default_variant_id: defaultVariantIds.get(p.id) ?? null,
                is_new: !!flags.new,
                is_summer: !!flags.summer,
              };
            });
            return (
              <Eshop20Listing
                items={es20Items}
                categories={headerCategories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, parent_id: c.parent_id, product_count: c.product_count, image_url: c.image_url }))}
                activeCategory={kategorie ?? null}
                categoryName={category?.name ?? (q ? `Hledání: ${q}` : "Celý sortiment")}
                categoryDescription={category?.description ?? null}
                basePath={basePath}
                tenantSlug={tenantSlug}
                currency={displayCurrency}
                total={total}
                page={page}
                pages={pages}
                perPage={perPage}
              />
            );
          }

          // eshop-16 (Spížka, kosik DNA): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-16") {
            const es16Items = listItems.map((p) => {
              let flags: Record<string, unknown> = {};
              try { flags = JSON.parse(p.flags || "{}"); } catch { /* noop */ }
              const mk = flags.multikup as { qty?: number } | undefined;
              return {
                id: p.id,
                slug: p.slug,
                title: p.title,
                subtitle: p.subtitle,
                brand: p.brand,
                image_url: p.image_url,
                price_min_cents: convertCents(p.price_min_cents, fx),
                compare_at_max_cents: p.compare_at_max_cents == null ? null : convertCents(p.compare_at_max_cents, fx),
                default_variant_id: defaultVariantIds.get(p.id) ?? null,
                is_new: !!flags.new,
                price_match: !!flags.priceMatch,
                multikup_qty: mk && typeof mk.qty === "number" ? mk.qty : null,
              };
            });
            return (
              <Eshop16Listing
                items={es16Items}
                categories={headerCategories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, parent_id: c.parent_id, product_count: c.product_count, image_url: c.image_url }))}
                activeCategory={kategorie ?? null}
                categoryName={category?.name ?? (q ? `Hledání: ${q}` : "Celý sortiment")}
                categoryDescription={category?.description ?? null}
                basePath={basePath}
                tenantSlug={tenantSlug}
                currency={displayCurrency}
                total={total}
                page={page}
                pages={pages}
                perPage={perPage}
              />
            );
          }

          // eshop-18 (Oktan, autokelly DNA): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-18") {
            const es18Items = listItems.map((p) => {
              let flags: Record<string, unknown> = {};
              try { flags = JSON.parse(p.flags || "{}"); } catch { /* noop */ }
              return {
                id: p.id,
                slug: p.slug,
                title: p.title,
                subtitle: p.subtitle,
                brand: p.brand,
                image_url: p.image_url,
                price_min_cents: convertCents(p.price_min_cents, fx),
                compare_at_max_cents: p.compare_at_max_cents == null ? null : convertCents(p.compare_at_max_cents, fx),
                stock_total: p.stock_total,
                default_variant_id: defaultVariantIds.get(p.id) ?? null,
                featured: !!flags.featured,
                is_new: !!flags.new,
              };
            });
            return (
              <Eshop18Listing
                items={es18Items}
                categories={headerCategories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, parent_id: c.parent_id, product_count: c.product_count }))}
                activeCategory={kategorie ?? null}
                categoryName={category?.name ?? (q ? `Hledání: ${q}` : "Celý katalog")}
                categoryDescription={category?.description ?? null}
                basePath={basePath}
                tenantSlug={tenantSlug}
                currency={displayCurrency}
                total={total}
                page={page}
                pages={pages}
                perPage={perPage}
              />
            );
          }

          // eshop-17 (Rozkvět, florea DNA): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-17") {
            const es17Items = listItems.map((p) => {
              let flags: Record<string, unknown> = {};
              try { flags = JSON.parse(p.flags || "{}"); } catch { /* noop */ }
              return {
                id: p.id,
                slug: p.slug,
                title: p.title,
                subtitle: p.subtitle,
                image_url: p.image_url,
                price_min_cents: convertCents(p.price_min_cents, fx),
                compare_at_max_cents: p.compare_at_max_cents == null ? null : convertCents(p.compare_at_max_cents, fx),
                stock_total: p.stock_total,
                bulk: typeof flags.bulk === "number" ? flags.bulk : null,
                featured: !!flags.featured,
                free_ship: !!flags.freeShip,
              };
            });
            return (
              <Eshop17Listing
                items={es17Items}
                categories={headerCategories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, parent_id: c.parent_id, product_count: c.product_count, image_url: c.image_url }))}
                activeCategory={kategorie ?? null}
                categoryName={category?.name ?? (q ? `Hledání: ${q}` : "Všechny květiny")}
                categoryDescription={category?.description ?? null}
                basePath={basePath}
                tenantSlug={tenantSlug}
                currency={displayCurrency}
                total={total}
                page={page}
                pages={pages}
                perPage={perPage}
              />
            );
          }

          // eshop-15 (Apatyka, pilulka DNA): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-15") {
            const es15Items = listItems.map((p) => {
              let flags: Record<string, unknown> = {};
              try { flags = JSON.parse(p.flags || "{}"); } catch { /* noop */ }
              return {
                id: p.id,
                slug: p.slug,
                title: p.title,
                subtitle: p.subtitle,
                brand: p.brand,
                image_url: p.image_url,
                price_min_cents: convertCents(p.price_min_cents, fx),
                compare_at_max_cents: p.compare_at_max_cents == null ? null : convertCents(p.compare_at_max_cents, fx),
                default_variant_id: defaultVariantIds.get(p.id) ?? null,
                pro_cents: typeof flags.pro === "number" ? convertCents(flags.pro, fx) : null,
                rating: typeof flags.rating === "string" ? flags.rating : null,
                cashback: !!flags.cashback,
              };
            });
            return (
              <Eshop15Listing
                items={es15Items}
                categories={headerCategories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, parent_id: c.parent_id, product_count: c.product_count }))}
                activeCategory={kategorie ?? null}
                categoryName={category?.name ?? (q ? `Hledání: ${q}` : "Všechny produkty")}
                categoryDescription={category?.description ?? null}
                basePath={basePath}
                tenantSlug={tenantSlug}
                currency={displayCurrency}
                total={total}
                page={page}
                pages={pages}
                perPage={perPage}
              />
            );
          }

          // eshop-14 (Zahradia): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-14") {
            return (
              <div className="mx-auto max-w-[1420px] px-6 pb-10">
                <Eshop14Listing
                  items={mappedItems.map((m) => ({ ...m, default_variant_id: defaultVariantIds.get(m.id) ?? null }))}
                  categories={headerCategories}
                  activeCategory={kategorie ?? null}
                  basePath={basePath}
                  currency={displayCurrency}
                  shopName={shop.name}
                  total={total}
                  page={page}
                  pages={pages}
                  initialBrand={znacka ?? null}
                  initialQuery={q ?? null}
                />
              </div>
            );
          }

          // eshop-13 (LUNELA): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-13") {
            return (
              <div className="mx-auto max-w-[1170px] px-[15px] pb-10">
                <Eshop13Listing
                  items={mappedItems}
                  categories={headerCategories}
                  activeCategory={kategorie ?? null}
                  basePath={basePath}
                  currency={displayCurrency}
                  shopName={shop.name}
                  total={total}
                  page={page}
                  pages={pages}
                  initialBrand={znacka ?? null}
                  initialQuery={q ?? null}
                />
              </div>
            );
          }

          // eshop-12 (PACKA): rovnou katalog bez mezistránky, DO KOŠÍKU z karty
          if (chromeKey === "eshop-12") {
            return (
              <div className="mx-auto max-w-[1360px] px-6 pb-6">
                <Eshop12Listing
                  items={mappedItems.map((m) => ({ ...m, default_variant_id: defaultVariantIds.get(m.id) ?? null }))}
                  categories={headerCategories}
                  activeCategory={kategorie ?? null}
                  basePath={basePath}
                  currency={displayCurrency}
                  shopName={shop.name}
                  total={total}
                  page={page}
                  pages={pages}
                  initialBrand={znacka ?? null}
                  initialQuery={q ?? null}
                />
              </div>
            );
          }

          // eshop-11 (HORAL): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-11") {
            return (
              <div className="mx-auto max-w-[1460px] px-6 pb-10">
                <Eshop11Listing
                  items={mappedItems}
                  categories={headerCategories}
                  activeCategory={kategorie ?? null}
                  basePath={basePath}
                  currency={displayCurrency}
                  shopName={shop.name}
                  total={total}
                  page={page}
                  pages={pages}
                  initialBrand={znacka ?? null}
                  initialQuery={q ?? null}
                />
              </div>
            );
          }

          // eshop-09 (mobil expres): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-09") {
            return (
              <div className="mx-auto max-w-[1360px] px-6 pb-10">
                <Eshop09Listing
                  items={mappedItems.map((m) => ({ ...m, default_variant_id: defaultVariantIds.get(m.id) ?? null }))}
                  categories={headerCategories}
                  activeCategory={kategorie ?? null}
                  basePath={basePath}
                  currency={displayCurrency}
                  shopName={shop.name}
                  total={total}
                  page={page}
                  pages={pages}
                  initialBrand={znacka ?? null}
                  initialQuery={q ?? null}
                />
              </div>
            );
          }

          // eshop-07 (kosmetika-zdravi): rovnou katalog bez mezistránky
          if (chromeKey === "eshop-07") {
            return (
              <div className="mx-auto max-w-[1360px] px-6 pb-10">
                <Eshop07Listing
                  items={mappedItems}
                  categories={headerCategories}
                  activeCategory={kategorie ?? null}
                  basePath={basePath}
                  currency={displayCurrency}
                  shopName={shop.name}
                  total={total}
                  page={page}
                  pages={pages}
                  filterableParams={filterableParams.map((p) => ({
                    id: p.id, slug: p.slug, name: p.name, type: p.type, unit: p.unit, values: p.values,
                  }))}
                  initialBrand={znacka ?? null}
                  initialQuery={q ?? null}
                />
              </div>
            );
          }

          if (isHomepage && chromeKey === "eshop-05") {
            return (
              <div className="mx-auto max-w-[1400px] px-5 py-6">
                <Eshop05Listing
                  items={mappedItems}
                  categories={headerCategories}
                  activeCategory={null}
                  basePath={basePath}
                  currency={displayCurrency}
                  shopName={shop.name}
                  total={total}
                  page={page}
                  pages={pages}
                  filterableParams={filterableParams.map((p) => ({
                    id: p.id, slug: p.slug, name: p.name, type: p.type, unit: p.unit, values: p.values,
                  }))}
                  initialBrand={null}
                  initialQuery={null}
                />
              </div>
            );
          }

          if (isHomepage) {
            // TOP 10 v pořadí podle prodejů; fallback na nejzásobenější produkty
            const bestsellers = addons.has("top-10")
              ? (bestsellerIds.length
                  ? bestsellerIds.map((id) => mappedItems.find((m) => m.id === id)).filter((m): m is typeof mappedItems[number] => !!m)
                  : [...mappedItems].sort((a, b) => (b.stock_total ?? 0) - (a.stock_total ?? 0)).slice(0, 10)
                ).slice(0, 10)
              : [];
            return (
              <ShopHomepage
                tenantSlug={tenantSlug}
                shopName={shop.name || "Obchod"}
                categories={headerCategories}
                products={mappedItems}
                brands={brands}
                currency={displayCurrency}
                bestsellers={bestsellers}
              />
            );
          }

          if (chromeKey === "eshop-06") {
            return (
              <div className="mx-auto max-w-[1320px] px-6 py-2">
                <Eshop06Listing
                  items={mappedItems}
                  categories={headerCategories}
                  activeCategory={kategorie ?? null}
                  basePath={basePath}
                  currency={displayCurrency}
                  shopName={shop.name}
                  total={total}
                  page={page}
                  pages={pages}
                  filterableParams={filterableParams.map((p) => ({
                    id: p.id, slug: p.slug, name: p.name, type: p.type, unit: p.unit, values: p.values,
                  }))}
                  initialBrand={znacka ?? null}
                  initialQuery={q ?? null}
                />
              </div>
            );
          }

          if (chromeKey === "eshop-05") {
            return (
              <div className="mx-auto max-w-[1400px] px-5 py-6">
                <Eshop05Listing
                  items={mappedItems}
                  categories={headerCategories}
                  activeCategory={kategorie ?? null}
                  basePath={basePath}
                  currency={displayCurrency}
                  shopName={shop.name}
                  total={total}
                  page={page}
                  pages={pages}
                  filterableParams={filterableParams.map((p) => ({
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    type: p.type,
                    unit: p.unit,
                    values: p.values,
                  }))}
                  initialBrand={znacka ?? null}
                  initialQuery={q ?? null}
                />
              </div>
            );
          }

          return (
            <div className="mx-auto max-w-[1400px] px-5 py-8">
              <ProductListing
                items={mappedItems}
                categories={headerCategories}
                activeCategory={kategorie ?? null}
                basePath={basePath}
                currency={displayCurrency}
                shopName={shop.name}
                total={total}
                page={page}
                pages={pages}
                columnsToggle={chromeKey === "eshop-03" || chromeKey === "eshop-04"}
                filterableParams={filterableParams.map((p) => ({
                  id: p.id,
                  slug: p.slug,
                  name: p.name,
                  type: p.type,
                  unit: p.unit,
                  values: p.values,
                }))}
                initialBrand={znacka ?? null}
                initialQuery={q ?? null}
              />
            </div>
          );
        })()}
      </main>
      {chromeKey ? (
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
      ) : (
        <ShopFooter
          tenantSlug={tenantSlug}
          shopName={shop.name || "Obchod"}
          categories={headerCategories.filter((c) => !c.parent_id).map((c) => ({ slug: c.slug, name: c.name }))}
          moduleLinks={buildFooterModuleLinks(addons, tenantSlug)}
          whatsapp={addons.has("whatsapp-chat")}
        />
      )}
      <CartToast />
      <CookieConsent />
    </div>
  );
}

export default StorefrontListingPage;

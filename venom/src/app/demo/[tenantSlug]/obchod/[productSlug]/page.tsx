import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getTenantBySlug, query } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getProductBySlug, resolveProductSlugRedirect } from "@/lib/commerce/products";
import { AddToCart } from "@/components/storefront/AddToCart";
import { CartToast } from "@/components/storefront/CartToast";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { BonamiGallery } from "@/components/storefront/BonamiGallery";
import { PromoCodeAdd } from "@/components/storefront/PromoCodeAdd";
import { ProductReviews } from "@/components/storefront/ProductReviews";
import { RelatedProducts } from "@/components/storefront/RelatedProducts";
import { Eshop10Detail } from "@/components/storefront/Eshop10Detail";
import { Eshop11Detail } from "@/components/storefront/Eshop11Detail";
import { Eshop13Detail } from "@/components/storefront/Eshop13Detail";
import { Eshop12Detail } from "@/components/storefront/Eshop12Detail";
import { Eshop14Detail } from "@/components/storefront/Eshop14Detail";
import { Eshop15Detail, type Es15MiniCard } from "@/components/storefront/Eshop15Detail";
import { Eshop16Detail, type Es16DetailMiniCard } from "@/components/storefront/Eshop16Detail";
import { Eshop20Detail, type Es20DetailMiniCard } from "@/components/storefront/Eshop20Detail";
import { Eshop17Detail, type Es17DetailMiniCard } from "@/components/storefront/Eshop17Detail";
import { Eshop18Detail, type Es18DetailMiniCard } from "@/components/storefront/Eshop18Detail";
import { Eshop19Detail, type Es19MiniCard } from "@/components/storefront/Eshop19Detail";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import { SocialShare } from "@/components/storefront/SocialShare";
import { RecentlyViewed } from "@/components/storefront/RecentlyViewed";
import { RecentlyViewedTracker } from "@/components/storefront/RecentlyViewedTracker";
import { BackInStockNotify } from "@/components/storefront/BackInStockNotify";
import { SaleCountdown } from "@/components/storefront/SaleCountdown";
import { ProductQuestions } from "@/components/storefront/ProductQuestions";
import { CompareButton, CompareBar } from "@/components/storefront/CompareWidget";
import { GoogleReviewsBadge } from "@/components/storefront/GoogleReviewsBadge";
import { BundleOffer } from "@/components/storefront/BundleOffer";
import { getBundlesForProduct } from "@/lib/commerce/bundles";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { getDisplayFx, parseDisplayCurrency, convertCents, FX_COOKIE_PREFIX } from "@/lib/commerce/currency";
import { getTranslatedField } from "@/lib/commerce/translations";
import { CookieConsent } from "@/components/storefront/CookieConsent";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { ShopFooter } from "@/components/storefront/ShopFooter";
import { getTemplateChromeKey, TemplateShopHeader, TemplateShopFooter } from "@/components/storefront/TemplateShopChrome";
import { buildFooterModuleLinks } from "@/components/storefront/footerModuleLinks";
import { searchProducts, getUniqueBrands } from "@/lib/commerce/products";
import { listCategories } from "@/lib/commerce/categories";
import { getProductParams } from "@/lib/commerce/params";
import { descriptionToHtml, richTextToPlain } from "@/lib/commerce/html";
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ tenantSlug: string; productSlug: string }>;
}

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 })
    .format(cents / 100);
}

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug, productSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  const product = await getProductBySlug(tenant.id, productSlug);
  if (!product) return {};
  const title = product.seo_title ?? product.title;
  const description = product.seo_description ?? product.subtitle
    ?? (product.description ? richTextToPlain(product.description).slice(0, 160) : undefined);
  const canonical = `${BASE}/demo/${tenantSlug}/obchod/${product.slug}`;
  const image = product.images[0]?.url ?? product.og_image ?? undefined;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: image ? [{ url: image, width: 800, height: 800, alt: product.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
    robots: tenant.status === "demo" ? { index: false } : undefined,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { tenantSlug, productSlug } = await params;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return notFound();

  const product = await getProductBySlug(tenant.id, productSlug);

  // Starý slug → 301 na nový (redirect historie z přejmenování produktu).
  if (!product || product.status !== "active") {
    const target = await resolveProductSlugRedirect(tenant.id, productSlug);
    if (target) redirect(`/demo/${tenantSlug}/obchod/${target}`);
    if (!product) return notFound();
  }
  if (product.status === "archived" || product.status === "draft") return notFound();

  const defaultVariant = product.variants.find((v) => v.is_default) ?? product.variants[0];
  const inStock = product.variants.some((v) => !v.track_stock || v.stock_qty > 0 || v.stock_policy === "continue");
  const mainImage = product.images[0] ?? null;

  const [addons, chromeKey] = await Promise.all([
    getActiveAddonSlugs(tenant.id),
    getTemplateChromeKey(tenant.id),
  ]);
  // eshop-05 "Hračkolandia" — pompo.cz layout detailu (červená cena + DMOC,
  // ohraničený box dostupnosti, věrnostní body, Parametry v pravém sloupci)
  const isPompo = chromeKey === "eshop-05";
  // eshop-06 "Ořeškárna" — svetplodu.cz layout detailu (žlutý dárek badge,
  // lead + ✓ benefity, „Vaše cena", ohraničený box dostupnosti, specifikace)
  const isOreskarna = chromeKey === "eshop-06";
  // eshop-07 "Néroli parfumerie" — kosmetika-zdravi.cz layout detailu (brand
  // link + uppercase název, velká cena s unit řádkem, tyrkys CTA, box výhod,
  // Hlava/Srdce/Základ, akordeony Vlastnosti/O značce, Objevte více chips)
  const isNeroli = chromeKey === "eshop-07";
  // eshop-08 "Domea" — bonami.cz layout detailu (červená cena s kódem, promo
  // box slevového kódu, zelené pill DO KOŠÍKU, doručení Osobní odběr/Na adresu,
  // Zaplatím na třetiny, Podobné produkty)
  const isBonami = chromeKey === "eshop-08";
  const isEs09 = chromeKey === "eshop-09";

  // Modul cizi-meny: zobrazovací měna dle cookie + reálný kurz ČNB
  const cookieStore = await cookies();
  const fx = addons.has("cizi-meny")
    ? await getDisplayFx(parseDisplayCurrency(cookieStore.get(`${FX_COOKIE_PREFIX}${tenantSlug}`)?.value))
    : { currency: "CZK" as const, rate_czk: 1 };
  const displayCurrency = fx.currency === "CZK" ? shop.currency : fx.currency;
  const price = (cents: number) => czk(convertCents(cents, fx), displayCurrency);

  // Modul cizi-jazyky: přeložený obsah produktu dle cookie jazyka
  const locale = cookieStore.get(`webero_locale_${tenantSlug}`)?.value ?? "cs";
  if (addons.has("cizi-jazyky") && locale !== "cs") {
    const [tTitle, tSubtitle, tDescription] = await Promise.all([
      getTranslatedField(tenant.id, "product", product.id, locale, "title"),
      getTranslatedField(tenant.id, "product", product.id, locale, "subtitle"),
      getTranslatedField(tenant.id, "product", product.id, locale, "description"),
    ]);
    if (tTitle) product.title = tTitle;
    if (tSubtitle) product.subtitle = tSubtitle;
    if (tDescription) product.description = tDescription;
  }

  // Modul podobne-produkty: strip podle značky/názvu
  const relatedProducts = (addons.has("podobne-produkty") || isPompo || isOreskarna || isNeroli || isBonami || isEs09 || chromeKey === "eshop-10" || chromeKey === "eshop-11" || chromeKey === "eshop-14")
    ? await searchProducts(tenant.id, product.brand || product.title.split(" ")[0], 4)
        .then((r) => r.filter((p) => p.slug !== product.slug).slice(0, 4))
    : [];

  // Modul sady-produktu: zvýhodněné sady obsahující tento produkt
  const bundles = addons.has("sady-produktu")
    ? await getBundlesForProduct(tenant.id, product.id)
    : [];

  // Modul souvisejici-produkty: doplňky ze stejné kategorie
  const accessoryProducts = addons.has("souvisejici-produkty") && product.primary_category_id
    ? await query<{ id: number; slug: string; title: string; brand: string | null; price_cents: number; image_url: string | null }>(
        `SELECT p.id, p.slug, p.title, p.brand,
                COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
                (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
         FROM products p
         WHERE p.tenant_id = $1 AND p.status = 'active' AND p.primary_category_id = $2 AND p.id <> $3
         ORDER BY p.id DESC LIMIT 4`,
        [tenant.id, product.primary_category_id, product.id]
      ).catch(() => [])
    : [];

  // Modul tento-tyden-zakoupilo: reálný počet z objednávek za 7 dní, jinak deterministický demo počet
  let purchasedThisWeek = 0;
  if (addons.has("tento-tyden-zakoupilo")) {
    const rows = await query<{ total: string }>(
      `SELECT COALESCE(SUM(oi.qty), 0) AS total
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE oi.tenant_id = $1 AND oi.product_id = $2 AND o.created_at > now() - interval '7 days'`,
      [tenant.id, product.id]
    ).catch(() => [{ total: "0" }]);
    purchasedThisWeek = parseInt(rows[0]?.total ?? "0", 10);
    if (purchasedThisWeek === 0) purchasedThisWeek = 3 + ((product.id * 7) % 16);
  }

  const canonical = `${BASE}/demo/${tenantSlug}/obchod/${product.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    url: canonical,
    description: product.seo_description ?? product.subtitle ?? (product.description ? richTextToPlain(product.description) : undefined),
    image: product.images.map((i) => i.url),
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    sku: defaultVariant?.sku ?? undefined,
    offers: defaultVariant
      ? {
          "@type": "Offer",
          priceCurrency: shop.currency,
          price: (defaultVariant.price_cents / 100).toFixed(2),
          availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: canonical,
        }
      : undefined,
  };

  const [categories, brands, productParams, reviewStats] = await Promise.all([
    listCategories(tenant.id),
    getUniqueBrands(tenant.id),
    getProductParams(tenant.id, product.id).catch(() => []),
    query<{ avg_rating: string; total: string }>(
      `SELECT COALESCE(AVG(rating), 0) AS avg_rating, COUNT(*) AS total
       FROM commerce_reviews WHERE tenant_id = $1 AND product_id = $2 AND status = 'approved'`,
      [tenant.id, product.id]
    ).catch(() => [] as { avg_rating: string; total: string }[]),
  ]);

  const avgRating = parseFloat(reviewStats[0]?.avg_rating ?? "0");
  const totalReviews = parseInt(reviewStats[0]?.total ?? "0", 10);
  if (totalReviews > 0) {
    (jsonLd as Record<string, unknown>).aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: totalReviews,
    };
  }

  // Breadcrumb trail: Obchod → rodič → kategorie → produkt
  const crumbTrail: { slug: string; name: string }[] = [];
  let crumbCat = categories.find((c) => c.id === product.primary_category_id) ?? null;
  while (crumbCat) {
    crumbTrail.unshift({ slug: crumbCat.slug, name: crumbCat.name });
    crumbCat = crumbCat.parent_id ? categories.find((c) => c.id === crumbCat!.parent_id) ?? null : null;
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: shop.name || "Obchod", item: `${BASE}/demo/${tenantSlug}/obchod` },
      ...crumbTrail.map((c, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: c.name,
        item: `${BASE}/demo/${tenantSlug}/obchod?kategorie=${c.slug}`,
      })),
      { "@type": "ListItem", position: crumbTrail.length + 2, name: product.title, item: canonical },
    ],
  };

  // eshop-19 "Grunt" — dek.cz layout detailu (foto karta, badge Výhodná cena,
  // price box se žlutou sleva vlajkou + s/bez DPH + stepper, Zákazníci společně
  // nakupují, Popis + Parametry tabulka, Informace o ceně, Hodnocení, Související)
  if (chromeKey === "eshop-19") {
    const miniCards19 = async (where: string, values: unknown[]): Promise<Es19MiniCard[]> => {
      const rows = await query<{
        slug: string; title: string; subtitle: string | null; flags: unknown;
        price_cents: number; compare_cents: number | null; image_url: string | null; default_variant_id: number | null;
      }>(
        `SELECT p.slug, p.title, p.subtitle, p.flags,
                COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
                (SELECT MAX(pv.compare_at_price_cents) FROM product_variants pv WHERE pv.product_id = p.id) AS compare_cents,
                (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url,
                (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.is_default DESC, pv.id LIMIT 1) AS default_variant_id
         FROM products p
         WHERE p.tenant_id = $1 AND p.status = 'active' AND p.id <> $2 AND ${where}
         ORDER BY p.updated_at DESC LIMIT 5`,
        values
      ).catch(() => []);
      return rows.map((r) => {
        const f = (typeof r.flags === "string" ? JSON.parse(r.flags || "{}") : (r.flags ?? {})) as Record<string, unknown>;
        return {
          slug: r.slug, title: r.title, subtitle: r.subtitle,
          price_cents: convertCents(r.price_cents, fx),
          compare_cents: r.compare_cents == null ? null : convertCents(r.compare_cents, fx),
          image_url: r.image_url,
          default_variant_id: r.default_variant_id,
          is_deal: !!f.deal,
          unit: typeof f.unit === "string" ? f.unit : "ks",
        };
      });
    };

    const [together19, related19] = await Promise.all([
      // Zákazníci společně nakupují: stejná kategorie
      product.primary_category_id
        ? miniCards19(`p.primary_category_id = $3`, [tenant.id, product.id, product.primary_category_id])
        : Promise.resolve([] as Es19MiniCard[]),
      // Související položky: napříč sortimentem (jiná kategorie)
      miniCards19(`(p.primary_category_id IS DISTINCT FROM $3 OR p.primary_category_id IS NULL)`, [tenant.id, product.id, product.primary_category_id]),
    ]);

    const pFlags19 = (product.flags ?? {}) as Record<string, unknown>;
    const unit19 = typeof pFlags19.unit === "string" ? (pFlags19.unit as string) : "ks";
    const catName19 = categories.find((c) => c.id === product.primary_category_id)?.name ?? null;
    const paramRows19: { label: string; value: string }[] = [
      ...(productParams.length
        ? productParams.map((pp: { name: string; value: string; unit?: string | null }) => ({ label: pp.name, value: `${pp.value}${pp.unit ? ` ${pp.unit}` : ""}` }))
        : []),
      ...(product.subtitle
        ? product.subtitle.split("•").map((part, i) => ({ label: i === 0 ? "Specifikace" : "Vlastnost", value: part.trim() })).filter((r) => r.value)
        : []),
      ...(product.brand ? [{ label: "Výrobce", value: product.brand }] : []),
      ...(catName19 ? [{ label: "Typ", value: catName19 }] : []),
      { label: "Cenová jednotka", value: unit19 },
      { label: "Země původu", value: "Česká republika (demo)" },
      ...(defaultVariant?.sku ? [{ label: "SKU", value: defaultVariant.sku }] : []),
    ];

    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-screen bg-white text-[#111]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <Eshop19Detail
            tenantSlug={tenantSlug}
            basePath={`/demo/${tenantSlug}/obchod`}
            currency={displayCurrency}
            crumbs={crumbTrail}
            product={{
              title: product.title,
              subtitle: product.subtitle,
              brand: product.brand,
              description: product.description ? richTextToPlain(product.description) : null,
              image_url: mainImage?.url ?? null,
              image_alt: mainImage?.alt ?? null,
              isNew: !!pFlags19.new,
              isDeal: !!pFlags19.deal,
              unit: unit19,
              itemNo: String(4400910000 + product.id),
              catalogCode: `G${String(product.id).padStart(2, "0")}A${String((product.id * 7) % 90 + 10)}`,
            }}
            variant={defaultVariant ? {
              id: defaultVariant.id,
              price_cents: convertCents(defaultVariant.price_cents, fx),
              compare_at_price_cents: defaultVariant.compare_at_price_cents == null ? null : convertCents(defaultVariant.compare_at_price_cents, fx),
              stock_qty: defaultVariant.stock_qty,
            } : null}
            paramRows={paramRows19}
            together={together19}
            related={related19}
          />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
        {/* CartToast záměrně ne — potvrzení řeší pop-up košík (PŘIDÁNO DO KOŠÍKU) */}
        <CookieConsent />
      </div>
    );
  }

  // eshop-20 "Vykuk" — dedoles.cz layout detailu (foto karta s chipy a srdíčkem,
  // rating hvězdy, zelený 2+1 pruh s kódem, výběr velikosti pill chipy, růžová
  // CTA, akordeony Popis/Doprava, Zákazníkům se také líbí, recenze, lime pás)
  if (chromeKey === "eshop-20") {
    const relRows20 = product.primary_category_id
      ? await query<{
          slug: string; title: string; subtitle: string | null; flags: unknown;
          price_cents: number; compare_cents: number | null; image_url: string | null; default_variant_id: number | null;
        }>(
          `SELECT p.slug, p.title, p.subtitle, p.flags,
                  COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
                  (SELECT MAX(pv.compare_at_price_cents) FROM product_variants pv WHERE pv.product_id = p.id) AS compare_cents,
                  (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url,
                  (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.is_default DESC, pv.id LIMIT 1) AS default_variant_id
           FROM products p
           JOIN product_category_links l ON l.product_id = p.id
           JOIN product_categories c ON c.id = l.category_id
           WHERE p.tenant_id = $1 AND p.status = 'active' AND p.id <> $2
             AND (c.id = $3 OR c.parent_id = (SELECT parent_id FROM product_categories WHERE id = $3))
           GROUP BY p.id
           ORDER BY p.updated_at DESC LIMIT 8`,
          [tenant.id, product.id, product.primary_category_id]
        ).catch(() => [])
      : [];
    const related20: Es20DetailMiniCard[] = relRows20.map((r) => {
      const f = (typeof r.flags === "string" ? JSON.parse(r.flags || "{}") : (r.flags ?? {})) as Record<string, unknown>;
      return {
        slug: r.slug, title: r.title, subtitle: r.subtitle,
        price_cents: convertCents(r.price_cents, fx),
        compare_cents: r.compare_cents == null ? null : convertCents(r.compare_cents, fx),
        image_url: r.image_url,
        default_variant_id: r.default_variant_id,
        is_new: !!f.new,
        is_summer: !!f.summer,
      };
    });

    const pFlags20 = (product.flags ?? {}) as Record<string, unknown>;
    const promo20 = pFlags20.summer
      ? { text: "−20 % navíc na letní kolekci", code: "SUMMER" }
      : { text: "2 + 1 zdarma na veselé kousky", code: "VYKUK" };

    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-screen" style={{ background: "#fdf8f0" }}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <Eshop20Detail
            tenantSlug={tenantSlug}
            basePath={`/demo/${tenantSlug}/obchod`}
            currency={displayCurrency}
            crumbs={crumbTrail.map((c) => ({ label: c.name, href: `/demo/${tenantSlug}/obchod?kategorie=${c.slug}` }))}
            product={{
              slug: product.slug,
              title: product.title,
              subtitle: product.subtitle,
              description: product.description ? richTextToPlain(product.description) : null,
              image_url: mainImage?.url ?? null,
              image_alt: mainImage?.alt ?? null,
              is_new: !!pFlags20.new,
              is_summer: !!pFlags20.summer,
            }}
            variants={product.variants.map((vv) => ({
              id: vv.id,
              title: vv.title ?? "Uni",
              price_cents: convertCents(vv.price_cents, fx),
              compare_at_price_cents: vv.compare_at_price_cents == null ? null : convertCents(vv.compare_at_price_cents, fx),
              stock_qty: vv.stock_qty,
              is_default: !!vv.is_default,
            }))}
            promoText={promo20.text}
            promoCode={promo20.code}
            related={related20}
          />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
        {/* CartToast záměrně ne — potvrzení řeší pop-up košík (PŘIDÁNO DO KOŠÍKU) */}
        <CookieConsent />
      </div>
    );
  }

  // eshop-16 "Spížka" — kosik.cz layout detailu (kosik modal → plná stránka:
  // foto karta s chipy, superscript cena, multikup box, stepper + Do košíku,
  // demo info řádky, TRVANLIVOST/skladování boxy, Mohlo by se hodit)
  if (chromeKey === "eshop-16") {
    const relRows = product.primary_category_id
      ? await query<{
          slug: string; title: string; subtitle: string | null; flags: unknown;
          price_cents: number; compare_cents: number | null; image_url: string | null; default_variant_id: number | null;
        }>(
          `SELECT p.slug, p.title, p.subtitle, p.flags,
                  COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
                  (SELECT MAX(pv.compare_at_price_cents) FROM product_variants pv WHERE pv.product_id = p.id) AS compare_cents,
                  (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url,
                  (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.is_default DESC, pv.id LIMIT 1) AS default_variant_id
           FROM products p
           JOIN product_category_links l ON l.product_id = p.id
           JOIN product_categories c ON c.id = l.category_id
           WHERE p.tenant_id = $1 AND p.status = 'active' AND p.id <> $2
             AND (c.id = $3 OR c.parent_id = (SELECT parent_id FROM product_categories WHERE id = $3))
           GROUP BY p.id
           ORDER BY p.updated_at DESC LIMIT 6`,
          [tenant.id, product.id, product.primary_category_id]
        ).catch(() => [])
      : [];
    const related16: Es16DetailMiniCard[] = relRows.map((r) => {
      const f = (typeof r.flags === "string" ? JSON.parse(r.flags || "{}") : (r.flags ?? {})) as Record<string, unknown>;
      return {
        slug: r.slug, title: r.title, subtitle: r.subtitle,
        price_cents: convertCents(r.price_cents, fx),
        compare_cents: r.compare_cents == null ? null : convertCents(r.compare_cents, fx),
        image_url: r.image_url,
        default_variant_id: r.default_variant_id,
        price_match: !!f.priceMatch,
        is_new: !!f.new,
      };
    });

    const catLinkRows = await query<{ slug: string; name: string }>(
      `SELECT c.slug, c.name FROM product_category_links l
       JOIN product_categories c ON c.id = l.category_id
       WHERE l.tenant_id = $1 AND l.product_id = $2 AND c.is_visible = true
       ORDER BY c.sort_order, c.name`,
      [tenant.id, product.id]
    ).catch(() => []);

    const pFlags16 = (product.flags ?? {}) as Record<string, unknown>;
    const mk16 = pFlags16.multikup as { qty?: number; price?: number } | undefined;

    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-screen" style={{ background: "#fbf7f1" }}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <Eshop16Detail
            tenantSlug={tenantSlug}
            basePath={`/demo/${tenantSlug}/obchod`}
            currency={displayCurrency}
            crumbs={crumbTrail}
            product={{
              title: product.title,
              subtitle: product.subtitle,
              brand: product.brand,
              description: product.description ? richTextToPlain(product.description) : null,
              image_url: mainImage?.url ?? null,
              image_alt: mainImage?.alt ?? null,
              is_new: !!pFlags16.new,
              price_match: !!pFlags16.priceMatch,
              multikup: mk16 && typeof mk16.qty === "number" && typeof mk16.price === "number"
                ? { qty: mk16.qty, price: convertCents(mk16.price, fx) }
                : null,
            }}
            variant={defaultVariant ? {
              id: defaultVariant.id,
              price_cents: convertCents(defaultVariant.price_cents, fx),
              compare_at_price_cents: defaultVariant.compare_at_price_cents == null ? null : convertCents(defaultVariant.compare_at_price_cents, fx),
              stock_qty: defaultVariant.stock_qty,
            } : null}
            categoryLinks={catLinkRows}
            related={related16}
          />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
        {/* CartToast záměrně ne — potvrzení řeší pop-up košík (PŘIDÁNO DO KOŠÍKU) */}
        <CookieConsent />
      </div>
    );
  }

  // eshop-18 "Oktan" — autokelly.cz layout detailu (foto karta se skosenými
  // badge, buy box s objednacím kódem + Vaše cena + dostupnost na pobočkách,
  // karbonový panel Další informace, tab lišta, parametry tabulka,
  // INFORMACE O PRODUKTU/VÝROBCI, aside Zákazníci také zakoupili)
  if (chromeKey === "eshop-18") {
    const rel18 = await query<{
      slug: string; title: string; brand: string | null; subtitle: string | null;
      price_cents: number; compare_cents: number | null; image_url: string | null;
    }>(
      `SELECT p.slug, p.title, p.brand, p.subtitle,
              COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
              (SELECT MAX(pv.compare_at_price_cents) FROM product_variants pv WHERE pv.product_id = p.id) AS compare_cents,
              (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
       FROM products p
       WHERE p.tenant_id = $1 AND p.status = 'active' AND p.id <> $2
         AND ($3::int IS NULL OR p.primary_category_id = $3)
       ORDER BY p.updated_at DESC LIMIT 4`,
      [tenant.id, product.id, product.primary_category_id]
    ).catch(() => []);
    const also18: Es18DetailMiniCard[] = rel18.map((r) => ({
      slug: r.slug, title: r.title, brand: r.brand, subtitle: r.subtitle,
      price_cents: convertCents(r.price_cents, fx),
      compare_cents: r.compare_cents == null ? null : convertCents(r.compare_cents, fx),
      image_url: r.image_url,
    }));

    const pFlags18 = (product.flags ?? {}) as Record<string, unknown>;
    const catName18 = categories.find((c) => c.id === product.primary_category_id)?.name ?? null;
    const subtitleParts18 = (product.subtitle ?? "").split("•").map((x) => x.trim()).filter(Boolean);
    const infoRows18: { label: string; value: string }[] = [
      ...(productParams.length
        ? productParams.map((pp: { name: string; value: string; unit?: string | null }) => ({ label: pp.name, value: `${pp.value}${pp.unit ? ` ${pp.unit}` : ""}` }))
        : []),
      ...(subtitleParts18[0] ? [{ label: "Balení / rozměr", value: subtitleParts18[0] }] : []),
      ...(subtitleParts18[1] ? [{ label: "Provedení", value: subtitleParts18[1] }] : []),
      ...(subtitleParts18[2] ? [{ label: "Norma / specifikace", value: subtitleParts18[2] }] : []),
      ...(product.brand ? [{ label: "Výrobce", value: product.brand }] : []),
      ...(catName18 ? [{ label: "Kategorie", value: catName18 }] : []),
      ...(defaultVariant?.sku ? [{ label: "Objednací kód", value: defaultVariant.sku }] : []),
      { label: "Záruka", value: "24 měsíců" },
    ];

    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-screen bg-white text-[#111]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <Eshop18Detail
            tenantSlug={tenantSlug}
            basePath={`/demo/${tenantSlug}/obchod`}
            currency={displayCurrency}
            crumbs={crumbTrail}
            product={{
              title: product.title,
              subtitle: product.subtitle,
              brand: product.brand,
              description: product.description ? richTextToPlain(product.description) : null,
              image_url: mainImage?.url ?? null,
              image_alt: mainImage?.alt ?? null,
              featured: !!pFlags18.featured,
              isNew: !!pFlags18.new,
              sku: defaultVariant?.sku ?? null,
            }}
            variant={defaultVariant ? {
              id: defaultVariant.id,
              price_cents: convertCents(defaultVariant.price_cents, fx),
              compare_at_price_cents: defaultVariant.compare_at_price_cents == null ? null : convertCents(defaultVariant.compare_at_price_cents, fx),
              stock_qty: defaultVariant.stock_qty,
            } : null}
            infoRows={infoRows18}
            alsoBought={also18}
          />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
        {/* CartToast záměrně ne — potvrzení řeší pop-up košík (PŘIDÁNO DO KOŠÍKU) */}
        <CookieConsent />
      </div>
    );
  }

  // eshop-15 "Apatyka" — pilulka.cz layout detailu (foto karta s chipy,
  // cena + PRO pill, plná pill Koupit, dostupnost, Ještě se může hodit,
  // sticky tab lišta, Doplňující informace, recenze, Často se kupuje společně)
  // eshop-17 "Rozkvět" — florea.cz layout detailu (galerie s miniaturami,
  // buy box Cena s DPH + stepper, bordó upsell pruh, průvodce velikostí,
  // Podrobnější informace, benefity, Naše další nabídka z kategorie)
  if (chromeKey === "eshop-17") {
    const rel17 = await query<{
      slug: string; title: string; flags: unknown; stock_total: number;
      price_cents: number; compare_cents: number | null; image_url: string | null;
    }>(
      `SELECT p.slug, p.title, p.flags,
              COALESCE((SELECT SUM(pv.stock_qty) FROM product_variants pv WHERE pv.product_id = p.id), 0)::int AS stock_total,
              COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
              (SELECT MAX(pv.compare_at_price_cents) FROM product_variants pv WHERE pv.product_id = p.id) AS compare_cents,
              (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
       FROM products p
       WHERE p.tenant_id = $1 AND p.status = 'active' AND p.id <> $2
         AND ($3::int IS NULL OR p.primary_category_id = $3)
       ORDER BY p.updated_at DESC LIMIT 4`,
      [tenant.id, product.id, product.primary_category_id]
    ).catch(() => []);
    const related17: Es17DetailMiniCard[] = rel17.map((r) => {
      const f = (typeof r.flags === "string" ? JSON.parse(r.flags || "{}") : (r.flags ?? {})) as Record<string, unknown>;
      return {
        slug: r.slug, title: r.title, image_url: r.image_url,
        price_cents: convertCents(r.price_cents, fx),
        compare_cents: r.compare_cents == null ? null : convertCents(r.compare_cents, fx),
        stock_total: r.stock_total,
        bulk: typeof f.bulk === "number" ? f.bulk : null,
        featured: !!f.featured,
        free_ship: !!f.freeShip,
      };
    });

    const pFlags17 = (product.flags ?? {}) as Record<string, unknown>;
    const catName17 = categories.find((c) => c.id === product.primary_category_id)?.name ?? null;
    const stemMatch = product.title.match(/(\d{2,3})\s*cm/i);
    const infoRows17: { label: string; value: string }[] = [
      ...(defaultVariant?.sku ? [{ label: "VBN", value: String(20220000000 + defaultVariant.id) }] : []),
      ...(stemMatch ? [{ label: "Délka stonku", value: `${stemMatch[1]} cm` }] : []),
      ...(product.subtitle ? [{ label: "Složení", value: product.subtitle }] : []),
      ...(catName17 ? [{ label: "Kategorie", value: catName17 }] : []),
      { label: "Dodavatel", value: "Květinová burza Aalsmeer (demo)" },
      { label: "Prodejce", value: "Rozkvět Atelier s.r.o., IČ 12345678 (demo)" },
      ...(defaultVariant?.sku ? [{ label: "SKU", value: defaultVariant.sku }] : []),
    ];

    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-screen bg-white text-[#111]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <Eshop17Detail
            tenantSlug={tenantSlug}
            basePath={`/demo/${tenantSlug}/obchod`}
            currency={displayCurrency}
            crumbs={[
              { label: "Rozkvět", href: `/demo/${tenantSlug}` },
              ...crumbTrail.map((c) => ({ label: c.name, href: `/demo/${tenantSlug}/obchod?kategorie=${c.slug}` })),
              { label: product.title },
            ]}
            product={{
              title: product.title,
              subtitle: product.subtitle,
              description: product.description ? richTextToPlain(product.description) : null,
              image_url: mainImage?.url ?? null,
              image_alt: mainImage?.alt ?? null,
              bulk: typeof pFlags17.bulk === "number" ? (pFlags17.bulk as number) : null,
              featured: !!pFlags17.featured,
              free_ship: !!pFlags17.freeShip,
              sku: defaultVariant?.sku ?? null,
            }}
            variant={defaultVariant ? {
              id: defaultVariant.id,
              price_cents: convertCents(defaultVariant.price_cents, fx),
              compare_at_price_cents: defaultVariant.compare_at_price_cents == null ? null : convertCents(defaultVariant.compare_at_price_cents, fx),
              stock_qty: defaultVariant.stock_qty,
            } : null}
            infoRows={infoRows17}
            related={related17}
            categoryName={catName17}
          />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
        {/* CartToast záměrně ne — potvrzení řeší pop-up košík (PŘIDÁNO DO KOŠÍKU) */}
        <CookieConsent />
      </div>
    );
  }

  if (chromeKey === "eshop-15") {
    const miniCards = async (where: string, values: unknown[]): Promise<Es15MiniCard[]> => {
      const rows = await query<{
        slug: string; title: string; brand: string | null; subtitle: string | null; flags: unknown;
        price_cents: number; compare_cents: number | null; image_url: string | null; default_variant_id: number | null;
      }>(
        `SELECT p.slug, p.title, p.brand, p.subtitle, p.flags,
                COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
                (SELECT MAX(pv.compare_at_price_cents) FROM product_variants pv WHERE pv.product_id = p.id) AS compare_cents,
                (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url,
                (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.is_default DESC, pv.id LIMIT 1) AS default_variant_id
         FROM products p
         WHERE p.tenant_id = $1 AND p.status = 'active' AND p.id <> $2 AND ${where}
         ORDER BY p.updated_at DESC LIMIT 6`,
        values
      ).catch(() => []);
      return rows.map((r) => {
        const f = (typeof r.flags === "string" ? JSON.parse(r.flags || "{}") : (r.flags ?? {})) as Record<string, unknown>;
        return {
          slug: r.slug, title: r.title, brand: r.brand, subtitle: r.subtitle,
          price_cents: convertCents(r.price_cents, fx),
          compare_cents: r.compare_cents == null ? null : convertCents(r.compare_cents, fx),
          pro_cents: typeof f.pro === "number" ? convertCents(f.pro, fx) : null,
          rating: typeof f.rating === "string" ? f.rating : null,
          cashback: !!f.cashback,
          image_url: r.image_url,
          default_variant_id: r.default_variant_id,
        };
      });
    };

    const [related15, together15] = await Promise.all([
      // Ještě se může hodit: napříč sortimentem (jiná kategorie než produkt)
      miniCards(`(p.primary_category_id IS DISTINCT FROM $3 OR p.primary_category_id IS NULL)`, [tenant.id, product.id, product.primary_category_id]),
      // Často se kupuje společně: stejná kategorie
      product.primary_category_id
        ? miniCards(`p.primary_category_id = $3`, [tenant.id, product.id, product.primary_category_id])
        : Promise.resolve([] as Es15MiniCard[]),
    ]);

    const pFlags = (product.flags ?? {}) as Record<string, unknown>;
    const catName = categories.find((c) => c.id === product.primary_category_id)?.name ?? null;
    const infoRows: { label: string; value: string }[] = [
      ...(productParams.length
        ? productParams.map((pp: { name: string; value: string; unit?: string | null }) => ({ label: pp.name, value: `${pp.value}${pp.unit ? ` ${pp.unit}` : ""}` }))
        : []),
      ...(product.brand ? [{ label: "Značka", value: product.brand }] : []),
      ...(catName ? [{ label: "Kategorie", value: catName }] : []),
      ...(product.subtitle ? [{ label: "Velikost balení", value: product.subtitle.split("•")[0].trim() }] : []),
      ...(typeof pFlags.rating === "string" ? [{ label: "NutraRating", value: pFlags.rating as string }] : []),
      { label: "Země původu", value: "Česká republika" },
      { label: "Výrobce", value: "Apatyka Lab s.r.o., Demo 12, Praha (demo)" },
      ...(defaultVariant?.sku ? [{ label: "SKU", value: defaultVariant.sku }] : []),
    ];

    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-screen bg-white text-[#111]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <Eshop15Detail
            tenantSlug={tenantSlug}
            basePath={`/demo/${tenantSlug}/obchod`}
            currency={displayCurrency}
            crumbs={crumbTrail}
            product={{
              title: product.title,
              subtitle: product.subtitle,
              brand: product.brand,
              description: product.description ? richTextToPlain(product.description) : null,
              image_url: mainImage?.url ?? null,
              image_alt: mainImage?.alt ?? null,
              pro_cents: typeof pFlags.pro === "number" ? convertCents(pFlags.pro as number, fx) : null,
              rating: typeof pFlags.rating === "string" ? (pFlags.rating as string) : null,
              cashback: !!pFlags.cashback,
              isNew: !!pFlags.new,
            }}
            variant={defaultVariant ? {
              id: defaultVariant.id,
              price_cents: convertCents(defaultVariant.price_cents, fx),
              compare_at_price_cents: defaultVariant.compare_at_price_cents == null ? null : convertCents(defaultVariant.compare_at_price_cents, fx),
              stock_qty: defaultVariant.stock_qty,
            } : null}
            infoRows={infoRows}
            related={related15}
            boughtTogether={together15}
          />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
        {/* CartToast záměrně ne — potvrzení řeší pop-up košík (PŘIDÁNO DO KOŠÍKU) */}
        <CookieConsent />
      </div>
    );
  }

  // eshop-10 "BOTIQ" — footshop.cz layout detailu (vlastní komponenta:
  // galerie + sticky sloupec s mřížkou velikostí, volt CTA, benefity,
  // HODÍ SE K…, taby, Další produkty značky)
  if (chromeKey === "eshop-10") {
    const fitsRows = await query<{ slug: string; title: string; brand: string | null; price_cents: number; image_url: string | null }>(
      `SELECT p.slug, p.title, p.brand,
              COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
              (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
       FROM products p
       JOIN product_category_links l ON l.product_id = p.id
       JOIN product_categories c ON c.id = l.category_id
       WHERE p.tenant_id = $1 AND p.status = 'active' AND p.id <> $2
         AND c.slug IN ('ponozky', 'pece-o-boty', 'ksiltovky', 'tricka')
       ORDER BY p.id LIMIT 1`,
      [tenant.id, product.id]
    ).catch(() => []);
    const optionName = (product.options as Array<{ name?: string }> | null)?.[0]?.name ?? "Velikost";
    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-screen bg-white text-[#111]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <Eshop10Detail
            tenantSlug={tenantSlug}
            basePath={`/demo/${tenantSlug}/obchod`}
            currency={displayCurrency}
            shopName={shop.name || "Obchod"}
            crumbs={crumbTrail}
            product={{
              title: product.title,
              subtitle: product.subtitle,
              brand: product.brand,
              description: product.description ? richTextToPlain(product.description) : null,
              isNew: !!(product.flags as { new?: boolean })?.new,
              images: product.images.map((im) => ({ url: im.url, alt: im.alt })),
            }}
            variants={product.variants.map((v) => ({
              id: v.id, title: v.title, price_cents: convertCents(v.price_cents, fx),
              compare_at_price_cents: v.compare_at_price_cents == null ? v.compare_at_price_cents : convertCents(v.compare_at_price_cents, fx),
              stock_qty: v.stock_qty, track_stock: v.track_stock, stock_policy: v.stock_policy, is_default: v.is_default,
            }))}
            optionName={optionName}
            related={relatedProducts.map((r) => ({ slug: r.slug, title: r.title, brand: r.brand, price_cents: convertCents(r.price_cents, fx), image_url: r.image_url }))}
            fitsWith={fitsRows[0] ? { ...fitsRows[0], price_cents: convertCents(fitsRows[0].price_cents, fx) } : null}
          />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
        {/* CartToast záměrně ne — potvrzení řeší pop-up košík (PŘIDÁNO DO KOŠÍKU) */}
        <CookieConsent />
      </div>
    );
  }

  // eshop-14 "Zahradia" — mountfield layout detailu (galerie + buy box,
  // smaragdové CTA, dostupnost e-shop/prodejny, taby, Mohlo by vás zajímat)
  if (chromeKey === "eshop-14") {
    const optionName = (product.options as Array<{ name?: string }> | null)?.[0]?.name ?? "Provedení";
    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-screen bg-white text-[#30363b]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <Eshop14Detail
            tenantSlug={tenantSlug}
            basePath={`/demo/${tenantSlug}/obchod`}
            currency={displayCurrency}
            shopName={shop.name || "Obchod"}
            crumbs={crumbTrail}
            product={{
              title: product.title,
              subtitle: product.subtitle,
              brand: product.brand,
              description: product.description ? richTextToPlain(product.description) : null,
              isNew: !!(product.flags as { new?: boolean })?.new,
              images: product.images.map((im) => ({ url: im.url, alt: im.alt })),
            }}
            variants={product.variants.map((v) => ({
              id: v.id, title: v.title, price_cents: convertCents(v.price_cents, fx),
              compare_at_price_cents: v.compare_at_price_cents == null ? v.compare_at_price_cents : convertCents(v.compare_at_price_cents, fx),
              stock_qty: v.stock_qty, track_stock: v.track_stock, stock_policy: v.stock_policy, is_default: v.is_default,
            }))}
            optionName={optionName}
            related={relatedProducts.map((r) => ({ slug: r.slug, title: r.title, brand: r.brand, price_cents: convertCents(r.price_cents, fx), image_url: r.image_url }))}
          />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
        <CookieConsent />
      </div>
    );
  }

  // eshop-12 "PACKA" — petcenter.cz layout detailu (galerie + pravý sloupec
  // se zeleným dostupnost boxem, balení pills, mango VLOŽIT DO KOŠÍKU,
  // doprava-zdarma progress, taby s recenzemi, 2 doporučovací sekce)
  if (chromeKey === "eshop-12") {
    const es12Related = await query<{ slug: string; title: string; brand: string | null; price_cents: number; image_url: string | null; default_variant_id: number | null }>(
      `SELECT p.slug, p.title, p.brand,
              COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
              (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url,
              (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.is_default DESC, pv.id LIMIT 1) AS default_variant_id
       FROM products p
       WHERE p.tenant_id = $1 AND p.status = 'active' AND p.id <> $2
         AND (p.primary_category_id = $3 OR EXISTS (
           SELECT 1 FROM product_category_links l WHERE l.product_id = p.id AND l.category_id = $3))
       ORDER BY p.id LIMIT 8`,
      [tenant.id, product.id, product.primary_category_id]
    ).catch(() => []);
    const es12Fill = es12Related.length < 8 ? await query<{ slug: string; title: string; brand: string | null; price_cents: number; image_url: string | null; default_variant_id: number | null }>(
      `SELECT p.slug, p.title, p.brand,
              COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
              (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url,
              (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.is_default DESC, pv.id LIMIT 1) AS default_variant_id
       FROM products p
       WHERE p.tenant_id = $1 AND p.status = 'active' AND p.id <> $2 AND p.slug <> ALL($3::text[])
       ORDER BY p.id LIMIT $4`,
      [tenant.id, product.id, es12Related.map(r => r.slug), 8 - es12Related.length]
    ).catch(() => []) : [];
    const es12All = [...es12Related, ...es12Fill];
    const es12OptionName = (product.options as Array<{ name?: string }> | null)?.[0]?.name ?? "Provedení";
    return (
      <div style={{ background: "#fffbf6" }}>
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-screen" style={{ background: "#fffbf6" }}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <Eshop12Detail
            tenantSlug={tenantSlug}
            basePath={`/demo/${tenantSlug}/obchod`}
            currency={displayCurrency}
            shopName={shop.name || "Obchod"}
            crumbs={crumbTrail}
            product={{
              id: product.id,
              title: product.title,
              subtitle: product.subtitle,
              brand: product.brand,
              description: product.description ? richTextToPlain(product.description) : null,
              isNew: !!(product.flags as { new?: boolean })?.new,
              images: product.images.map((im) => ({ url: im.url, alt: im.alt })),
            }}
            variants={product.variants.map((v) => ({
              id: v.id, title: v.title, price_cents: convertCents(v.price_cents, fx),
              compare_at_price_cents: v.compare_at_price_cents == null ? v.compare_at_price_cents : convertCents(v.compare_at_price_cents, fx),
              stock_qty: v.stock_qty, track_stock: v.track_stock, stock_policy: v.stock_policy, is_default: v.is_default,
            }))}
            optionName={es12OptionName}
            related={es12All.map((r) => ({ slug: r.slug, title: r.title, brand: r.brand, price_cents: convertCents(r.price_cents, fx), image_url: r.image_url, default_variant_id: r.default_variant_id }))}
          />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
        {/* CartToast záměrně ne — potvrzení řeší pop-up košík (PŘIDÁNO DO KOŠÍKU) */}
        <CookieConsent />
      </div>
    );
  }

  // eshop-13 "LUNELA" — milagro.cz layout detailu (galerie 2×2, černé CTA,
  // benefit odkazy, tabulka parametrů, Mohlo by se vám také líbit, USP pás)
  if (chromeKey === "eshop-13") {
    const optionName = (product.options as Array<{ name?: string }> | null)?.[0]?.name ?? "Velikost";
    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-screen bg-white text-[#141414]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <Eshop13Detail
            tenantSlug={tenantSlug}
            basePath={`/demo/${tenantSlug}/obchod`}
            currency={displayCurrency}
            shopName={shop.name || "Obchod"}
            crumbs={crumbTrail}
            product={{
              title: product.title,
              subtitle: product.subtitle,
              brand: product.brand,
              description: product.description ? richTextToPlain(product.description) : null,
              isNew: !!(product.flags as { new?: boolean })?.new,
              images: product.images.map((im) => ({ url: im.url, alt: im.alt })),
            }}
            variants={product.variants.map((v) => ({
              id: v.id, title: v.title, price_cents: convertCents(v.price_cents, fx),
              compare_at_price_cents: v.compare_at_price_cents == null ? v.compare_at_price_cents : convertCents(v.compare_at_price_cents, fx),
              stock_qty: v.stock_qty, track_stock: v.track_stock, stock_policy: v.stock_policy, is_default: v.is_default,
            }))}
            optionName={optionName}
            related={relatedProducts.map((r) => ({ slug: r.slug, title: r.title, brand: r.brand, price_cents: convertCents(r.price_cents, fx), image_url: r.image_url }))}
          />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
        {/* CartToast záměrně ne — potvrzení řeší pop-up košík (PŘIDÁNO DO KOŠÍKU) */}
        <CookieConsent />
      </div>
    );
  }

  // eshop-11 "HORAL" — rockpoint.cz layout detailu (galerie + sticky sloupec,
  // zelené CTA, benefit řádky, taby, Podobné produkty)
  if (chromeKey === "eshop-11") {
    const optionName = (product.options as Array<{ name?: string }> | null)?.[0]?.name ?? "Velikost";
    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-screen bg-white text-[#111]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <Eshop11Detail
            tenantSlug={tenantSlug}
            basePath={`/demo/${tenantSlug}/obchod`}
            currency={displayCurrency}
            shopName={shop.name || "Obchod"}
            crumbs={crumbTrail}
            product={{
              title: product.title,
              subtitle: product.subtitle,
              brand: product.brand,
              description: product.description ? richTextToPlain(product.description) : null,
              isNew: !!(product.flags as { new?: boolean })?.new,
              images: product.images.map((im) => ({ url: im.url, alt: im.alt })),
            }}
            variants={product.variants.map((v) => ({
              id: v.id, title: v.title, price_cents: convertCents(v.price_cents, fx),
              compare_at_price_cents: v.compare_at_price_cents == null ? v.compare_at_price_cents : convertCents(v.compare_at_price_cents, fx),
              stock_qty: v.stock_qty, track_stock: v.track_stock, stock_policy: v.stock_policy, is_default: v.is_default,
            }))}
            optionName={optionName}
            related={relatedProducts.map((r) => ({ slug: r.slug, title: r.title, brand: r.brand, price_cents: convertCents(r.price_cents, fx), image_url: r.image_url }))}
          />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
        <CookieConsent />
      </div>
    );
  }

  return (
    <div className="bg-white">
      {chromeKey ? (
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
      ) : (
        <ShopHeader
          tenantSlug={tenantSlug}
          shopName={shop.name || "Obchod"}
          categories={categories.filter((c) => c.is_visible).map((c) => ({
            id: c.id, slug: c.slug, name: c.name, parent_id: c.parent_id, product_count: c.product_count, image_url: c.image_url,
          }))}
          brands={brands}
          activeCategory={null}
          currencySwitcher={addons.has("cizi-meny")}
          localeSwitcher={addons.has("cizi-jazyky")}
        />
      )}
      <main className="min-h-screen bg-white text-[#111]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="mx-auto max-w-[1400px] px-5 py-5">
        {/* Breadcrumbs: Obchod → kategorie → produkt */}
        <nav className="mb-4 flex flex-wrap items-center gap-y-1 text-[12.5px] text-neutral-400">
          <Link href={`/demo/${tenantSlug}/obchod`} className="hover:text-neutral-700 hover:underline">
            Obchod
          </Link>
          {crumbTrail.map((c) => (
            <span key={c.slug} className="flex items-center">
              <svg className="mx-1.5" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              <Link href={`/demo/${tenantSlug}/obchod?kategorie=${c.slug}`} className="hover:text-neutral-700 hover:underline">
                {c.name}
              </Link>
            </span>
          ))}
          <svg className="mx-1.5" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          <span className="font-semibold text-neutral-600">{product.title}</span>
          {isPompo && (
            <span className="ml-auto hidden items-center gap-5 text-[13px] font-semibold text-neutral-700 md:flex">
              <Link href={`/demo/${tenantSlug}/obchod/oblibene`} className="flex items-center gap-1.5 hover:text-neutral-950">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span className="underline underline-offset-2">Přidat mezi oblíbené</span>
              </Link>
              <a href="#hlidaci-pes" className="flex items-center gap-1.5 hover:text-neutral-950">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10 5.2C10 3.4 8.9 2 7.5 2S5 3.4 5 5.2 6.1 8.5 7.5 8.5 10 7 10 5.2zM19 5.2C19 3.4 17.9 2 16.5 2S14 3.4 14 5.2s1.1 3.3 2.5 3.3S19 7 19 5.2zM12 10c-3.5 0-6.5 2.7-6.5 6 0 2 1.3 3.4 3 3.4 1.2 0 2.1-.7 3.5-.7s2.3.7 3.5.7c1.7 0 3-1.4 3-3.4 0-3.3-3-6-6.5-6z"/></svg>
                <span className="underline underline-offset-2">Hlídací pes</span>
              </a>
              <a href="#sdilet" className="flex items-center gap-1.5 hover:text-neutral-950">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
                <span className="underline underline-offset-2">Sdílet</span>
              </a>
            </span>
          )}
        </nav>

        {/* Alza layout: galerie vlevo, vše ostatní vpravo */}
        <div className={isNeroli || isEs09
          ? "grid gap-10 lg:grid-cols-2 lg:gap-14"
          : isBonami
            ? "grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(330px,370px)] lg:gap-12"
            : "grid gap-10 lg:grid-cols-[minmax(360px,440px)_minmax(0,1fr)] lg:gap-12"}>
          {/* Galerie se slevovým badge */}
          <div className="relative min-w-0">
            {!isBonami && addons.has("stitky-v-obrazku") && defaultVariant?.compare_at_price_cents != null && defaultVariant.compare_at_price_cents > defaultVariant.price_cents && (
              <span className="absolute left-4 top-4 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#ffd200] text-[13.5px] font-extrabold text-neutral-950 shadow-md">
                −{Math.round((1 - defaultVariant.price_cents / defaultVariant.compare_at_price_cents) * 100)} %
              </span>
            )}
            {!isBonami && addons.has("stitky-v-obrazku") && (product.flags as { new?: boolean })?.new && (
              <span className="absolute right-4 top-4 z-10 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">Novinka</span>
            )}
            {isBonami && product.images.length > 0 ? (
              <BonamiGallery
                images={product.images.map((im) => ({ url: im.url, alt: im.alt }))}
                title={product.title}
                saleBadge={defaultVariant?.compare_at_price_cents != null && defaultVariant.compare_at_price_cents > defaultVariant.price_cents
                  ? `−${Math.round((1 - defaultVariant.price_cents / defaultVariant.compare_at_price_cents) * 100)} % s kódem`
                  : null}
              />
            ) : product.images.length > 0 ? (
              <ProductGallery
                images={product.images}
                title={product.title}
                enableZoom={!!(shop.settings as { gallery_zoom?: boolean })?.gallery_zoom}
                enableArrows={!!(shop.settings as { gallery_arrows?: boolean })?.gallery_arrows}
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl bg-neutral-100 text-[13px] text-neutral-300">
                Bez fotky
              </div>
            )}
          </div>

          {/* Pravý sloupec: značka, titulek, hodnocení, popis, cena, CTA */}
          <div className={isBonami ? "min-w-0 lg:sticky lg:top-[120px] lg:self-start" : "min-w-0"}>
            <div className={`flex items-start justify-between gap-4 ${isPompo || isOreskarna || isNeroli || isBonami || isEs09 ? "hidden" : ""}`}>
              {product.brand ? (
                <Link href={`/demo/${tenantSlug}/obchod?znacka=${encodeURIComponent(product.brand)}`} className="text-[13px] font-semibold text-neutral-500 underline-offset-2 hover:text-neutral-950 hover:underline">
                  Vše od {product.brand}
                </Link>
              ) : <span />}
              {addons.has("socialni-site") && <SocialShare url={canonical} title={product.title} />}
            </div>

            {isOreskarna && (
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="rounded-lg px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#1d1d1b]" style={{ background: "#f6c500" }}>
                  Dárek od 1 499 Kč
                </span>
                {defaultVariant?.sku && <span className="text-[12.5px] font-medium text-neutral-400">Kód: {defaultVariant.sku}</span>}
              </div>
            )}
            {isBonami && (
              <div className="mb-1 flex items-center justify-between gap-3">
                {product.brand ? (
                  <Link href={`/demo/${tenantSlug}/obchod?znacka=${encodeURIComponent(product.brand)}`} className="text-[13.5px] font-bold text-neutral-900 underline underline-offset-4 hover:text-[#3d9a50]">
                    {product.brand}
                  </Link>
                ) : <span />}
                {defaultVariant?.sku && <span className="text-[12px] font-medium text-neutral-400">ID {defaultVariant.sku}</span>}
              </div>
            )}
            {isEs09 && (
              <div className="mb-1">
                {product.brand && (
                  <Link href={`/demo/${tenantSlug}/obchod?znacka=${encodeURIComponent(product.brand)}`} className="text-[13px] font-bold uppercase tracking-wide text-[#8b949c] hover:text-[#3ce0a6]">
                    {product.brand}
                  </Link>
                )}
              </div>
            )}
            {isNeroli && (
              <div className="mb-1 flex items-center justify-between gap-3">
                {product.brand ? (
                  <Link href={`/demo/${tenantSlug}/obchod?znacka=${encodeURIComponent(product.brand)}`} className="text-[14px] font-extrabold text-neutral-950 underline underline-offset-4 hover:text-[#14a99a]">
                    {product.brand}
                  </Link>
                ) : <span />}
                <Link href={`/demo/${tenantSlug}/obchod/oblibene`} aria-label="Přidat mezi oblíbené" className="text-neutral-400 transition hover:text-[#e84393]">
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </Link>
              </div>
            )}
            <h1 className={`mt-1.5 text-[25px] font-extrabold leading-tight tracking-tight text-neutral-950 sm:text-[28px] ${isNeroli ? "uppercase tracking-[0.02em] !text-[32px] sm:!text-[42px]" : ""}`}>{product.title}</h1>
            {isNeroli && (
              <>
                {product.subtitle && <p className="mt-2 text-[16px] font-medium text-neutral-500">{product.subtitle}</p>}
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1.5">
                    <span className="flex items-center gap-0.5" aria-label="Hodnocení">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <svg key={st} width="18" height="18" viewBox="0 0 20 20" fill={st <= Math.round((43 + ((product.id * 37) % 7)) / 10) ? "#16161d" : "#e8e9ed"}><path d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.5L10 13.4l-4.94 2.71.94-5.5-4-3.9 5.61-.87L10 1z" /></svg>
                      ))}
                    </span>
                    <span className="text-[16px] font-extrabold text-neutral-950">{((43 + ((product.id * 37) % 7)) / 10).toFixed(1).replace(".", ",")}</span>
                    <span className="text-[15px] text-neutral-700 underline underline-offset-2">({7 + ((product.id * 53) % 180)}× hodnoceno)</span>
                  </span>
                  {defaultVariant?.sku && <span className="text-[14px] font-medium text-neutral-400">Kód: {defaultVariant.sku}</span>}
                </div>
              </>
            )}

            {isPompo && defaultVariant?.sku && (
              <p className="mt-1.5 text-[13px] text-neutral-500">Katalogové číslo {defaultVariant.sku}</p>
            )}

            {/* eshop-08: subtitle + bonami cena „s kódem / bez kódu" + promo box */}
            {isBonami && product.subtitle && (
              <p className="mt-1.5 text-[14px] font-medium text-neutral-500">{product.subtitle}</p>
            )}
            {isBonami && defaultVariant && (() => {
              const compare = defaultVariant.compare_at_price_cents;
              const onSale = compare != null && compare > defaultVariant.price_cents;
              return (
                <div className="mt-4">
                  <p className="flex flex-wrap items-baseline gap-2.5">
                    <span className={`text-[30px] font-extrabold leading-none tabular-nums ${onSale ? "text-[#d64541]" : "text-neutral-950"}`}>
                      {price(defaultVariant.price_cents)}
                    </span>
                    {onSale && <span className="text-[13px] font-bold text-[#d64541]">s kódem</span>}
                  </p>
                  {onSale && compare != null && (
                    <p className="mt-1 text-[13.5px] font-medium text-neutral-400">
                      <span className="line-through">{price(compare)}</span> bez kódu
                    </p>
                  )}
                  {onSale && addons.has("promo-kod-detail") && (
                    <PromoCodeAdd
                      tenantSlug={tenantSlug}
                      variantId={defaultVariant.id}
                      code="LETO15"
                      title="Sleva 15 % s kódem LETO15"
                      subtitle="Platí jen dnes na vybrané kolekce"
                    />
                  )}
                </div>
              );
            })()}

            {addons.has("hodnoceni-produktu") && totalReviews > 0 && (
              <a href="#hodnoceni" className="group mt-2.5 inline-flex items-center gap-2">
                <span className="flex items-center gap-0.5" aria-label={`Hodnocení ${avgRating.toFixed(1)} z 5`}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={avgRating >= s - 0.25 ? "#f59e0b" : "#e5e5e5"}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8z" /></svg>
                  ))}
                </span>
                <span className="text-[14.5px] font-extrabold tabular-nums text-neutral-950">{avgRating.toFixed(1).replace(".", ",")}</span>
                <span className="text-[13px] text-neutral-400 underline underline-offset-2 group-hover:text-neutral-700">{totalReviews} hodnocení</span>
              </a>
            )}

            {!isPompo && !isOreskarna && !isNeroli && !isEs09 && (product.subtitle || product.description) && (
              <div className="mt-2.5">
                <p className="line-clamp-2 text-[14px] leading-[1.65] text-neutral-600">
                  {product.subtitle ? `${product.subtitle} — ` : ""}{product.description ? richTextToPlain(product.description) : ""}
                </p>
                <a href="#popis" className="mt-1.5 inline-block text-[13px] font-semibold text-neutral-500 underline underline-offset-2 hover:text-neutral-950">
                  Zobrazit celý popis
                </a>
              </div>
            )}

            {/* eshop-06: lead odstavec + ✓ benefity (svetplodu) */}
            {isOreskarna && (
              <div className="mt-3">
                {product.subtitle && (
                  <p className="text-[14.5px] leading-[1.7] text-neutral-600">
                    {product.subtitle}. {product.description ? richTextToPlain(product.description).split(". ").slice(1, 3).join(". ") : ""}
                  </p>
                )}
                <ul className="mt-3.5 space-y-1.5">
                  {["Pražíme a balíme ručně v malých šaržích", "Osobní odběr na prodejnách zdarma", "Vrácení do 30 dnů bez udání důvodu"].map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-[13.5px] font-semibold text-neutral-800">
                      <svg className="flex-shrink-0" width="17" height="17" viewBox="0 0 24 24" fill="#21a95c"><circle cx="12" cy="12" r="11" /><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dostupnost + doručení (Alza box, kompaktní) */}
            {!isPompo && !isOreskarna && !isNeroli && !isBonami && !isEs09 && (
            <div className="mt-4 rounded-xl bg-neutral-50 px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {inStock ? (
                  <>
                    <span className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" style={{ animationDuration: "2.4s" }} />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span className="text-[13.5px] font-bold text-emerald-600">Skladem &gt; 5 ks</span>
                    </span>
                    <span className="text-[12.5px] text-neutral-500">Doručení i výdejní místa <strong className="text-neutral-900">zítra</strong></span>
                    <span className="text-[12.5px] text-neutral-500">Doprava zdarma <strong className="text-emerald-600">od 1 500 Kč</strong></span>
                    {purchasedThisWeek > 0 && (
                      <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-orange-600">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4-1.5 6-3 8-1.4 1.9-2 3.5-2 5.5A5.5 5.5 0 0 0 12.5 21 5.5 5.5 0 0 0 18 15.5c0-1.8-.6-3.3-1.6-4.9-.4 1.5-1.2 2.4-2.4 2.9.6-2.7-.3-6.6-2-9.5z" /></svg>
                        Tento týden zakoupilo {purchasedThisWeek} lidí
                      </span>
                    )}
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    <span className="text-[13.5px] font-bold text-orange-500">Momentálně nedostupné</span>
                  </span>
                )}
              </div>
            </div>
            )}

            {/* eshop-05: pompo cena — červená velká + DMOC přeškrtnuté s tečkovaným podtržením */}
            {isPompo && defaultVariant && (() => {
              const compare = defaultVariant.compare_at_price_cents;
              const onSale = compare != null && compare > defaultVariant.price_cents;
              return (
                <div className="mt-4">
                  <p className="flex items-baseline gap-2">
                    <span className="text-[30px] font-black leading-none tabular-nums" style={{ color: "#ff3b5c" }}>
                      {price(defaultVariant.price_cents)}
                    </span>
                    <span className="group relative inline-flex cursor-help">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
                      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-[260px] -translate-x-1/2 rounded-lg bg-neutral-900 px-4 py-3 text-[12px] font-semibold leading-relaxed text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
                        Uvedená cena platí pouze pro nákup v e-shopu. Cena v prodejnách se může lišit. DMOC = doporučená maloobchodní cena výrobce.
                        <span className="absolute left-1/2 top-full -translate-x-1/2 border-[6px] border-transparent border-t-neutral-900" />
                      </span>
                    </span>
                  </p>
                  {onSale && compare != null && (
                    <p className="mt-1 text-[13px] font-semibold text-neutral-500">
                      <span style={{ borderBottom: "1px dotted #94a3b8" }}>DMOC: <span className="line-through">{price(compare)}</span></span>
                    </p>
                  )}
                </div>
              );
            })()}

            {/* eshop-07: velká ink cena + unit řádek (kosmetika-zdravi) */}
            {isNeroli && defaultVariant && (() => {
              const compare = defaultVariant.compare_at_price_cents;
              const onSale = compare != null && compare > defaultVariant.price_cents;
              return (
                <div className="mt-6">
                  <p className="flex flex-wrap items-baseline gap-3">
                    {onSale && compare != null && (
                      <span className="text-[19px] font-semibold text-neutral-400 line-through tabular-nums">{price(compare)}</span>
                    )}
                    <span className={`text-[42px] font-extrabold leading-none tabular-nums ${onSale ? "text-[#e84393]" : "text-neutral-950"}`}>
                      {price(defaultVariant.price_cents)}
                    </span>
                  </p>
                  <p className="mt-2.5 text-[15px] font-medium text-neutral-500">
                    včetně DPH | bez dopravy
                    {(() => {
                      const m = (defaultVariant.title ?? "").match(/(\d+(?:[.,]\d+)?)\s*ml/i);
                      if (!m) return null;
                      const liters = parseFloat(m[1].replace(",", ".")) / 1000;
                      if (!liters) return null;
                      const perL = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: shop.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(defaultVariant.price_cents / 100 / liters);
                      return <> | {perL} / l</>;
                    })()}
                  </p>
                </div>
              );
            })()}

            {/* Cena (Alza pattern: badge nad cenovým boxem + bez DPH) — šablony s vlastním chrome (Disco) ukazují cenu přímo v nákupním řádku */}
            {/* eshop-06: „Vaše cena" — velká charcoal cena + přeškrtnutá původní */}
            {isOreskarna && defaultVariant && (() => {
              const compare = defaultVariant.compare_at_price_cents;
              const onSale = compare != null && compare > defaultVariant.price_cents;
              return (
                <div className="mt-5 flex items-baseline gap-3">
                  <span className="text-[13px] font-semibold text-neutral-500">Vaše cena</span>
                  <span className="text-[32px] font-extrabold leading-none tabular-nums text-[#1d1d1b]" style={{ fontFamily: "'Archivo','Helvetica Neue',Arial,sans-serif" }}>
                    {price(defaultVariant.price_cents)}
                  </span>
                  {onSale && compare != null && (
                    <span className="text-[15px] font-semibold text-neutral-400 line-through tabular-nums">{price(compare)}</span>
                  )}
                </div>
              );
            })()}

            {/* eshop-09: mp.cz DNA — skladem badge, velká cena, Kód, financování, výkup banner */}
            {isEs09 && defaultVariant && (() => {
              const compare = defaultVariant.compare_at_price_cents;
              const onSale = compare != null && compare > defaultVariant.price_cents;
              const pct = onSale ? Math.round((1 - defaultVariant.price_cents / compare) * 100) : 0;
              return (
                <>
                  {product.subtitle && <p className="mt-2 text-[14.5px] leading-relaxed text-[#8b949c]">{product.subtitle}</p>}
                  {/* Skladem badge */}
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-2 border-b-2 pb-1" style={{ borderColor: inStock ? "#76ad00" : "#e00000" }}>
                      <span className="relative flex h-2 w-2">
                        {inStock && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: "#76ad00", animationDuration: "2.4s" }} />}
                        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: inStock ? "#76ad00" : "#e00000" }} />
                      </span>
                      <span className="text-[14px] font-bold" style={{ color: inStock ? "#76ad00" : "#e00000" }}>
                        {inStock ? "Skladem > 5 ks" : "Nedostupné"}
                      </span>
                    </span>
                    {inStock && (
                      <p className="mt-1.5 text-[13px] text-[#8b949c]">
                        U vás v <strong className="text-[#232a30]">středu 16. 7.</strong> · Do 30 minut na <Link href={`/demo/${tenantSlug}/kontakt`} className="underline underline-offset-2 hover:text-[#3ce0a6]">prodejně</Link> nebo kurýrem zítra · Doprava zdarma
                      </p>
                    )}
                  </div>
                  {/* Cena */}
                  <div className="mt-5">
                    <p className="flex flex-wrap items-baseline gap-3">
                      <span className={`text-[38px] font-extrabold leading-none tabular-nums ${onSale ? "text-[#e00000]" : "text-[#232a30]"}`} style={{ fontFamily: "'Archivo','Helvetica Neue',Arial,sans-serif" }}>
                        {price(defaultVariant.price_cents)}
                      </span>
                      {onSale && compare != null && (
                        <span className="text-[16px] font-semibold text-[#8b949c] line-through tabular-nums">{price(compare)}</span>
                      )}
                      {onSale && <span className="rounded-full px-2.5 py-0.5 text-[12px] font-extrabold text-white" style={{ backgroundColor: "#e00000" }}>−{pct} %</span>}
                    </p>
                    {onSale && compare != null && (
                      <p className="mt-1 text-[13px] font-semibold" style={{ color: "#e00000" }}>
                        Ušetříte {price(compare - defaultVariant.price_cents)}
                      </p>
                    )}
                    <p className="mt-1.5 text-[12.5px] text-[#8b949c]">
                      od {price(Math.round(defaultVariant.price_cents / 24))} Kč/měsíc
                    </p>
                  </div>
                  {/* Kód */}
                  {defaultVariant.sku && (
                    <p className="mt-3 text-[12px] text-[#8b949c]">Kód: <span className="font-semibold text-[#232a30]">{defaultVariant.sku}</span></p>
                  )}
                  {/* Možnosti financování */}
                  <div className="mt-5">
                    <p className="flex items-center gap-2 text-[15px] font-extrabold text-[#232a30]">
                      Možnosti financování
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="#3ce0a6"><path d="M10 1l1.5 3.1 3.4.4-2.5 2.3.7 3.3L10 8.4l-3.1 1.7.7-3.3L5.1 4.5l3.4-.4L10 1z"/><path d="M10 11l1.5 3.1 3.4.4-2.5 2.3.7 3.3L10 18.4l-3.1 1.7.7-3.3L5.1 14.5l3.4-.4L10 11z" opacity=".5"/></svg>
                    </p>
                    <div className="mt-2.5 divide-y divide-[#e8e9eb] rounded-xl border" style={{ borderColor: "#e8e9eb" }}>
                      {[
                        { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3ce0a6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 10h20"/></svg>, label: "Pronájem", sub: null },
                        { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#232a30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, label: "Na splátky", sub: null },
                        { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#232a30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, label: "Na čtvrtiny", sub: "4 měsíční splátky" },
                      ].map((f) => (
                        <div key={f.label} className="flex items-center gap-3 px-4 py-3">
                          <span className="flex-shrink-0">{f.icon}</span>
                          <div>
                            <p className="text-[14px] font-bold text-[#232a30]">{f.label}</p>
                            {f.sub && <p className="text-[12.5px] text-[#8b949c]">{f.sub}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Výkup banner */}
                  <div className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: "#f5f6f7" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3ce0a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                    <div>
                      <p className="text-[14px] font-extrabold text-[#232a30]">Vykoupíme vaše zařízení</p>
                      <p className="text-[12.5px] text-[#8b949c]">Prodejte nám své staré zařízení a získejte slevu na nové.</p>
                    </div>
                  </div>
                </>
              );
            })()}

            {!isPompo && !isOreskarna && !isNeroli && !isBonami && !isEs09 && chromeKey !== "eshop-03" && chromeKey !== "eshop-04" && defaultVariant && (() => {
              const compare = defaultVariant.compare_at_price_cents;
              const onSale = compare != null && compare > defaultVariant.price_cents;
              const isNew = !!(product.flags as { new?: boolean })?.new;
              const pct = onSale ? Math.round((1 - defaultVariant.price_cents / compare) * 100) : 0;
              return (
                <div className="mt-3.5 inline-block min-w-[220px]">
                  {onSale ? (
                    <span className="block w-full rounded-t-lg bg-[#ffd200] px-4 py-1.5 text-center text-[11.5px] font-extrabold uppercase tracking-wide text-neutral-950">
                      Zlevněno −{pct} %
                    </span>
                  ) : isNew ? (
                    <span className="block w-full rounded-t-lg bg-blue-700 px-4 py-1.5 text-center text-[11.5px] font-extrabold uppercase tracking-wide text-white">
                      Novinka
                    </span>
                  ) : null}
                  <div className={`flex flex-wrap items-baseline justify-center gap-3 px-5 py-2.5 ${
                    onSale ? "rounded-b-lg bg-red-600 text-white" : isNew ? "rounded-b-lg bg-blue-50" : "rounded-lg bg-neutral-100"
                  }`}>
                    <span className={`text-[27px] font-extrabold leading-none tabular-nums ${onSale ? "text-white" : "text-neutral-950"}`}>
                      {price(defaultVariant.price_cents)}
                    </span>
                    {onSale && compare != null && (
                      <span className="text-[15px] text-white/70 line-through tabular-nums">{price(compare)}</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-center text-[12px] text-neutral-400">
                    bez DPH {price(Math.round(defaultVariant.price_cents / 1.21))}
                    {onSale && compare != null && (
                      <span className="ml-2 font-semibold text-red-600">Ušetříte {price(compare - defaultVariant.price_cents)}</span>
                    )}
                  </p>
                  {addons.has("odpocet-akce") && onSale && <SaleCountdown />}
                </div>
              );
            })()}

            {/* CTA */}
            <div className="mt-3.5 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                {inStock ? (
                  <AddToCart
                    showPrice={chromeKey === "eshop-03" || chromeKey === "eshop-04"}
                    hideQty={isPompo}
                    ctaLabel={isNeroli
                      ? `Vložit do košíku${crumbTrail.some((cc) => cc.slug.startsWith("vune") || cc.slug === "niche-kolekce") ? " parfém" : ""}`
                      : isOreskarna ? "Vložit do košíku" : isBonami ? "Do košíku" : undefined}
                    variantTiles={isNeroli}
                    size={isNeroli ? "lg" : undefined}
                    tenantSlug={tenantSlug}
                    currency={displayCurrency}
                    productTitle={product.title}
                    productImage={mainImage?.url ?? undefined}
                    variants={product.variants.map((v) => ({
                      id: v.id,
                      title: v.title,
                      price_cents: convertCents(v.price_cents, fx),
                      compare_at_price_cents: v.compare_at_price_cents != null ? convertCents(v.compare_at_price_cents, fx) : null,
                      stock_qty: v.stock_qty,
                      track_stock: v.track_stock,
                      stock_policy: v.stock_policy,
                      is_default: v.is_default,
                    }))}
                    maxPerOrder={addons.has("min-max") ? 10 : null}
                  />
                ) : defaultVariant && addons.has("hlidaci-pes") ? (
                  <BackInStockNotify tenantSlug={tenantSlug} variantId={defaultVariant.id} />
                ) : (
                  <p className="rounded-lg bg-neutral-100 px-4 py-3 text-[14px] font-semibold text-neutral-500">
                    Produkt je momentálně vyprodaný.
                  </p>
                )}
              </div>
              {addons.has("oblibene-produkty") && <WishlistButton tenantSlug={tenantSlug} productId={product.id} />}
              {addons.has("porovnavac") && <CompareButton tenantSlug={tenantSlug} productSlug={product.slug} />}
            </div>

            {/* eshop-08: bonami — Zaplatím na třetiny + doručení Osobní odběr / Na adresu */}
            {isBonami && (
              <>
                <p className="mt-3.5 flex items-center gap-2 text-[13px] font-semibold text-neutral-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3d9a50" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M7 15h4"/></svg>
                  Zaplatím na třetiny bez navýšení
                </p>
                <p className="mt-4 text-[14.5px] font-extrabold" style={{ color: inStock ? "#3d9a50" : "#94a3b8" }}>
                  {inStock ? "Skladem — doručíme již zítra" : "Momentálně vyprodáno"}
                </p>
                <div className="mt-2.5 overflow-hidden rounded-xl border" style={{ borderColor: "#e6e6e3" }}>
                  {[
                    {
                      icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                      name: "Osobní odběr",
                      meta: <>Od <strong className="text-neutral-900">99 Kč</strong> · Od <strong className="text-neutral-900">zítra</strong></>,
                    },
                    {
                      icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6h13v11H1zM14 9h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="1.9"/><circle cx="17.5" cy="18.5" r="1.9"/></svg>,
                      name: "Doručení na adresu",
                      meta: <>Od <strong className="text-neutral-900">549 Kč</strong> · Od <strong className="text-neutral-900">zítra</strong></>,
                    },
                  ].map((row, i) => (
                    <div key={row.name} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: "#e6e6e3" }}>
                      <span className="flex-shrink-0">{row.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-bold text-neutral-900">{row.name}</p>
                        <p className="text-[12.5px] text-neutral-500">{row.meta}</p>
                      </div>
                      <Link href={`/demo/${tenantSlug}/vse-o-nakupu`} className="text-[11.5px] font-extrabold tracking-wide text-neutral-500 underline underline-offset-2 hover:text-neutral-900">VÍCE</Link>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* eshop-07: box výhod (kosmetika-zdravi) — skladem/expedice/parfumerie/autorizovaný prodejce */}
            {isNeroli && (
              <div className="mt-6 rounded-2xl bg-[#f4f5f7] px-6 py-2">
                {[
                  {
                    icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={inStock ? "#14a99a" : "#94a3b8"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>,
                    text: inStock
                      ? (() => {
                          const d = new Date(Date.now() + 86400000);
                          const wd = new Intl.DateTimeFormat("cs-CZ", { weekday: "long" }).format(d);
                          const prep = /^[sč]/.test(wd) ? "ve" : "v";
                          return (
                            <>
                              <strong className="block text-[15px] font-bold text-[#14a99a]">skladem &gt; 5 ks</strong>
                              <span className="underline underline-offset-2">Ihned k odeslání od 49 Kč</span>, u vás doma již {prep} {wd} {d.getDate()}. {d.getMonth() + 1}.
                            </>
                          );
                        })()
                      : <strong className="text-neutral-400">momentálně vyprodáno</strong>,
                  },
                  {
                    icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#16161d" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6h13v11H1zM14 9h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="1.9"/><circle cx="17.5" cy="18.5" r="1.9"/></svg>,
                    text: <>Doprava zdarma od <strong>2 490,00 Kč</strong>.</>,
                  },
                  {
                    icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#16161d" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
                    text: <>Rodinná parfumerie — <strong>rádi poradíme</strong> s výběrem vůně i péče.</>,
                  },
                  {
                    icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#16161d" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="6"/><path d="M8.5 14.2L7 22l5-3 5 3-1.5-7.8"/><path d="M9.7 9l1.6 1.6L14.4 7.5"/></svg>,
                    text: <>Autorizovaný prodejce — <strong>Maison Noé, SILLAGE, Velvetier</strong> a další.</>,
                  },
                ].map((row, i) => (
                  <div key={i} className={`flex items-start gap-4 py-4 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: "#e3e4e8" }}>
                    <span className="mt-0.5 flex-shrink-0">{row.icon}</span>
                    <p className="text-[15px] leading-relaxed text-neutral-800">{row.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* eshop-05: pompo box dostupnosti — ohraničená karta, online + prodejna */}
            {isPompo && (
              <div className="mt-5 rounded-lg border px-5 py-4" style={{ borderColor: "#e7eaee" }}>
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={inStock ? "#12b76a" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round"><path d="M1 4h13v12H1zm13 4h4l3 3v5h-7zM5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>
                  <div>
                    <p className="text-[14px] font-extrabold" style={{ color: inStock ? "#12b76a" : "#94a3b8" }}>
                      {inStock ? "Skladem pro online nákup" : "Momentálně nedostupné online"}
                    </p>
                    {inStock && (
                      <p className="mt-0.5 text-[13px] text-neutral-600">
                        Ihned k odeslání <strong className="text-neutral-900">od 95 Kč</strong>, u vás doma již <strong className="text-neutral-900">zítra</strong>.
                      </p>
                    )}
                    <Link href={`/demo/${tenantSlug}/doprava-a-platba`} className="mt-1 inline-block text-[13px] font-semibold text-neutral-700 underline underline-offset-2 hover:text-neutral-950">
                      Možnosti dopravy
                    </Link>
                  </div>
                </div>
                <div className="my-3.5 border-t" style={{ borderColor: "#e7eaee" }} />
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <div>
                    <p className="text-[13.5px] font-bold text-neutral-500">
                      {inStock ? "Dostupné ve vaší prodejně" : "Ve vaší prodejně není dostupné"}
                    </p>
                    <p className="mt-0.5 text-[13.5px] font-extrabold text-neutral-900">Hračkolandia Praha</p>
                    <Link href={`/demo/${tenantSlug}/kontakt`} className="mt-1 inline-block text-[13px] font-semibold text-neutral-700 underline underline-offset-2 hover:text-neutral-950">
                      Dostupné v dalších prodejnách
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* eshop-05: věrnostní body (pompo) */}
            {isPompo && defaultVariant && (
              <div className="mt-4 flex items-start gap-3 px-1">
                <svg className="mt-0.5 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0e1b2c" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.2l5.4-.8L12 2.5z"/></svg>
                <p className="text-[13px] leading-relaxed text-neutral-600">
                  <strong className="text-neutral-900">Za nákup tohoto zboží získáte {Math.max(1, Math.round(defaultVariant.price_cents / 3000))} bodů do věrnostního programu.</strong>{" "}
                  Máte rádi výhody? <Link href={`/demo/${tenantSlug}/o-nas`} className="underline underline-offset-2 hover:text-neutral-950">Vytvořte si účet</Link>, sbírejte body a proměňte je ve slevy a další skvělé odměny.
                </p>
              </div>
            )}

            {/* eshop-06: ohraničený box dostupnosti (svetplodu) */}
            {isOreskarna && (
              <div className="mt-5 rounded-xl border px-5 py-4" style={{ borderColor: "#eceae6" }}>
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={inStock ? "#21a95c" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round"><path d="M1 4h13v12H1zm13 4h4l3 3v5h-7zM5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>
                  <div>
                    <p className="text-[14px] font-extrabold" style={{ color: inStock ? "#21a95c" : "#94a3b8" }}>
                      {inStock ? "Skladem pro online nákup" : "Momentálně nedostupné online"}
                    </p>
                    {inStock && (
                      <p className="mt-0.5 text-[13px] text-neutral-600">
                        Odesíláme <strong className="text-neutral-900">do 24 hodin</strong>, doprava <strong className="text-neutral-900">od 29 Kč</strong>, zdarma od 1 999 Kč.
                      </p>
                    )}
                    <Link href={`/demo/${tenantSlug}/doprava-a-platba`} className="mt-1 inline-block text-[13px] font-semibold text-neutral-700 underline underline-offset-2 hover:text-neutral-950">
                      Možnosti dopravy
                    </Link>
                  </div>
                </div>
                <div className="my-3.5 border-t" style={{ borderColor: "#eceae6" }} />
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <div>
                    <p className="text-[13.5px] font-bold text-neutral-500">{inStock ? "K vyzkoušení a nákupu na prodejně" : "Na prodejně není dostupné"}</p>
                    <p className="mt-0.5 text-[13.5px] font-extrabold text-neutral-900">Ořeškárna Praha — Vinohrady</p>
                    <Link href={`/demo/${tenantSlug}/kontakt`} className="mt-1 inline-block text-[13px] font-semibold text-neutral-700 underline underline-offset-2 hover:text-neutral-950">
                      Všechny prodejny
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className={`mt-5 flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-neutral-500 ${isPompo || isOreskarna || isNeroli || isBonami || isEs09 ? "hidden" : "flex"}`}>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
                Vrácení do 30 dnů
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
                Záruka 24 měsíců
              </span>
              {defaultVariant?.sku && (
                <span className="ml-auto text-neutral-400">Kód: <span className="font-semibold text-neutral-500">{defaultVariant.sku}</span></span>
              )}
            </div>
          </div>
        </div>

        {/* Záložky */}
        <nav className={`mt-14 gap-1 overflow-x-auto border-b border-neutral-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isPompo || isOreskarna || isNeroli || isBonami || isEs09 ? "hidden" : "flex"}`}>
          <a href="#popis" className="-mb-px whitespace-nowrap border-b-2 border-neutral-950 px-4 py-3 text-[13.5px] font-bold text-neutral-950">
            Popis a parametry
          </a>
          {addons.has("hodnoceni-produktu") && (
            <a href="#hodnoceni" className="-mb-px whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-[13.5px] font-semibold text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-950">
              Hodnocení{totalReviews > 0 ? ` (${totalReviews})` : ""}
            </a>
          )}
          {addons.has("diskuze") && (
            <a href="#diskuze" className="-mb-px whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-[13.5px] font-semibold text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-950">
              Diskuze
            </a>
          )}
          {relatedProducts.length > 0 && (
            <a href="#souvisejici" className="-mb-px whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-[13.5px] font-semibold text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-950">
              Podobné produkty
            </a>
          )}
        </nav>

        {/* Popis + parametry — pompo: popis vlevo + Parametry karta vpravo */}
        <div className={isPompo || isOreskarna || isNeroli || isBonami || isEs09 ? "grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start" : "max-w-[860px]"}>
          {product.description && (
            <section id="popis" className="mt-14 scroll-mt-36">
              <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-950">{isNeroli ? "Popis produktu" : isPompo || isOreskarna ? product.title : "Popis produktu"}</h2>
              {isNeroli && crumbTrail.some((cc) => cc.slug.startsWith("vune") || cc.slug === "niche-kolekce" || cc.slug === "vzorky-a-miniatury") && (() => {
                const HEADS = ["bergamot, růžový pepř", "hořký pomeranč, mandarinka", "citron, zelené jablko", "levandule, kardamom"];
                const HEARTS = ["neroli, jasmín, mořská sůl", "růže, pivoňka, fialka", "santal, kardamom, čaj", "iris, heliotrop, muškát"];
                const BASES = ["bílé pižmo, cedr, ambra", "vanilka, tonka, pačuli", "vetiver, dubový mech, kůže", "kašmírové dřevo, benzoin"];
                const i = product.id % 4;
                return (
                  <div className="mt-5 grid gap-5 sm:grid-cols-3">
                    {[["Hlava", HEADS[i]], ["Srdce", HEARTS[(i + 1) % 4]], ["Základ", BASES[(i + 2) % 4]]].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-neutral-950">{k}</p>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#14a99a]">{v}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div
                className={[
                  "mt-4 flow-root text-[15px] leading-[1.75] text-neutral-700",
                  "[&>*:first-child]:mt-0",
                  // obtékané obrázky (Alza-style): data-align="left|right"
                  "[&_img[data-align=left]]:float-left [&_img[data-align=left]]:mr-7 [&_img[data-align=left]]:mb-3 [&_img[data-align=left]]:!w-[42%] [&_img[data-align=left]]:!mt-2",
                  "[&_img[data-align=right]]:float-right [&_img[data-align=right]]:ml-7 [&_img[data-align=right]]:mb-3 [&_img[data-align=right]]:!w-[42%] [&_img[data-align=right]]:!mt-2",
                  "[&_h2]:clear-both [&_hr]:clear-both",
                  "[&_h2]:mt-9 [&_h2]:text-[20px] [&_h2]:font-extrabold [&_h2]:leading-snug [&_h2]:tracking-tight [&_h2]:text-neutral-950",
                  "[&_h3]:mt-7 [&_h3]:text-[16.5px] [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-neutral-950",
                  "[&_h4]:mt-5 [&_h4]:text-[15px] [&_h4]:font-bold [&_h4]:text-neutral-950",
                  "[&_p]:mt-4",
                  "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul_li]:mt-1.5 [&_ul_li]:pl-1 [&_ul_li]:marker:text-neutral-400",
                  "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol_li]:mt-1.5 [&_ol_li]:pl-1 [&_ol_li]:marker:font-semibold [&_ol_li]:marker:text-neutral-500",
                  "[&_strong]:font-bold [&_strong]:text-neutral-900 [&_b]:font-bold [&_b]:text-neutral-900",
                  "[&_a]:font-medium [&_a]:text-neutral-900 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-neutral-600",
                  "[&_img]:mt-7 [&_img]:w-full [&_img]:rounded-2xl",
                  "[&_figure]:mt-7 [&_figure_img]:mt-0 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-[12.5px] [&_figcaption]:text-neutral-400",
                  "[&_blockquote]:mt-4 [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-neutral-600",
                  "[&_hr]:my-9 [&_hr]:border-neutral-100",
                  "[&_table]:mt-5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[14px]",
                  "[&_th]:border-b [&_th]:border-neutral-200 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-neutral-500",
                  "[&_td]:border-b [&_td]:border-neutral-100 [&_td]:px-3 [&_td]:py-2",
                ].join(" ")}
                dangerouslySetInnerHTML={{ __html: descriptionToHtml(product.description) }}
              />
            </section>
          )}

          {productParams.length > 0 && (
            <section id="parametry" className="mt-12 scroll-mt-36">
              <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-950">Parametry</h2>
              <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-100">
                <table className="w-full text-[14px]">
                  <tbody>
                    {productParams.map((pp, i) => (
                      <tr key={pp.id} className={i % 2 === 0 ? "bg-neutral-50/70" : "bg-white"}>
                        <th scope="row" className="w-[42%] px-5 py-3 text-left font-semibold text-neutral-500">
                          {pp.name}
                        </th>
                        <td className="px-5 py-3 font-medium text-neutral-900">
                          {pp.value}{pp.unit && !pp.value.trim().endsWith(pp.unit) ? ` ${pp.unit}` : ""}
                        </td>
                      </tr>
                    ))}
                    {defaultVariant?.sku && (
                      <tr className={productParams.length % 2 === 0 ? "bg-neutral-50/70" : "bg-white"}>
                        <th scope="row" className="w-[42%] px-5 py-3 text-left font-semibold text-neutral-500">Kód produktu</th>
                        <td className="px-5 py-3 font-medium text-neutral-900">{defaultVariant.sku}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* eshop-05: Najdete v těchto kategoriích (pompo chips) */}
              {isPompo && (crumbTrail.length > 0 || product.brand) && (
                <div className="mt-8">
                  <h3 className="text-[17px] font-extrabold text-neutral-950">Najdete v těchto kategoriích</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {crumbTrail.map((c) => (
                      <Link key={c.slug} href={`/demo/${tenantSlug}/obchod?kategorie=${c.slug}`}
                        className="rounded bg-neutral-100 px-3 py-1.5 text-[12.5px] font-bold text-neutral-800 transition hover:bg-neutral-200">
                        {c.name}
                      </Link>
                    ))}
                    {product.brand && (
                      <Link href={`/demo/${tenantSlug}/obchod?znacka=${encodeURIComponent(product.brand)}`}
                        className="rounded bg-neutral-100 px-3 py-1.5 text-[12.5px] font-bold text-neutral-800 transition hover:bg-neutral-200">
                        {product.brand}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* eshop-06: Základní specifikace z reálných dat + kategorie chips */}
          {isOreskarna && (
            <div className="mt-14">
              <h3 className="text-[17px] font-extrabold text-neutral-950" style={{ fontFamily: "'Archivo','Helvetica Neue',Arial,sans-serif" }}>Základní specifikace</h3>
              <div className="mt-3 overflow-hidden rounded-xl border" style={{ borderColor: "#eceae6" }}>
                <table className="w-full text-[13.5px]">
                  <tbody>
                    {[
                      ["Značka", product.brand ?? "—"],
                      ["Kategorie", crumbTrail.map((cc) => cc.name).join(" / ") || "—"],
                      ["Balení", product.variants.map((v) => v.title).filter(Boolean).join(", ") || "—"],
                      ["Skladování", "V suchu a temnu, ideálně do 20 °C"],
                      ["Kód produktu", defaultVariant?.sku ?? "—"],
                    ].map(([k, v], i) => (
                      <tr key={String(k)} className={i % 2 === 0 ? "bg-[#faf9f6]" : "bg-white"}>
                        <th scope="row" className="w-[42%] px-4 py-2.5 text-left font-semibold text-neutral-500">{k}</th>
                        <td className="px-4 py-2.5 font-semibold text-neutral-900">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(crumbTrail.length > 0 || product.brand) && (
                <div className="mt-7">
                  <h3 className="text-[15px] font-extrabold text-neutral-950" style={{ fontFamily: "'Archivo','Helvetica Neue',Arial,sans-serif" }}>Najdete v těchto kategoriích</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {crumbTrail.map((cc) => (
                      <Link key={cc.slug} href={`/demo/${tenantSlug}/obchod?kategorie=${cc.slug}`}
                        className="rounded-lg bg-[#f5f5f2] px-3 py-1.5 text-[12.5px] font-bold text-neutral-800 transition hover:bg-[#eceae6]">
                        {cc.name}
                      </Link>
                    ))}
                    {product.brand && (
                      <Link href={`/demo/${tenantSlug}/obchod?znacka=${encodeURIComponent(product.brand)}`}
                        className="rounded-lg bg-[#f5f5f2] px-3 py-1.5 text-[12.5px] font-bold text-neutral-800 transition hover:bg-[#eceae6]">
                        {product.brand}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* eshop-07: akordeony Vlastnosti / O značce + Objevte více chips (pravý sloupec) */}
          {isNeroli && (
            <div className="mt-14">
              <details className="group border-t" style={{ borderColor: "#e8e9ed" }} open>
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[15px] font-extrabold text-neutral-950 [&::-webkit-details-marker]:hidden">
                  Vlastnosti
                  <svg className="transition group-open:rotate-180" width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </summary>
                <div className="overflow-hidden rounded-xl border" style={{ borderColor: "#e8e9ed" }}>
                  <table className="w-full text-[13.5px]">
                    <tbody>
                      {[
                        ["Značka", product.brand ?? "—"],
                        ["Kategorie", crumbTrail.map((cc) => cc.name).join(" / ") || "—"],
                        ["Objem", product.variants.map((v) => v.title).filter(Boolean).join(", ") || "—"],
                        ["Kód produktu", defaultVariant?.sku ?? "—"],
                      ].map(([k, v], i) => (
                        <tr key={String(k)} className={i % 2 === 0 ? "bg-[#f4f5f7]/60" : "bg-white"}>
                          <th scope="row" className="w-[42%] px-4 py-2.5 text-left font-semibold text-neutral-500">{k}</th>
                          <td className="px-4 py-2.5 font-semibold text-neutral-900">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pb-4" />
              </details>
              {product.brand && (
                <details className="group border-t" style={{ borderColor: "#e8e9ed" }}>
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[15px] font-extrabold text-neutral-950 [&::-webkit-details-marker]:hidden">
                    {product.brand}
                    <svg className="transition group-open:rotate-180" width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </summary>
                  <p className="pb-4 text-[13.5px] leading-relaxed text-neutral-600">
                    {product.brand} patří mezi domy vůní, které pečlivě vybíráme do našeho sortimentu. Každou šarži kupujeme přímo od výrobce nebo prověřeného evropského distributora — u nás máte jistotu originálu.
                  </p>
                </details>
              )}
              {(crumbTrail.length > 0 || product.brand) && (
                <div className="mt-6 border-t pt-5" style={{ borderColor: "#e8e9ed" }}>
                  <h3 className="text-[15px] font-extrabold text-neutral-950">Objevte více</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {crumbTrail.map((cc) => (
                      <Link key={cc.slug} href={`/demo/${tenantSlug}/obchod?kategorie=${cc.slug}`}
                        className="rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold text-neutral-800 transition hover:border-neutral-900" style={{ borderColor: "#e8e9ed" }}>
                        {cc.name}
                      </Link>
                    ))}
                    {product.brand && (
                      <Link href={`/demo/${tenantSlug}/obchod?znacka=${encodeURIComponent(product.brand)}`}
                        className="rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold text-neutral-800 transition hover:border-neutral-900" style={{ borderColor: "#e8e9ed" }}>
                        {product.brand}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* eshop-05: chips i bez parametrů (pravý sloupec) */}
          {isPompo && productParams.length === 0 && (crumbTrail.length > 0 || product.brand) && (
            <div className="mt-14">
              <h3 className="text-[17px] font-extrabold text-neutral-950">Najdete v těchto kategoriích</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {crumbTrail.map((c) => (
                  <Link key={c.slug} href={`/demo/${tenantSlug}/obchod?kategorie=${c.slug}`}
                    className="rounded bg-neutral-100 px-3 py-1.5 text-[12.5px] font-bold text-neutral-800 transition hover:bg-neutral-200">
                    {c.name}
                  </Link>
                ))}
                {product.brand && (
                  <Link href={`/demo/${tenantSlug}/obchod?znacka=${encodeURIComponent(product.brand)}`}
                    className="rounded bg-neutral-100 px-3 py-1.5 text-[12.5px] font-bold text-neutral-800 transition hover:bg-neutral-200">
                    {product.brand}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {bundles.length > 0 && (
          <BundleOffer
            tenantSlug={tenantSlug}
            currency={displayCurrency}
            bundles={bundles.map((b) => ({
              id: b.id,
              name: b.name,
              discount_pct: b.discount_pct,
              regular_cents: convertCents(b.regular_cents, fx),
              bundle_cents: convertCents(b.bundle_cents, fx),
              items: b.items.map((i) => ({
                variant_id: i.variant_id,
                qty: i.qty,
                product_slug: i.product_slug,
                product_title: i.product_title,
                variant_title: i.variant_title,
                price_cents: convertCents(i.price_cents, fx),
                image_url: i.image_url,
              })),
            }))}
          />
        )}
        {addons.has("hodnoceni-produktu") && (
          <div id="hodnoceni" className="scroll-mt-36">
            {addons.has("google-reviews") && (
              <div className="mt-10">
                <GoogleReviewsBadge
                  rating={Number((shop.settings as { google_reviews?: { rating?: number } })?.google_reviews?.rating) || 4.9}
                  count={Number((shop.settings as { google_reviews?: { count?: number } })?.google_reviews?.count) || 127}
                  url={(shop.settings as { google_reviews?: { url?: string } })?.google_reviews?.url}
                />
              </div>
            )}
            <ProductReviews tenantSlug={tenantSlug} productId={product.id} enablePhotos={addons.has("fotorecenze")} />
          </div>
        )}
        {addons.has("diskuze") && (
          <div id="diskuze" className="scroll-mt-36">
            <ProductQuestions tenantSlug={tenantSlug} productId={product.id} />
          </div>
        )}
        {relatedProducts.length > 0 && (
          <div id="souvisejici" className="scroll-mt-36">
            <RelatedProducts
              products={relatedProducts.map((p) => ({ ...p, price_cents: convertCents(p.price_cents, fx) }))}
              tenantSlug={tenantSlug}
              heading={isOreskarna ? "Mohlo by vás zajímat" : isNeroli ? "Mohlo by vás také zaujmout" : isBonami ? "Podobné produkty" : isEs09 ? "Ideální volba" : undefined}
              currency={displayCurrency}
            />
          </div>
        )}
        {accessoryProducts.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-950">Související produkty</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {accessoryProducts.map((p) => (
                <Link key={p.id} href={`/demo/${tenantSlug}/obchod/${p.slug}`}
                  className="group rounded-2xl border border-neutral-100 p-3 transition hover:border-neutral-200 hover:shadow-md">
                  <span className="block aspect-square overflow-hidden rounded-xl bg-neutral-50">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    )}
                  </span>
                  {p.brand && <span className="mt-2 block text-[11.5px] font-semibold uppercase tracking-wide text-neutral-400">{p.brand}</span>}
                  <span className="mt-0.5 line-clamp-2 block text-[13.5px] font-semibold leading-snug text-neutral-900">{p.title}</span>
                  <span className="mt-1 block text-[14.5px] font-extrabold tabular-nums text-neutral-950">{price(p.price_cents)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        {addons.has("naposledy-navstivene") && <RecentlyViewed tenantSlug={tenantSlug} currentSlug={product.slug} />}
      </div>
      {addons.has("naposledy-navstivene") && (
        <RecentlyViewedTracker
          tenantSlug={tenantSlug}
          slug={product.slug}
          title={product.title}
          price={price(defaultVariant?.price_cents ?? 0)}
          image={mainImage?.url ?? undefined}
        />
      )}
      {addons.has("porovnavac") && <CompareBar tenantSlug={tenantSlug} />}
      </main>
      {chromeKey ? (
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
      ) : (
        <ShopFooter
          tenantSlug={tenantSlug}
          shopName={shop.name || "Obchod"}
          categories={categories
            .filter((c) => c.is_visible && !c.parent_id)
            .map((c) => ({ slug: c.slug, name: c.name }))}
          moduleLinks={buildFooterModuleLinks(addons, tenantSlug)}
          whatsapp={addons.has("whatsapp-chat")}
        />
      )}
      <CartToast />
      <CookieConsent />
    </div>
  );
}

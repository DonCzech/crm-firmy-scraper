import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBySlug, query } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { CartClient, type UpsellProduct } from "@/components/storefront/CartClient";
import { ShopHeaderServer } from "@/components/storefront/ShopHeaderServer";
import { ShopFooterServer } from "@/components/storefront/ShopFooterServer";
import { getTemplateChromeKey, TemplateShopHeader, TemplateShopFooter } from "@/components/storefront/TemplateShopChrome";
import { Eshop16Cart, type Es16CartUpsell } from "@/components/storefront/Eshop16Cart";
import { Eshop19Cart, type Es19CartUpsell } from "@/components/storefront/Eshop19Cart";
import { Eshop20Cart, type Es20CartService, type Es20CartUpsell } from "@/components/storefront/Eshop20Cart";

/** Webero Commerce — košík (Fáze 4). */
export const dynamic = "force-dynamic";

interface Props { params: Promise<{ tenantSlug: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Košík", robots: { index: false } };
}

export default async function CartPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return notFound();

  const [addons, chromeKey] = await Promise.all([
    getActiveAddonSlugs(tenant.id),
    getTemplateChromeKey(tenant.id),
  ]);
  // eshop-06 "Ořeškárna" — svetplodu košík (top karusel, info bar, služby, raketa)
  const isOreskarna = chromeKey === "eshop-06";
  // eshop-07 "Néroli parfumerie" — kosmetika-zdravi košík (stepper, shrnutí
  // s boxem dopravy, Zákazníci koupili také, doplňkové služby)
  const isNeroli = chromeKey === "eshop-07";
  // eshop-09 "Mobil Expres" — mp košík (Doporučujeme služby, Rekapitulace, Mohlo by vás zajímat)
  const isEs09 = chromeKey === "eshop-09";
  // eshop-10 "BOTIQ" — footshop košík (stepper 1–4, TVŮJ KOŠÍK, volt progress, Mohlo by se ti hodit)
  const isEs10 = chromeKey === "eshop-10";

  // Modul upsell-kosik: tipy na dokoupení (klient odfiltruje, co už v košíku je)
  let upsellProducts: UpsellProduct[] = [];
  const isEs11 = chromeKey === "eshop-11";
  const isEs12 = chromeKey === "eshop-12";
  if (addons.has("upsell-kosik") || isOreskarna || isNeroli || isEs09 || isEs10 || isEs11 || isEs12) {
    upsellProducts = await query<UpsellProduct>(
      `SELECT p.id, p.slug, p.title,
              (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.id LIMIT 1) AS variant_id,
              COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
              (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
       FROM products p
       WHERE p.tenant_id = $1 AND p.status = 'active'
       ORDER BY p.id DESC LIMIT 8`,
      [tenant.id]
    );
  }

  let serviceProducts: UpsellProduct[] = [];
  if (isOreskarna || isNeroli || isEs09) {
    serviceProducts = await query<UpsellProduct>(
      `SELECT p.id, p.slug, p.title,
              (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.id LIMIT 1) AS variant_id,
              COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
              (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
       FROM products p
       JOIN product_categories pc ON pc.id = p.primary_category_id
       WHERE p.tenant_id = $1 AND p.status = 'active' AND pc.slug = 'doplnkove-sluzby'
       ORDER BY p.id`,
      [tenant.id]
    ).catch(() => []);
    // upsell nesmí nabízet služby
    const svc = new Set(serviceProducts.map((s) => s.slug));
    upsellProducts = upsellProducts.filter((p) => !svc.has(p.slug));
  }

  // eshop-20 "Vykuk" — dedoles.cz layout košíku (N PRODUKTŮ V KOŠÍKU, progress
  // do dopravy zdarma 999 Kč, doplňkové služby checkboxy, slevový kód,
  // růžová Pokladna, Mohlo by se ti také líbit)
  if (chromeKey === "eshop-20") {
    const [services20, upsell20] = await Promise.all([
      query<Es20CartService>(
        `SELECT p.slug, p.title, p.subtitle,
                (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.id LIMIT 1) AS variant_id,
                COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents
         FROM products p
         JOIN product_categories pc ON pc.id = p.primary_category_id
         WHERE p.tenant_id = $1 AND p.status = 'active' AND pc.slug = 'doplnkove-sluzby'
         ORDER BY p.id`,
        [tenant.id]
      ).catch(() => []),
      query<Es20CartUpsell>(
        `SELECT p.id, p.slug, p.title, p.subtitle,
                (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.is_default DESC, pv.id LIMIT 1) AS variant_id,
                COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
                (SELECT MAX(pv.compare_at_price_cents) FROM product_variants pv WHERE pv.product_id = p.id) AS compare_cents,
                (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
         FROM products p
         JOIN product_categories pc ON pc.id = p.primary_category_id
         WHERE p.tenant_id = $1 AND p.status = 'active'
           AND (p.flags->>'featured')::boolean IS TRUE AND pc.slug <> 'doplnkove-sluzby'
         ORDER BY p.updated_at DESC LIMIT 8`,
        [tenant.id]
      ).catch(() => []),
    ]);
    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-[60vh]" style={{ background: "#fdf8f0" }}>
          <Eshop20Cart tenantSlug={tenantSlug} services={services20} upsellProducts={upsell20} />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
      </div>
    );
  }

  // eshop-19 "Grunt" — dek.cz layout košíku (lišta kroků + POKRAČOVAT, Obsah
  // vašeho košíku + zkopírovat odkaz, palety toggle, žluté Celkem k zaplacení,
  // Mohlo by vás zajímat)
  if (chromeKey === "eshop-19") {
    const upsell19 = await query<Es19CartUpsell>(
      `SELECT p.id, p.slug, p.title, p.subtitle, p.flags,
              (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.is_default DESC, pv.id LIMIT 1) AS variant_id,
              COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
              (SELECT MAX(pv.compare_at_price_cents) FROM product_variants pv WHERE pv.product_id = p.id) AS compare_cents,
              (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
       FROM products p
       WHERE p.tenant_id = $1 AND p.status = 'active' AND (p.flags->>'featured')::boolean IS TRUE
       ORDER BY p.updated_at DESC LIMIT 8`,
      [tenant.id]
    ).catch(() => []);
    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-[60vh]" style={{ background: "#fff" }}>
          <Eshop19Cart tenantSlug={tenantSlug} upsellProducts={upsell19} />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
      </div>
    );
  }

  // eshop-16 "Spížka" — kosik.cz layout košíku (Zpět nakupovat | Nákupní košík
  // | Celkem pill, progress do minimálního nákupu 699 Kč, disabled pokladna,
  // Nezapomněli jste na něco?, 18+ disclaimer)
  if (chromeKey === "eshop-16") {
    const upsell16 = await query<Es16CartUpsell>(
      `SELECT p.id, p.slug, p.title, p.subtitle,
              (SELECT pv.id FROM product_variants pv WHERE pv.product_id = p.id ORDER BY pv.is_default DESC, pv.id LIMIT 1) AS variant_id,
              COALESCE((SELECT MIN(pv.price_cents) FROM product_variants pv WHERE pv.product_id = p.id), 0) AS price_cents,
              (SELECT MAX(pv.compare_at_price_cents) FROM product_variants pv WHERE pv.product_id = p.id) AS compare_cents,
              (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
       FROM products p
       WHERE p.tenant_id = $1 AND p.status = 'active' AND (p.flags->>'featured')::boolean IS TRUE
       ORDER BY p.updated_at DESC LIMIT 12`,
      [tenant.id]
    ).catch(() => []);
    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-[60vh]" style={{ background: "#fbf7f1" }}>
          <Eshop16Cart tenantSlug={tenantSlug} upsellProducts={upsell16} />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <ShopHeaderServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
      <main className="min-h-[60vh] bg-white text-[#111]">
        <div className="mx-auto max-w-[1200px] px-5 py-10">
          {isNeroli && (
            <nav className="mb-7 flex flex-wrap items-center gap-3 text-[13.5px] font-semibold" aria-label="Kroky objednávky" style={{ fontFamily: "'Hanken Grotesk','Segoe UI',Arial,sans-serif" }}>
              {[["1", "Košík", true], ["2", "Doprava a platba", false], ["3", "Osobní údaje", false]].map(([n, label, active], i) => (
                <span key={String(n)} className="flex items-center gap-3">
                  {i > 0 && <span className="h-px w-10 bg-neutral-200" aria-hidden />}
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[12.5px] font-extrabold ${active ? "bg-neutral-950 text-white" : "border border-neutral-300 text-neutral-500"}`}>{n}</span>
                  <span className={active ? "text-neutral-950" : "text-neutral-500"}>{label}</span>
                </span>
              ))}
            </nav>
          )}
          {isEs12 && (
            <>
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap" />
              <nav className="mb-8 grid grid-cols-3 gap-2" aria-label="Kroky objednávky" style={{ fontFamily: "'Baloo 2','Segoe UI',system-ui,sans-serif" }}>
                {[["1", "Nákupní košík", true], ["2", "Doprava & platba", false], ["3", "Informace o vás", false]].map(([n, label, active]) => (
                  <span key={String(n)} className={`flex items-center justify-center gap-2.5 rounded-full border-2 px-3 py-2.5 ${active ? "border-[#ff8a3d] bg-[#fff1e3]" : "border-[#f0e7db] bg-white"}`}>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[13.5px] font-extrabold ${active ? "bg-[#ff8a3d] text-white" : "bg-[#f3eeff] text-[#6f45d1]"}`}>{n}</span>
                    <span className={`hidden text-[14px] font-bold sm:inline ${active ? "text-[#14224a]" : "text-[#71809a]"}`}>{label}</span>
                  </span>
                ))}
              </nav>
            </>
          )}
          {isEs10 && (
            <>
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700;800&display=swap" />
              <nav className="mb-9 flex items-center justify-center" aria-label="Kroky objednávky" style={{ fontFamily: "'Barlow Condensed','Arial Narrow',Arial,sans-serif" }}>
                {[["1", "Košík", true], ["2", "Doprava a platba", false], ["3", "Dodací údaje", false], ["4", "Souhrn", false]].map(([n, label, active], i) => (
                  <span key={String(n)} className="flex items-center">
                    {i > 0 && <span className="mx-3 h-[2px] w-10 sm:w-16" style={{ background: "#e6e6e4" }} aria-hidden />}
                    <span className="flex items-center gap-2.5">
                      <span className={`flex h-8 w-8 items-center justify-center text-[14px] font-extrabold ${active ? "bg-[#0a0a0b] text-[#c8f53c]" : "border-2 border-[#e6e6e4] text-neutral-400"}`} style={{ borderRadius: 2 }}>{n}</span>
                      <span className={`hidden text-[14.5px] font-bold uppercase tracking-[0.09em] sm:inline ${active ? "text-neutral-950" : "text-neutral-400"}`}>{label}</span>
                    </span>
                  </span>
                ))}
              </nav>
            </>
          )}
          <h1 className={`text-[30px] font-extrabold tracking-tight text-neutral-950 ${isNeroli ? "uppercase tracking-[0.03em]" : ""} ${isEs10 ? "flex items-center gap-3 uppercase tracking-[0.05em] text-[34px]" : ""} ${isEs12 ? "flex items-center gap-3 text-[32px]" : ""}`} style={isEs09 ? { fontFamily: "'Archivo','Helvetica Neue',Arial,sans-serif", color: "#232a30" } : isEs10 ? { fontFamily: "'Barlow Condensed','Arial Narrow',Arial,sans-serif", color: "#121212" } : isEs12 ? { fontFamily: "'Baloo 2','Segoe UI',system-ui,sans-serif", color: "#14224a" } : undefined}>
            {isEs10 && <span aria-hidden className="inline-block h-[11px] w-[11px]" style={{ background: "#c8f53c" }} />}
            {isEs12 && <svg aria-hidden width="26" height="26" viewBox="0 0 24 24" fill="#ff8a3d" style={{ transform: "rotate(-10deg)" }}><circle cx="6.2" cy="9.5" r="2.05"/><circle cx="10.4" cy="6.4" r="2.15"/><circle cx="14.9" cy="6.6" r="2.15"/><circle cx="18.6" cy="10.1" r="2"/><path d="M12.4 11.4c2.8 0 4.9 1.7 4.9 4 0 2.5-2.2 4.1-5.3 4.1-3 0-5.2-1.6-5.2-4 0-2.4 2.5-4.1 5.6-4.1Z"/></svg>}
            {isEs09 ? "1. Zboží v košíku" : isEs10 ? "Tvůj košík" : isEs12 ? "Nákupní košík" : "Košík"}
          </h1>
          <CartClient
            tenantSlug={tenantSlug}
            showFreeShippingBar={addons.has("doprava-zdarma-lista")}
            upsellProducts={upsellProducts}
            skin={chromeKey ?? undefined}
            services={isOreskarna || isNeroli || isEs09 ? serviceProducts : []}
            freeShippingFromCents={isOreskarna ? 199900 : isNeroli ? 249000 : isEs10 ? 250000 : isEs12 ? 129900 : undefined}
          />
        </div>
      </main>
      <ShopFooterServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
    </div>
  );
}

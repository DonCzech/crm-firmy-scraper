import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getCartView } from "@/lib/commerce/cart";
import { getShippingMethods, getPaymentMethods } from "@/lib/commerce/checkout";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { computeCartDiscounts } from "@/lib/commerce/discounts";
import { computeBundleDiscounts } from "@/lib/commerce/bundles";
import { CheckoutClient } from "@/components/storefront/CheckoutClient";
import { ShopHeaderServer } from "@/components/storefront/ShopHeaderServer";
import { ShopFooterServer } from "@/components/storefront/ShopFooterServer";
import { getTemplateChromeKey, TemplateShopHeader, TemplateShopFooter } from "@/components/storefront/TemplateShopChrome";
import { Eshop20Checkout } from "@/components/storefront/Eshop20Checkout";

/** Webero Commerce — pokladna (Fáze 4). Guest checkout, ceny počítá server. */
export const dynamic = "force-dynamic";

interface Props { params: Promise<{ tenantSlug: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Pokladna", robots: { index: false } };
}

export default async function CheckoutPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return notFound();

  const cookieStore = await cookies();
  const cartToken = cookieStore.get(`webero_cart_${tenantSlug}`)?.value ?? null;
  const cart = await getCartView(tenant.id, cartToken, shop.currency);

  const addons = await getActiveAddonSlugs(tenant.id);

  // eshop-20 "Vykuk" — dedoles.cz pokladna (expresní Apple/Google Pay, Kontakt,
  // Doručení, Metoda dopravy, Platba vč. dobírky + převodu, sticky souhrn)
  if ((await getTemplateChromeKey(tenant.id)) === "eshop-20") {
    return (
      <div className="bg-white">
        <TemplateShopHeader tenantId={tenant.id} tenantSlug={tenantSlug} />
        <main className="min-h-[60vh]" style={{ background: "#fff" }}>
          <Eshop20Checkout
            tenantSlug={tenantSlug}
            initialCart={{
              items: cart.items.map((i) => ({
                id: i.id,
                title: i.product_title,
                variant_title: i.variant_title,
                qty: i.qty,
                line_total_cents: i.line_total_cents,
                image_url: i.image_url,
              })),
              subtotal_cents: cart.subtotal_cents,
            }}
            shippingMethods={getShippingMethods(shop, addons)}
            paymentMethods={getPaymentMethods(shop, addons).map((m) => ({ ...m }))}
          />
        </main>
        <TemplateShopFooter tenantId={tenant.id} tenantSlug={tenantSlug} />
      </div>
    );
  }

  const autoDiscounts = computeCartDiscounts(
    addons,
    cart.items.map((i) => ({
      title: i.product_title,
      qty: i.qty,
      unit_price_cents: i.price_cents,
      line_total_cents: i.line_total_cents,
    })),
    cart.subtotal_cents
  );

  // Modul sady-produktu: sleva za kompletní sady v košíku (stejně jako placeOrder)
  if (addons.has("sady-produktu")) {
    const bundleLines = await computeBundleDiscounts(
      tenant.id,
      cart.items.map((i) => ({ variant_id: i.variant_id, qty: i.qty }))
    );
    autoDiscounts.lines.push(...bundleLines);
    autoDiscounts.total_cents += bundleLines.reduce((s, l) => s + l.amount_cents, 0);
  }

  return (
    <div className="bg-white">
      <ShopHeaderServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
      <main className="min-h-[60vh] bg-white text-[#111]">
        <div className="mx-auto max-w-[1200px] px-5 py-10">
          <h1 className="text-[30px] font-extrabold tracking-tight text-neutral-950">Pokladna</h1>
          <CheckoutClient
            tenantSlug={tenantSlug}
            currency={shop.currency}
            initialCart={{
              items: cart.items.map((i) => ({
                id: i.id,
                title: i.product_title,
                variant_title: i.variant_title,
                qty: i.qty,
                line_total_cents: i.line_total_cents,
                image_url: i.image_url,
              })),
              subtotal_cents: cart.subtotal_cents,
            }}
            shippingMethods={getShippingMethods(shop, addons)}
            paymentMethods={getPaymentMethods(shop, addons).map((m) => ({ ...m }))}
            autoDiscounts={autoDiscounts.lines.map((l) => ({ label: l.label, amount_cents: l.amount_cents }))}
            giftLabel={autoDiscounts.gift}
            enableAres={addons.has("ares-ico")}
            enableExtended={addons.has("rozsirena-objednavka")}
          />
        </div>
      </main>
      <ShopFooterServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
    </div>
  );
}

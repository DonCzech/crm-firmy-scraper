import { queryOne, withTransaction } from "@/lib/db";
import { initCommerceDb } from "./schema";
import { getShopByTenantId } from "./shop";
import { getCartView, convertCartInTx } from "./cart";
import { validateCoupon, redeemCoupon } from "./coupons";
import { getActiveAddonSlugs } from "./addons";
import { computeCartDiscounts } from "./discounts";
import { computeBundleDiscounts } from "./bundles";
import { computeWholesaleDiscount } from "./wholesale";
import { computeLoyaltyDiscount, awardOrderPointsByEmail } from "./loyalty";
import { createOrder } from "./orders";
import type { OrderDetail, Shop, OrderAddress } from "./types";

/**
 * Webero Commerce — checkout (Fáze 4).
 * Dopravy/platby: defaulty pro český trh, přepsatelné per-shop v shops.settings
 * (shipping_methods / payment_methods). Ceny dopočítává VŽDY server.
 */

export interface ShippingMethod {
  key: string;
  label: string;
  description?: string;
  price_cents: number;
  free_above_cents: number | null;
  enabled: boolean;
}

export interface PaymentMethod {
  /** Známé gateway klíče: gopay | bank_transfer | cod | paypal | splatky. Vlastní klíč = offline metoda (potvrzení bez brány). */
  key: string;
  label: string;
  description?: string;
  fee_cents: number;
  enabled: boolean;
}

export const DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
  { key: "zasilkovna", label: "Zásilkovna — výdejní místo", description: "Doručení na výdejní místo do 1–2 dnů", price_cents: 7900, free_above_cents: 150000, enabled: true },
  { key: "kuryr", label: "Kurýr na adresu (PPL)", description: "Doručení na adresu do 1–2 pracovních dnů", price_cents: 11900, free_above_cents: 150000, enabled: true },
  { key: "osobni", label: "Osobní odběr", description: "Zdarma na prodejně", price_cents: 0, free_above_cents: null, enabled: true },
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { key: "gopay", label: "Platba kartou online", description: "GoPay — karta, Apple Pay, Google Pay", fee_cents: 0, enabled: true },
  { key: "bank_transfer", label: "Bankovní převod", description: "Zboží odešleme po připsání platby", fee_cents: 0, enabled: true },
  { key: "cod", label: "Dobírka", description: "Zaplatíte při převzetí", fee_cents: 3900, enabled: true },
];

/** Dopravy/platby přidávané aktivními moduly (addons) — nad rámec per-shop nastavení */
const ADDON_SHIPPING_METHODS: Record<string, ShippingMethod> = {
  balikovna: { key: "balikovna", label: "Balíkovna — Česká pošta", description: "Vyzvednutí na poště nebo v Balíkovně do 2 dnů", price_cents: 6500, free_above_cents: 150000, enabled: true },
};

const ADDON_PAYMENT_METHODS: Record<string, PaymentMethod> = {
  paypal: { key: "paypal", label: "PayPal", description: "Rychlá platba přes PayPal účet", fee_cents: 0, enabled: true },
  splatky: { key: "splatky", label: "Nákup na splátky", description: "Splátky bez navýšení, schválení online do minuty", fee_cents: 0, enabled: true },
};

export function getShippingMethods(shop: Shop, activeAddons?: Set<string>): ShippingMethod[] {
  const custom = (shop.settings as { shipping_methods?: ShippingMethod[] })?.shipping_methods;
  const list = Array.isArray(custom) && custom.length ? custom : DEFAULT_SHIPPING_METHODS;
  const out = list.filter((m) => m.enabled);
  for (const [slug, method] of Object.entries(ADDON_SHIPPING_METHODS)) {
    if (activeAddons?.has(slug) && !out.some((m) => m.key === method.key)) out.push(method);
  }
  return out;
}

export function getPaymentMethods(shop: Shop, activeAddons?: Set<string>): PaymentMethod[] {
  const custom = (shop.settings as { payment_methods?: PaymentMethod[] })?.payment_methods;
  const list = Array.isArray(custom) && custom.length ? custom : DEFAULT_PAYMENT_METHODS;
  // GoPay jen když jsou platformní credentials
  const out = list.filter((m) => m.enabled && (m.key !== "gopay" || !!process.env.GOPAY_CLIENT_ID));
  for (const [slug, method] of Object.entries(ADDON_PAYMENT_METHODS)) {
    if (activeAddons?.has(slug) && !out.some((m) => m.key === method.key)) out.push(method);
  }
  return out;
}

export function shippingPrice(method: ShippingMethod, subtotalCents: number): number {
  if (method.free_above_cents != null && subtotalCents >= method.free_above_cents) return 0;
  return method.price_cents;
}

// ── Place order ───────────────────────────────────────────────────────────────

export interface CheckoutInput {
  email: string;
  phone?: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country?: string;
  company?: string;
  ico?: string;
  dic?: string;
  shipping_method: string;
  payment_method: string;
  note?: string;
  marketing_consent?: boolean;
  coupon_code?: string;
}

export interface CheckoutResult {
  order: OrderDetail;
  next: "gopay" | "demo-gateway" | "confirmation";
}

export async function placeOrder(
  tenantId: number,
  cartToken: string,
  input: CheckoutInput
): Promise<CheckoutResult | { error: string }> {
  await initCommerceDb();

  const shop = await getShopByTenantId(tenantId);
  if (!shop) return { error: "Obchod není aktivní" };

  const cart = await getCartView(tenantId, cartToken, shop.currency);
  if (!cart.items.length) return { error: "Košík je prázdný" };

  const activeAddons = await getActiveAddonSlugs(tenantId);

  const shipping = getShippingMethods(shop, activeAddons).find((m) => m.key === input.shipping_method);
  if (!shipping) return { error: "Vyberte způsob dopravy" };
  const payment = getPaymentMethods(shop, activeAddons).find((m) => m.key === input.payment_method);
  if (!payment) return { error: "Vyberte způsob platby" };

  // Kupón — validace a slevu počítá VŽDY server, klientovi nevěříme
  let discountCents = 0;
  let couponFreeShipping = false;
  let couponId: number | null = null;
  if (input.coupon_code?.trim()) {
    const v = await validateCoupon(tenantId, input.coupon_code, cart.subtotal_cents);
    if (!v.ok) return { error: v.error };
    discountCents = v.discount_cents;
    couponFreeShipping = v.free_shipping;
    couponId = v.coupon.id;
  }

  // Automatické slevy z aktivních modulů (množstevní, objemové, 3 za cenu 2, dárek)
  const auto = computeCartDiscounts(
    activeAddons,
    cart.items.map((i) => ({
      title: i.product_title,
      qty: i.qty,
      unit_price_cents: i.price_cents,
      line_total_cents: i.line_total_cents,
    })),
    cart.subtotal_cents
  );

  // Modul sady-produktu: sleva za kompletní sady v košíku
  if (activeAddons.has("sady-produktu")) {
    const bundleLines = await computeBundleDiscounts(
      tenantId,
      cart.items.map((i) => ({ variant_id: i.variant_id, qty: i.qty }))
    );
    auto.lines.push(...bundleLines);
    auto.total_cents += bundleLines.reduce((s, l) => s + l.amount_cents, 0);
  }

  // Modul velkoobchod: individuální sleva schváleného B2B partnera podle e-mailu
  if (activeAddons.has("velkoobchod")) {
    const wholesale = await computeWholesaleDiscount(tenantId, input.email, cart.subtotal_cents);
    if (wholesale) {
      auto.lines.push(wholesale);
      auto.total_cents += wholesale.amount_cents;
    }
  }

  // Modul vernostni-slevy: sleva podle věrnostní úrovně zákazníka (e-mail)
  if (activeAddons.has("vernostni-slevy")) {
    const loyalty = await computeLoyaltyDiscount(tenantId, input.email, cart.subtotal_cents);
    if (loyalty) {
      auto.lines.push(loyalty);
      auto.total_cents += loyalty.amount_cents;
    }
  }

  discountCents = Math.min(cart.subtotal_cents, discountCents + auto.total_cents);

  const shippingCents = (couponFreeShipping ? 0 : shippingPrice(shipping, cart.subtotal_cents)) + payment.fee_cents;

  const address: OrderAddress = {
    name: input.name,
    street: input.street,
    city: input.city,
    zip: input.zip,
    country: input.country ?? "CZ",
    phone: input.phone,
    company: input.company,
    ico: input.ico,
    dic: input.dic,
  };

  let order: OrderDetail;
  try {
    order = await createOrder(tenantId, {
      email: input.email,
      phone: input.phone,
      items: cart.items.map((i) => ({ variant_id: i.variant_id, qty: i.qty })),
      billing_address: address,
      shipping_address: address,
      shipping_method: `${shipping.label}${payment.fee_cents ? ` + ${payment.label}` : ""}`,
      shipping_cents: shippingCents,
      payment_method: payment.key,
      customer_note: [
        input.coupon_code?.trim() ? `Kupón: ${input.coupon_code.trim().toUpperCase()}` : null,
        ...auto.lines.map((l) => `${l.label}: −${(l.amount_cents / 100).toLocaleString("cs-CZ")} Kč`),
        auto.gift ? `🎁 ${auto.gift}` : null,
        input.note,
      ].filter(Boolean).join("\n") || undefined,
      discount_cents: discountCents,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Objednávku se nepodařilo vytvořit" };
  }

  // Započítat použití kupónu (mimo kritickou cestu)
  if (couponId != null) {
    redeemCoupon(tenantId, couponId).catch((e) => console.error("[checkout] coupon redeem failed:", e));
  }

  // Modul vernostni-slevy: připsat body za objednávku (mimo kritickou cestu)
  if (activeAddons.has("vernostni-slevy")) {
    awardOrderPointsByEmail(tenantId, input.email, order.total_cents, order.id)
      .catch((e) => console.error("[checkout] loyalty points failed:", e));
  }

  // Konverze košíku + marketing consent (mimo kritickou tx — selhání nesmí shodit objednávku)
  try {
    await withTransaction(async (client) => {
      await convertCartInTx(client, tenantId, cartToken, order.id);
      if (input.marketing_consent) {
        await client.query(
          "UPDATE customers SET marketing_consent = true, updated_at = now() WHERE tenant_id = $1 AND email = $2",
          [tenantId, input.email.toLowerCase()]
        );
      }
      // Jméno zákazníka z adresy
      const parts = input.name.trim().split(/\s+/);
      await client.query(
        `UPDATE customers SET first_name = COALESCE(first_name, $3), last_name = COALESCE(last_name, $4), updated_at = now()
         WHERE tenant_id = $1 AND email = $2`,
        [tenantId, input.email.toLowerCase(), parts[0] ?? null, parts.slice(1).join(" ") || null]
      );
    });
  } catch (e) {
    console.error("[checkout] cart conversion failed:", e);
  }

  const next: CheckoutResult["next"] = payment.key === "gopay"
    ? "gopay"
    : payment.key === "paypal" || payment.key === "splatky"
      ? "demo-gateway"
      : "confirmation";
  return { order, next };
}

/** Public confirmation lookup — order number + public token (anti-enumeration). */
export async function getOrderByPublicToken(
  tenantId: number,
  orderNumber: string,
  token: string
): Promise<OrderDetail | null> {
  await initCommerceDb();
  const row = await queryOne<{ id: number }>(
    "SELECT id FROM orders WHERE tenant_id = $1 AND order_number = $2 AND public_token = $3",
    [tenantId, orderNumber, token]
  );
  if (!row) return null;
  const { getOrder } = await import("./orders");
  return getOrder(tenantId, row.id);
}

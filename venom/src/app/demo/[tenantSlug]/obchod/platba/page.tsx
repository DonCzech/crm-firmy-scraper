import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getOrderByPublicToken } from "@/lib/commerce/checkout";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { DemoGatewayClient } from "@/components/storefront/DemoGatewayClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Platba objednávky", robots: { index: false } };

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ order?: string; t?: string }>;
}

/** Moduly paypal / splatky — demo platební brána (schválit / zrušit platbu). */
export default async function DemoGatewayPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const { order: orderNumber, t: token } = await searchParams;
  if (!orderNumber || !token) return notFound();

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return notFound();

  const order = await getOrderByPublicToken(tenant.id, orderNumber, token);
  if (!order) return notFound();

  const provider = order.payment_method === "splatky" ? "splatky" : order.payment_method === "paypal" ? "paypal" : null;
  if (!provider) return notFound();

  const addons = await getActiveAddonSlugs(tenant.id);
  if (!addons.has(provider)) return notFound();

  // Už zaplaceno → rovnou na potvrzení
  if (order.payment_status === "paid") {
    redirect(`/demo/${tenantSlug}/obchod/objednavka/${encodeURIComponent(orderNumber)}?t=${token}`);
  }

  return (
    <DemoGatewayClient
      tenantSlug={tenantSlug}
      provider={provider}
      shopName={shop.name || "Obchod"}
      orderNumber={order.order_number}
      token={token}
      totalCents={order.total_cents}
      currency={order.currency}
      email={order.email}
    />
  );
}

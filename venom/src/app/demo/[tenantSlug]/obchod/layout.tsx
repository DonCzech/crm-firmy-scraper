import { query } from "@/lib/db";
import { getShopSkinCss } from "@/components/storefront/shop-skins";
import { TenantCustomCode } from "@/components/tenant/TenantCustomCode";
import { getTrialLockState } from "@/lib/trial-gate";
import { PublicTrialLock } from "@/components/tenant/PublicTrialLock";

/**
 * Sdílený layout storefrontu — aplikuje per-šablonový skin (shop-skins.ts)
 * na všechny /obchod stránky (listing, detail, košík, pokladna…).
 * Tenanti bez skinu (eshop-01) renderují beze změny.
 * Vkládá také tenantův vlastní kód (admin → Nastavení → Vlastní kód).
 */
export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const lock = await getTrialLockState(tenantSlug);
  if (lock.locked) return <PublicTrialLock tenantSlug={tenantSlug} businessName={lock.businessName} />;
  const rows = await query<{ id: number; key: string | null }>(
    `SELECT tn.id, t.key FROM tenants tn LEFT JOIN templates t ON t.id = tn.template_id WHERE tn.slug = $1`,
    [tenantSlug]
  ).catch(() => []);
  const skinCss = getShopSkinCss(rows[0]?.key);
  const tenantId = rows[0]?.id;

  const inner = (
    <>
      {tenantId != null && <TenantCustomCode tenantId={tenantId} placement="head" />}
      {children}
      {tenantId != null && <TenantCustomCode tenantId={tenantId} placement="body-end" />}
    </>
  );

  if (!skinCss) return inner;

  return (
    <div data-shop-skin={rows[0]!.key!}>
      <style dangerouslySetInnerHTML={{ __html: skinCss }} />
      {inner}
    </div>
  );
}

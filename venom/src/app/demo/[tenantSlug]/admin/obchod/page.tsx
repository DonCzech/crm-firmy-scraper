import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { CommerceAdmin } from "@/components/admin/commerce/CommerceAdmin";
import type { CommerceAdminDesign } from "@/components/admin/commerce/shared";

/**
 * Webero Commerce — obchodní administrace (Fáze 1 skeleton).
 * Dense, tabulková, operator-grade. Marketingové karty sem nepatří.
 */
interface Props {
  params: Promise<{ tenantSlug: string }>;
}

function normalizeCommerceAdminDesign(value: string | undefined): CommerceAdminDesign {
  return value === "ink" || value === "glass" || value === "webero" || value === "studio" ? value : "ink";
}

export default async function CommerceAdminPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || !token) redirect(`/demo/${tenantSlug}/admin`);
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(tenant.access_token);
    if (a.length !== b.length || !timingSafeEqual(a, b)) redirect(`/demo/${tenantSlug}/admin`);
  } catch {
    redirect(`/demo/${tenantSlug}/admin`);
  }

  const shop = await getShopByTenantId(tenant.id);
  if (!shop) {
    // Web tenant bez e-shopu — nabídka aktivace patří do pozdější fáze,
    // teď jen srozumitelný stav místo prázdné obrazovky.
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <a href={`/demo/${tenantSlug}/admin`} className="text-sm text-gray-500 hover:underline">
            ← Zpět na admin
          </a>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Obchod</h1>
          <p className="mt-3 text-sm text-gray-600">
            Tento web nemá aktivovaný e-shop. E-shop vznikne výběrem e-shopové šablony
            při registraci — aktivace na existujícím webu bude dostupná v další fázi.
          </p>
        </div>
      </div>
    );
  }

  const designCookieName = `webero_commerce_admin_design_${tenantSlug}`;
  const initialDesign = normalizeCommerceAdminDesign(cookieStore.get(designCookieName)?.value);

  return (
    <CommerceAdmin
      tenantSlug={tenantSlug}
      shopName={shop.name}
      currency={shop.currency}
      initialDesign={initialDesign}
    />
  );
}

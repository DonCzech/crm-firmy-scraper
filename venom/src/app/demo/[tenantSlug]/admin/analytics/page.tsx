import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug } from "@/lib/db";
import { timingSafeEqual } from "crypto";
import { AnalyticsEditor } from "@/components/admin/AnalyticsEditor";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function AnalyticsAdminPage({ params }: Props) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <a href={`/demo/${tenantSlug}/admin`} className="text-sm text-gray-500 hover:underline">
            ← Zpět na admin
          </a>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Tracking</h1>
        <p className="text-sm text-gray-500 mb-8">
          Propojte váš web s Google Analytics, GTM nebo Meta Pixel. Každý tenant má vlastní kódy.
        </p>
        <AnalyticsEditor
          tenantSlug={tenantSlug}
          initialConfig={tenant.analytics_config ?? {}}
          initialSearchConsole={tenant.search_console_verification ?? ""}
        />
      </div>
    </div>
  );
}

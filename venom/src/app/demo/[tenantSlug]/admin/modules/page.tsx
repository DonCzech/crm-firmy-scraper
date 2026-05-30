import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, query } from "@/lib/db";
import { timingSafeEqual } from "crypto";
import { ModulesManager } from "@/components/admin/ModulesManager";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

interface Module {
  key: string;
  name: string;
  pricing_tier: string;
  enabled_by_default: boolean;
  enabled: boolean | null;
}

export default async function ModulesAdminPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get(`venom_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || !token) redirect(`/demo/${tenantSlug}/admin`);
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(tenant.access_token);
    if (a.length !== b.length || !timingSafeEqual(a, b)) redirect(`/demo/${tenantSlug}/admin`);
  } catch {
    redirect(`/demo/${tenantSlug}/admin`);
  }

  // Get all modules with tenant-specific enabled state
  const modules = await query<Module>(`
    SELECT
      m.key, m.name, m.pricing_tier, m.enabled_by_default,
      tm.enabled
    FROM modules m
    LEFT JOIN tenant_modules tm ON tm.module_key = m.key AND tm.tenant_id = $1
    ORDER BY m.pricing_tier, m.name
  `, [tenant.id]);

  // active_modules is the runtime source of truth
  const activeModules = tenant.active_modules ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <a href={`/demo/${tenantSlug}/admin`} className="text-sm text-gray-500 hover:underline">
            ← Zpět na admin
          </a>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Moduly</h1>
        <p className="text-sm text-gray-500 mb-8">
          Zapněte nebo vypněte moduly pro váš web. Změny se projeví okamžitě.
        </p>
        <ModulesManager
          tenantSlug={tenantSlug}
          modules={modules}
          activeModules={activeModules}
        />
      </div>
    </div>
  );
}

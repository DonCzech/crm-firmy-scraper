import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, getTenantPages, query } from "@/lib/db";
import { timingSafeEqual } from "crypto";
import { RevisionsManager } from "@/components/admin/RevisionsManager";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

interface Revision {
  id: number;
  page_id: number;
  page_title: string;
  created_at: string;
  section_count: number;
}

export default async function RevisionsPage({ params }: Props) {
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

  const pages = await getTenantPages(tenant.id);
  const revisions = await query<Revision>(`
    SELECT pr.id, pr.page_id, p.title AS page_title, pr.created_at,
           jsonb_array_length(pr.sections_snapshot) AS section_count
    FROM page_revisions pr
    JOIN pages p ON p.id = pr.page_id
    WHERE pr.tenant_id = $1
    ORDER BY pr.created_at DESC
    LIMIT 50
  `, [tenant.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <a href={`/demo/${tenantSlug}/admin`} className="text-sm text-gray-500 hover:underline">
            ← Zpět na admin
          </a>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Historie verzí</h1>
        <p className="text-sm text-gray-500 mb-8">
          Každé uložení sekcí vytvoří nový snapshot. Lze obnovit libovolnou předchozí verzi.
        </p>
        <RevisionsManager
          tenantSlug={tenantSlug}
          pages={pages.map((p) => ({ id: p.id, title: p.title, slug: p.slug }))}
          revisions={revisions}
        />
      </div>
    </div>
  );
}

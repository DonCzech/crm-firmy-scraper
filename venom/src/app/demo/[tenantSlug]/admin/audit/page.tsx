import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, query } from "@/lib/db";
import { timingSafeEqual } from "crypto";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

interface AuditEntry {
  id: number;
  action: string;
  actor: string | null;
  actor_email: string | null;
  target_type: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export default async function AuditLogPage({ params }: Props) {
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

  const entries = await query<AuditEntry>(`
    SELECT id, action, actor, actor_email, target_type, details, created_at
    FROM audit_log
    WHERE tenant_id = $1
    ORDER BY created_at DESC
    LIMIT 200
  `, [tenant.id]);

  const ACTION_ICONS: Record<string, string> = {
    sections_saved: "💾",
    blog_post_created: "✍️",
    blog_post_updated: "📝",
    blog_post_deleted: "🗑️",
    revision_restored: "↩️",
    "module.enabled": "✅",
    "module.disabled": "❌",
    "analytics.updated": "📊",
    contact_received: "📬",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <a href={`/demo/${tenantSlug}/admin`} className="text-sm text-gray-500 hover:underline">
            ← Zpět na admin
          </a>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Audit log</h1>
        <p className="text-sm text-gray-500 mb-8">Posledních 200 akcí provedených v administraci.</p>

        {entries.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">Zatím žádné záznamy.</p>
          </div>
        )}

        <div className="space-y-2">
          {entries.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">
                {ACTION_ICONS[e.action] ?? "📌"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{e.action}</p>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(e.created_at).toLocaleString("cs-CZ")}
                  </p>
                </div>
                {(e.actor ?? e.actor_email) && (
                  <p className="text-xs text-gray-500 mt-0.5">{e.actor ?? e.actor_email}</p>
                )}
                {e.details && Object.keys(e.details).length > 0 && (
                  <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                    {JSON.stringify(e.details)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

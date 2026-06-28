import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, query } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Submission {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  created_at: string;
}

export default async function ContactAdminPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  const submissions = await query<Submission>(
    "SELECT id, name, email, phone, message, created_at FROM contact_submissions WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 200",
    [tenant.id]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-gray-900 text-white flex items-center justify-between px-4 py-2 text-sm">
        <div className="flex items-center gap-3">
          <span className="font-semibold">📬 Zprávy z kontaktního formuláře</span>
          <span className="text-gray-400">{tenantSlug}</span>
        </div>
        <Link href={`/demo/${tenantSlug}/admin`} className="px-3 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">
          ← Editor
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kontaktní zprávy</h1>
          <span className="text-sm text-gray-500">{submissions.length} zpráv</span>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500">Zatím žádné zprávy</p>
            <p className="text-sm text-gray-400 mt-1">Zprávy z kontaktního formuláře se zobrazí zde</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900">{s.name ?? "Bez jména"}</span>
                      <a href={`mailto:${s.email}`} className="text-indigo-600 text-sm hover:underline">
                        {s.email}
                      </a>
                      {s.phone && (
                        <a href={`tel:${s.phone}`} className="text-gray-500 text-sm hover:underline">
                          {s.phone}
                        </a>
                      )}
                    </div>
                    {s.message && (
                      <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">{s.message}</p>
                    )}
                  </div>
                  <time className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(s.created_at).toLocaleDateString("cs-CZ", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </time>
                </div>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`mailto:${s.email}?subject=Re: Váš dotaz`}
                    className="inline-block px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700"
                  >
                    Odpovědět e-mailem
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

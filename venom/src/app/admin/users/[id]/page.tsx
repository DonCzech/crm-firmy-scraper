"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface TenantDetail {
  id: number;
  slug: string;
  email: string;
  status: string;
  plan: string;
  business_name: string | null;
  industry: string | null;
  created_at: string;
  updated_at: string;
  sub_status: string | null;
  trial_starts_at: string | null;
  trial_ends_at: string | null;
  paid_at: string | null;
  next_billing_at: string | null;
  price_czk: number | null;
  days_remaining: number | null;
}

interface UserDetail {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  created_at: string;
  tenants: TenantDetail[];
}

function formatDate(d: string | null) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("cs-CZ");
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then((d) => { setUser(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <div className="p-8 text-gray-400">Uživatel nenalezen.</div>;

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/users" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
          ← Zpět na uživatele
        </Link>
      </div>

      {/* User info */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{user.name || user.email}</h1>
            <p className="text-gray-400 mt-0.5">{user.email}</p>
            {user.phone && <p className="text-gray-500 text-sm mt-0.5">{user.phone}</p>}
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>ID: #{user.id}</p>
            <p>Registrace: {formatDate(user.created_at)}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
            {user.tenants.length} projekt{user.tenants.length !== 1 ? "ů" : ""}
          </span>
          {user.tenants.some((t) => t.sub_status === "active") && (
            <span className="px-3 py-1 bg-emerald-900/50 text-emerald-300 text-xs rounded-full">Platící zákazník</span>
          )}
        </div>
      </div>

      {/* Tenants */}
      <h2 className="text-lg font-semibold text-white mb-4">Projekty / Weby</h2>
      {user.tenants.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-500 text-sm">
          Žádné projekty.
        </div>
      ) : (
        <div className="grid gap-4">
          {user.tenants.map((t) => (
            <div key={t.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white">{t.business_name || t.slug}</h3>
                    {t.sub_status === "active" ? (
                      <span className="px-2 py-0.5 text-xs bg-emerald-900/50 text-emerald-300 rounded-full">Aktivní</span>
                    ) : t.sub_status === "cancelled" ? (
                      <span className="px-2 py-0.5 text-xs bg-red-900/50 text-red-300 rounded-full">Zrušeno</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs bg-blue-900/50 text-blue-300 rounded-full">
                        {t.days_remaining !== null && t.days_remaining > 0 ? `Trial – ${t.days_remaining} dní` : "Trial vypršel"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">/{t.slug} · {t.industry || "–"}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/demo/${t.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Zobrazit demo
                  </a>
                  <a
                    href={`/demo/${t.slug}/admin`}
                    target="_blank"
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Admin webu
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-800/50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Trial začal</p>
                  <p className="text-sm text-gray-300">{formatDate(t.trial_starts_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Trial končí</p>
                  <p className="text-sm text-gray-300">{formatDate(t.trial_ends_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Zaplaceno</p>
                  <p className="text-sm text-gray-300">{formatDate(t.paid_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Příští platba</p>
                  <p className="text-sm text-gray-300">{formatDate(t.next_billing_at)}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Vytvořeno: {formatDate(t.created_at)}</span>
                <span>{t.price_czk !== null ? `${t.price_czk} Kč/měs.` : "500 Kč/měs."}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

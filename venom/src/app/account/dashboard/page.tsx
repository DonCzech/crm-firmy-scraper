"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Tenant {
  id: number;
  slug: string;
  email: string;
  status: string;
  plan: string;
  business_name: string | null;
  industry: string | null;
  created_at: string;
  sub_status: string | null;
  trial_ends_at: string | null;
  days_remaining: number | null;
}

interface User {
  id: number;
  email: string;
  name: string | null;
  tenants: Tenant[];
}

function TrialBadge({ days, status }: { days: number | null; status: string | null }) {
  if (status === "active") {
    return <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Aktivní</span>;
  }
  if (status === "cancelled") {
    return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Zrušeno</span>;
  }
  if (days === null || days === undefined) {
    return <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Trial</span>;
  }
  if (days <= 0) {
    return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Trial vypršel</span>;
  }
  if (days <= 7) {
    return <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">{days} dní zbývá</span>;
  }
  return <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{days} dní trial</span>;
}

export default function AccountDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => {
        if (r.status === 401) { router.push("/account/login"); return null; }
        return r.json();
      })
      .then((data) => {
        // API vrací 200 + { user: null } pro nepřihlášené (kvůli konzoli ve studiu)
        if (data && !data.email) { router.push("/account/login"); return; }
        if (data) setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/account/logout", { method: "POST" });
    router.push("/account/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-gray-900">Moje projekty</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Odhlásit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Vítejte{user.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-gray-500 mt-1">Správa vašich webových projektů</p>
        </div>

        {user.tenants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Zatím žádný projekt</h2>
            <p className="text-gray-500 mb-6">Vytvořte si svůj první web</p>
            <a
              href="/"
              className="inline-flex px-5 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors"
            >
              Vytvořit web
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {user.tenants.map((tenant) => (
              <div key={tenant.id} className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {(tenant.business_name || tenant.slug).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {tenant.business_name || tenant.slug}
                    </h3>
                    <TrialBadge days={tenant.days_remaining} status={tenant.sub_status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {tenant.industry || "Web"} · {tenant.slug}
                    {tenant.sub_status !== "active" && tenant.days_remaining !== null && tenant.days_remaining <= 7 && tenant.days_remaining > 0 && (
                      <span className="text-orange-600 font-medium"> · Trial brzy vyprší!</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <a
                    href={`/demo/${tenant.slug}`}
                    target="_blank"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Zobrazit
                  </a>
                  <a
                    href={`/demo/${tenant.slug}/admin`}
                    className="px-4 py-2 text-sm font-medium text-violet-700 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors"
                  >
                    Spravovat
                  </a>
                  <a
                    href={`/account/billing?tenant=${tenant.slug}`}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Billing
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

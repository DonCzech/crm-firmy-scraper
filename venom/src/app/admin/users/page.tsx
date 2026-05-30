"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UserRow {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  created_at: string;
  tenant_count: number;
  active_count: number;
  trial_count: number;
  paid_count: number;
}

interface OrphanTenant {
  id: number;
  slug: string;
  email: string;
  status: string;
  plan: string;
  industry: string | null;
  created_at: string;
  sub_status: string | null;
  days_remaining: number | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [orphans, setOrphans] = useState<OrphanTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users ?? []);
        setOrphans(d.orphanTenants ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Uživatelé</h1>
        <input
          type="text"
          placeholder="Hledat…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-60"
        />
      </div>

      {/* Registered users */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Registrovaní uživatelé ({filtered.length})</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">E-mail / Jméno</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Projekty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Platící</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Registrace</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Akce</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-3">
                  <p className="text-sm text-white font-medium">{u.email}</p>
                  {u.name && <p className="text-xs text-gray-500">{u.name}</p>}
                </td>
                <td className="px-6 py-3">
                  <span className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded-full">
                    {u.tenant_count} web{u.tenant_count !== 1 ? "ů" : ""}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {u.paid_count > 0 ? (
                    <span className="px-2 py-0.5 bg-emerald-900/50 text-emerald-300 text-xs rounded-full">
                      {u.paid_count} platících
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Trial</span>
                  )}
                </td>
                <td className="px-6 py-3 text-sm text-gray-500">
                  {new Date(u.created_at).toLocaleDateString("cs-CZ")}
                </td>
                <td className="px-6 py-3">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Detail →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">Žádní uživatelé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Orphan tenants (demo sites without user account) */}
      {orphans.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-white">Demo weby bez účtu ({orphans.length})</h2>
            <p className="text-xs text-gray-500 mt-0.5">Vytvořeny přes onboarding, uživatel si nezaregistroval účet</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">E-mail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Obor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Trial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Demo</th>
              </tr>
            </thead>
            <tbody>
              {orphans.map((t) => (
                <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-3 text-sm text-white font-medium">{t.slug}</td>
                  <td className="px-6 py-3 text-sm text-gray-400">{t.email}</td>
                  <td className="px-6 py-3 text-sm text-gray-400">{t.industry || "–"}</td>
                  <td className="px-6 py-3">
                    {t.days_remaining !== null && t.days_remaining > 0 ? (
                      <span className="text-xs text-blue-400">{t.days_remaining} dní</span>
                    ) : (
                      <span className="text-xs text-gray-500">–</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <a
                      href={`/demo/${t.slug}`}
                      target="_blank"
                      className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Zobrazit →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

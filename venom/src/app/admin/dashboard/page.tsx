"use client";

import { useEffect, useState } from "react";

interface Stats {
  users: number;
  tenants: { total: number; demo: number; active: number };
  subscriptions: { trial: number; paid: number; expired: number; cancelled: number };
  recentTenants: Array<{ slug: string; email: string; industry: string | null; created_at: string; sub_status: string | null }>;
  lifecycle: { active: number; inactive_warning: number; archived: number; at_risk: number };
  lastCleanupAt: string | null;
  lastCleanupSummary: { warned: number; archived: number; purged: number } | null;
  mrr: number;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleanupRunning, setCleanupRunning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  function loadStats() {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadStats(); }, []);

  async function runCleanup(dryRun: boolean) {
    setCleanupRunning(true);
    setCleanupResult(null);
    try {
      const res = await fetch(`/api/cron/cleanup-inactive${dryRun ? "?dry_run=1" : ""}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setCleanupResult(`Chyba: ${data.error}`);
      } else {
        setCleanupResult(
          `${dryRun ? "[DRY RUN] " : ""}Varováno: ${data.warned?.length ?? 0}, Archivováno: ${data.archived?.length ?? 0}, Smazáno: ${data.purged?.length ?? 0}`
        );
        if (!dryRun) loadStats();
      }
    } catch {
      setCleanupResult("Chyba při spuštění.");
    } finally {
      setCleanupRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-gray-400">Nelze načíst statistiky.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Přehled platformy</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Registrovaní uživatelé" value={stats.users} />
        <StatCard label="Celkem webů" value={stats.tenants.total} sub={`${stats.tenants.active} aktivních`} />
        <StatCard label="Platící zákazníci" value={stats.subscriptions.paid} sub="aktivní předplatné" />
        <StatCard label="MRR" value={`${stats.mrr.toLocaleString()} Kč`} sub="měsíční příjem" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-900/30 border border-blue-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-300">{stats.subscriptions.trial}</p>
          <p className="text-xs text-blue-400 mt-1">V trialu</p>
        </div>
        <div className="bg-emerald-900/30 border border-emerald-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-300">{stats.subscriptions.paid}</p>
          <p className="text-xs text-emerald-400 mt-1">Platících</p>
        </div>
        <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-300">{stats.subscriptions.expired}</p>
          <p className="text-xs text-red-400 mt-1">Expired</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-300">{stats.subscriptions.cancelled}</p>
          <p className="text-xs text-gray-400 mt-1">Zrušených</p>
        </div>
      </div>

      {/* Lifecycle / cleanup status */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-white text-sm">Čistění neaktivních webů</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {stats.lastCleanupAt
                ? <>Naposledy: <span className="text-gray-400">{new Date(stats.lastCleanupAt).toLocaleString("cs-CZ")}</span>
                  {stats.lastCleanupSummary && (
                    <span className="ml-2 text-gray-600">
                      (var: {stats.lastCleanupSummary.warned}, arch: {stats.lastCleanupSummary.archived}, smaz: {stats.lastCleanupSummary.purged})
                    </span>
                  )}
                </>
                : <span className="text-orange-400">Cron ještě neběžel — spusť ručně</span>
              }
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => runCleanup(true)}
              disabled={cleanupRunning}
              className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Dry run
            </button>
            <button
              onClick={() => runCleanup(false)}
              disabled={cleanupRunning}
              className="px-3 py-1.5 text-xs bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {cleanupRunning ? "Probíhá…" : "Spustit čistění"}
            </button>
          </div>
        </div>
        {cleanupResult && (
          <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-mono ${cleanupResult.startsWith("Chyba") ? "bg-red-900/30 text-red-300" : "bg-emerald-900/30 text-emerald-300"}`}>
            {cleanupResult}
          </div>
        )}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-800/60 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-400">{stats.lifecycle?.active ?? 0}</p>
            <p className="text-xs text-gray-400 mt-0.5">Aktivních</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-yellow-300">{stats.lifecycle?.at_risk ?? 0}</p>
            <p className="text-xs text-yellow-500 mt-0.5">Rizikoví (45+ dní)</p>
          </div>
          <div className="bg-orange-900/20 border border-orange-800/40 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-orange-300">{stats.lifecycle?.inactive_warning ?? 0}</p>
            <p className="text-xs text-orange-500 mt-0.5">Varování (53+ dní)</p>
          </div>
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-red-400">{stats.lifecycle?.archived ?? 0}</p>
            <p className="text-xs text-red-500 mt-0.5">Archivováno (60+ dní)</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Poslední registrace</h2>
          <a href="/admin/users" className="text-sm text-indigo-400 hover:text-indigo-300">
            Zobrazit vše →
          </a>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Obor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Registrace</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentTenants.map((t) => (
              <tr key={t.slug} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-3 text-sm text-white font-medium">{t.slug}</td>
                <td className="px-6 py-3 text-sm text-gray-400">{t.email}</td>
                <td className="px-6 py-3 text-sm text-gray-400">{t.industry || "–"}</td>
                <td className="px-6 py-3">
                  {t.sub_status === "active" ? (
                    <span className="px-2 py-0.5 text-xs bg-emerald-900/50 text-emerald-300 rounded-full">Aktivní</span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs bg-blue-900/50 text-blue-300 rounded-full">Trial</span>
                  )}
                </td>
                <td className="px-6 py-3 text-sm text-gray-500">
                  {new Date(t.created_at).toLocaleDateString("cs-CZ")}
                </td>
              </tr>
            ))}
            {stats.recentTenants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">Zatím žádné registrace.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

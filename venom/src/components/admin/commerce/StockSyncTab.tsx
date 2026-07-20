"use client";

import { useCallback, useEffect, useState } from "react";
import { api, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

/** Modul „Synchronizace skladu" — feed URL, ruční spuštění a historie běhů. */

interface SyncRun {
  id: number; feed_url: string; status: string;
  items_in_feed: number; matched: number; updated: number; unchanged: number;
  unknown_skus: string[]; error: string | null; created_at: string;
}

export function StockSyncTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [feedUrl, setFeedUrl] = useState("");
  const [demoFeedUrl, setDemoFeedUrl] = useState("");
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<{ config: { feed_url: string } | null; runs: SyncRun[]; demo_feed_url: string }>(`${base}/stock-sync`);
      if (data.config?.feed_url) setFeedUrl(data.config.feed_url);
      setDemoFeedUrl(data.demo_feed_url);
      setRuns(data.runs);
      setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function saveConfig() {
    if (feedUrl.trim().length < 4) { setError("Zadejte URL feedu"); return; }
    setSaving(true); setError(null); setNotice(null);
    try {
      await api(`${base}/stock-sync`, { method: "POST", body: JSON.stringify({ action: "save-config", feed_url: feedUrl.trim() }) });
      setNotice("Feed URL uloženo");
    } catch (e) { setError(e instanceof Error ? e.message : "Uložení selhalo"); }
    finally { setSaving(false); }
  }

  async function runSync() {
    setSyncing(true); setError(null); setNotice(null);
    try {
      const r = await api<{ items_in_feed: number; matched: number; updated: number; unchanged: number; unknown_skus: string[] }>(
        `${base}/stock-sync`, { method: "POST", body: JSON.stringify({ action: "run", feed_url: feedUrl.trim() || undefined }) }
      );
      setNotice(`Synchronizace hotová — ${r.updated} variant aktualizováno, ${r.unchanged} beze změny${r.unknown_skus.length ? `, ${r.unknown_skus.length} neznámých SKU` : ""}.`);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Synchronizace selhala"); }
    finally { setSyncing(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Synchronizace skladu</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">
          Načte skladový feed z URL (CSV <code className="rounded bg-slate-100 px-1 text-[12px]">sku,qty</code> nebo
          XML <code className="rounded bg-slate-100 px-1 text-[12px]">&lt;item&gt;&lt;sku&gt;&lt;qty&gt;</code>),
          spáruje podle SKU/EAN a zapíše nové stavy včetně skladových pohybů.
        </p>
      </div>

      <ErrorBanner message={error} />
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{notice}</div>
      )}

      <div className={`${t.sectionCls} space-y-3`}>
        <label className="block text-[13px]">
          <span className="mb-1 block font-semibold text-slate-700">URL skladového feedu</span>
          <input value={feedUrl} onChange={(e) => setFeedUrl(e.target.value)} disabled={loading}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-[12.5px]"
            placeholder="https://erp.example.cz/sklad.csv" />
        </label>
        {demoFeedUrl && (
          <p className="text-[12px] text-slate-400">
            Pro vyzkoušení použijte demo feed:{" "}
            <button type="button" className="font-mono font-semibold text-sky-600 hover:underline" onClick={() => setFeedUrl(demoFeedUrl)}>
              {demoFeedUrl}
            </button>
          </p>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={saveConfig} disabled={saving} className={t.btnGhost}>
            {saving ? "Ukládám…" : "Uložit URL"}
          </button>
          <button type="button" onClick={runSync} disabled={syncing || loading} className={t.btnPrimary}>
            {syncing ? "Synchronizuji…" : "Spustit synchronizaci"}
          </button>
        </div>
      </div>

      <div>
        <h3 className={`mb-2 text-[15px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Historie běhů</h3>
        <div className={`${t.sectionCls} overflow-x-auto !p-0`}>
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                <th className="px-4 py-3">Datum</th>
                <th className="px-4 py-3">Stav</th>
                <th className="px-4 py-3">Ve feedu</th>
                <th className="px-4 py-3">Spárováno</th>
                <th className="px-4 py-3">Aktualizováno</th>
                <th className="px-4 py-3">Neznámé SKU</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Načítám…</td></tr>
              ) : runs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Zatím žádné synchronizace.</td></tr>
              ) : runs.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    {r.status === "ok" ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">OK</span>
                    ) : (
                      <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600" title={r.error ?? undefined}>Chyba</span>
                    )}
                    {r.error && <div className="mt-1 max-w-[260px] text-[11.5px] text-rose-500">{r.error}</div>}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{r.items_in_feed}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{r.matched}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-slate-900">{r.updated}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {r.unknown_skus.length === 0 ? "—" : (
                      <span title={r.unknown_skus.join(", ")}>{r.unknown_skus.length}×</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

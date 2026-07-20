"use client";

import { useCallback, useEffect, useState } from "react";
import { api, czk, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

/** Modul „Provizní systém" — partneři, ref. odkazy a konverze. */

interface AffiliateRow {
  id: number; name: string; email: string | null; code: string;
  commission_pct: number; status: string; created_at: string;
  conversions_count: number; orders_total_cents: number;
  commission_pending_cents: number; commission_approved_cents: number; commission_paid_cents: number;
}
interface ConversionRow {
  id: number; affiliate_id: number; affiliate_name: string; affiliate_code: string;
  order_id: number; order_number: string | null; order_total_cents: number;
  commission_cents: number; status: string; created_at: string;
}

const CONV_LABELS: Record<string, string> = { pending: "Čeká", approved: "Schváleno", paid: "Vyplaceno", rejected: "Zamítnuto" };
const CONV_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-sky-50 text-sky-600",
  paid: "bg-emerald-50 text-emerald-600",
  rejected: "bg-rose-50 text-rose-500",
};

export function AffiliatesTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([]);
  const [conversions, setConversions] = useState<ConversionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", code: "", commission_pct: "5" });
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // /api/demo/{slug}/commerce → /demo/{slug}/obchod
  const shopPath = base.replace(/^\/api/, "").replace(/\/commerce$/, "/obchod");

  const load = useCallback(async () => {
    try {
      const data = await api<{ affiliates: AffiliateRow[]; conversions: ConversionRow[] }>(`${base}/affiliates`);
      setAffiliates(data.affiliates);
      setConversions(data.conversions);
      setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function post(body: Record<string, unknown>) {
    setError(null);
    try {
      await api(`${base}/affiliates`, { method: "POST", body: JSON.stringify(body) });
      await load();
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : "Akce selhala"); return false; }
  }

  async function createAffiliate() {
    if (form.name.trim().length < 2) { setError("Vyplňte jméno partnera"); return; }
    setSaving(true);
    const ok = await post({
      action: "create", name: form.name.trim(), email: form.email.trim() || undefined,
      code: form.code.trim() || undefined, commission_pct: parseFloat(form.commission_pct) || 5,
    });
    setSaving(false);
    if (ok) { setForm({ name: "", email: "", code: "", commission_pct: "5" }); setShowForm(false); }
  }

  function copyLink(a: AffiliateRow) {
    navigator.clipboard.writeText(`${window.location.origin}${shopPath}?aff=${a.code}`).then(() => {
      setCopiedId(a.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  const pendingTotal = affiliates.reduce((s, a) => s + a.commission_pending_cents, 0);
  const paidTotal = affiliates.reduce((s, a) => s + a.commission_paid_cents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Provizní systém</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Partneři sdílejí odkaz s <code className="rounded bg-slate-100 px-1 text-[12px]">?aff=KOD</code> — návštěva se uloží na 30 dní
            a každá objednávka se připíše jako konverze s provizí.
          </p>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className={t.btnPrimary}>
          {showForm ? "Zavřít" : "+ Nový partner"}
        </button>
      </div>

      <ErrorBanner message={error} />

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Partneři", String(affiliates.length)],
          ["Konverze", String(conversions.length)],
          ["Provize čeká", czk(pendingTotal)],
          ["Provize vyplaceno", czk(paidTotal)],
        ].map(([label, value]) => (
          <div key={label} className={`${t.sectionCls} !p-4`}>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</div>
            <div className="mt-1 text-[20px] font-bold tabular-nums text-slate-900">{loading ? "…" : value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className={`${t.sectionCls} space-y-3`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[13px]">
              <span className="mb-1 block font-semibold text-slate-700">Jméno partnera *</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13.5px]" placeholder="Jan Novák / blog.cz" />
            </label>
            <label className="block text-[13px]">
              <span className="mb-1 block font-semibold text-slate-700">E-mail</span>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13.5px]" placeholder="partner@example.cz" />
            </label>
            <label className="block text-[13px]">
              <span className="mb-1 block font-semibold text-slate-700">Kód (volitelně, jinak vygenerujeme)</span>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13.5px] uppercase" placeholder="NOVAK10" />
            </label>
            <label className="block text-[13px]">
              <span className="mb-1 block font-semibold text-slate-700">Provize (%)</span>
              <input type="number" min="0" max="50" step="0.5" value={form.commission_pct}
                onChange={(e) => setForm({ ...form, commission_pct: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13.5px]" />
            </label>
          </div>
          <button type="button" onClick={createAffiliate} disabled={saving} className={t.btnPrimary}>
            {saving ? "Ukládám…" : "Vytvořit partnera"}
          </button>
        </div>
      )}

      <div className={`${t.sectionCls} overflow-x-auto !p-0`}>
        <table className="w-full min-w-[860px] text-[13px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Kód / odkaz</th>
              <th className="px-4 py-3">Provize</th>
              <th className="px-4 py-3">Konverze</th>
              <th className="px-4 py-3">Obrat</th>
              <th className="px-4 py-3">Čeká / vyplaceno</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Načítám…</td></tr>
            ) : affiliates.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Zatím žádní partneři — vytvořte prvního.</td></tr>
            ) : affiliates.map((a) => (
              <tr key={a.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{a.name}</div>
                  {a.email && <div className="text-[12px] text-slate-400">{a.email}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] font-bold">{a.code}</code>
                    <button type="button" onClick={() => copyLink(a)}
                      className="text-[12px] font-semibold text-sky-600 hover:underline">
                      {copiedId === a.id ? "Zkopírováno ✓" : "Kopírovat odkaz"}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-600">{a.commission_pct} %</td>
                <td className="px-4 py-3 tabular-nums text-slate-600">{a.conversions_count}</td>
                <td className="px-4 py-3 tabular-nums text-slate-600">{czk(a.orders_total_cents)}</td>
                <td className="px-4 py-3 tabular-nums text-slate-600">
                  {czk(a.commission_pending_cents)} / {czk(a.commission_paid_cents)}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${a.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                    {a.status === "active" ? "Aktivní" : "Pozastaven"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" className={`${t.btnGhost} !px-2.5 !py-1 !text-[12px]`}
                      onClick={() => post({ action: "update", id: a.id, status: a.status === "active" ? "paused" : "active" })}>
                      {a.status === "active" ? "Pozastavit" : "Aktivovat"}
                    </button>
                    <button type="button" className="rounded-lg px-2.5 py-1 text-[12px] font-semibold text-rose-500 hover:bg-rose-50"
                      onClick={() => { if (confirm(`Smazat partnera ${a.name} včetně konverzí?`)) post({ action: "delete", id: a.id }); }}>
                      Smazat
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className={`mb-2 text-[15px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Konverze</h3>
        <div className={`${t.sectionCls} overflow-x-auto !p-0`}>
          <table className="w-full min-w-[760px] text-[13px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                <th className="px-4 py-3">Objednávka</th>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Hodnota</th>
                <th className="px-4 py-3">Provize</th>
                <th className="px-4 py-3">Stav</th>
                <th className="px-4 py-3">Datum</th>
              </tr>
            </thead>
            <tbody>
              {conversions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Zatím žádné konverze — objednávky z ref. odkazů se objeví zde.
                </td></tr>
              ) : conversions.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-900">{c.order_number ?? `#${c.order_id}`}</td>
                  <td className="px-4 py-3 text-slate-600">{c.affiliate_name} <code className="rounded bg-slate-100 px-1 text-[11px]">{c.affiliate_code}</code></td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{czk(c.order_total_cents)}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-slate-900">{czk(c.commission_cents)}</td>
                  <td className="px-4 py-3">
                    <select value={c.status}
                      onChange={(e) => post({ action: "conversion-status", id: c.id, status: e.target.value })}
                      className={`rounded-full border-0 px-2.5 py-0.5 text-[11px] font-bold ${CONV_COLORS[c.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {Object.entries(CONV_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

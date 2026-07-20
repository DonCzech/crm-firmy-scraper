"use client";

import { useCallback, useEffect, useState } from "react";
import { api, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

/** Modul „Hromadné e-maily“ — kampaně nad reálnými segmenty + outbox. */

interface Campaign {
  id: number; name: string; subject: string; html_body: string; segment: string;
  status: "draft" | "sent"; recipients_count: number; sent_count: number; failed_count: number;
  sent_at: string | null; created_at: string;
}
interface Segment { key: string; label: string; description: string }
interface OutboxRow { id: number; to_email: string; subject: string; status: string; sent_at: string | null; error: string | null }

export function EmailCampaignsTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentCounts, setSegmentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [outboxFor, setOutboxFor] = useState<Campaign | null>(null);
  const [outbox, setOutbox] = useState<OutboxRow[]>([]);

  // Formulář nové kampaně
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [segment, setSegment] = useState("customers-all");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ campaigns: Campaign[]; segments: Segment[]; segmentCounts: Record<string, number> }>(`${base}/email-campaigns`);
      setCampaigns(data.campaigns);
      setSegments(data.segments);
      setSegmentCounts(data.segmentCounts);
      setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function create() {
    if (!name.trim() || !subject.trim() || !body.trim()) { setError("Vyplňte název, předmět i obsah"); return; }
    setSaving(true);
    try {
      await api(`${base}/email-campaigns`, {
        method: "POST",
        body: JSON.stringify({ action: "create", name, subject, html_body: body.replace(/\n/g, "<br>"), segment }),
      });
      setName(""); setSubject(""); setBody(""); setShowForm(false);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Uložení selhalo"); }
    finally { setSaving(false); }
  }

  async function send(c: Campaign) {
    if (!confirm(`Odeslat kampaň „${c.name}" segmentu ${segments.find((s) => s.key === c.segment)?.label ?? c.segment} (${segmentCounts[c.segment] ?? "?"} příjemců)?`)) return;
    setBusyId(c.id);
    try {
      await api(`${base}/email-campaigns`, { method: "POST", body: JSON.stringify({ action: "send", id: c.id }) });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Odeslání selhalo"); }
    finally { setBusyId(null); }
  }

  async function remove(c: Campaign) {
    if (!confirm(`Smazat koncept „${c.name}"?`)) return;
    setBusyId(c.id);
    try {
      await api(`${base}/email-campaigns`, { method: "POST", body: JSON.stringify({ action: "delete", id: c.id }) });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Smazání selhalo"); }
    finally { setBusyId(null); }
  }

  async function openOutbox(c: Campaign) {
    setOutboxFor(c);
    setOutbox([]);
    try {
      const data = await api<{ outbox: OutboxRow[] }>(`${base}/email-campaigns?outbox=${c.id}`);
      setOutbox(data.outbox);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení outboxu selhalo"); }
  }

  const segLabel = (key: string) => segments.find((s) => s.key === key)?.label ?? key;
  const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13.5px] text-slate-900 outline-none transition focus:border-slate-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>E-mailové kampaně</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">Hromadné rozesílky nad reálnými segmenty zákazníků. Každé odeslání se ukládá do outboxu.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className={t.btnPrimary}>
          {showForm ? "Zavřít formulář" : "+ Nová kampaň"}
        </button>
      </div>

      <ErrorBanner message={error} />

      {/* Segmenty s reálnými počty */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {segments.map((s) => (
          <div key={s.key} className={`${t.sectionCls} !p-4`}>
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">{s.label}</div>
            <div className="mt-1 text-[22px] font-bold tabular-nums text-slate-900">{segmentCounts[s.key] ?? "…"}</div>
            <div className="mt-0.5 text-[11.5px] leading-snug text-slate-400">{s.description}</div>
          </div>
        ))}
      </div>

      {/* Nová kampaň */}
      {showForm && (
        <div className={`${t.sectionCls} space-y-3`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-slate-500">Interní název</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Letní výprodej 2026" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-slate-500">Segment příjemců</span>
              <select value={segment} onChange={(e) => setSegment(e.target.value)} className={inputCls}>
                {segments.map((s) => (
                  <option key={s.key} value={s.key}>{s.label} ({segmentCounts[s.key] ?? 0})</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-slate-500">Předmět e-mailu</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="☀️ Slevy až 40 % jen tento týden" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-slate-500">Obsah (řádky se převedou na odstavce)</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Dobrý den,&#10;právě jsme spustili letní výprodej…" className={inputCls} />
          </label>
          <div className="flex justify-end">
            <button onClick={create} disabled={saving} className={t.btnPrimary}>
              {saving ? "Ukládám…" : "Uložit koncept"}
            </button>
          </div>
        </div>
      )}

      {/* Seznam kampaní */}
      {loading ? (
        <p className="py-8 text-center text-[13px] text-slate-400">Načítám…</p>
      ) : campaigns.length === 0 ? (
        <p className={`${t.sectionCls} py-10 text-center text-[13.5px] text-slate-400`}>Zatím žádné kampaně — vytvořte první.</p>
      ) : (
        <div className={`${t.sectionCls} overflow-x-auto !p-0`}>
          <table className="w-full min-w-[760px] text-[13px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                <th className="px-4 py-3">Kampaň</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Stav</th>
                <th className="px-4 py-3 text-right">Příjemci</th>
                <th className="px-4 py-3 text-right">Odesláno / Chyby</th>
                <th className="px-4 py-3">Odesláno dne</th>
                <th className="px-4 py-3 text-right">Akce</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-[12px] text-slate-400">{c.subject}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{segLabel(c.segment)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      c.status === "sent" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {c.status === "sent" ? "Odesláno" : "Koncept"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                    {c.status === "sent" ? c.recipients_count : (segmentCounts[c.segment] ?? "—")}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="font-semibold text-emerald-600">{c.sent_count}</span>
                    <span className="text-slate-300"> / </span>
                    <span className={c.failed_count > 0 ? "font-semibold text-rose-600" : "text-slate-400"}>{c.failed_count}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{fmtDate(c.sent_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      {c.status === "draft" ? (
                        <>
                          <button onClick={() => send(c)} disabled={busyId === c.id} className={`${t.btnPrimary} !h-8 !px-3 !text-[12px]`}>
                            {busyId === c.id ? "Odesílám…" : "Odeslat"}
                          </button>
                          <button onClick={() => remove(c)} disabled={busyId === c.id} className={`${t.btnGhost} !h-8 !px-3 !text-[12px]`}>Smazat</button>
                        </>
                      ) : (
                        <button onClick={() => openOutbox(c)} className={`${t.btnGhost} !h-8 !px-3 !text-[12px]`}>Outbox</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Outbox modal */}
      {outboxFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOutboxFor(null)}>
          <div className="max-h-[80vh] w-full max-w-[640px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">Outbox — {outboxFor.name}</h3>
                <p className="text-[12.5px] text-slate-500">{outboxFor.subject}</p>
              </div>
              <button onClick={() => setOutboxFor(null)} className="text-[20px] leading-none text-slate-400 hover:text-slate-700">×</button>
            </div>
            <table className="mt-4 w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  <th className="py-2 pr-3">Příjemce</th>
                  <th className="py-2 pr-3">Stav</th>
                  <th className="py-2">Odesláno</th>
                </tr>
              </thead>
              <tbody>
                {outbox.length === 0 && (
                  <tr><td colSpan={3} className="py-6 text-center text-slate-400">Načítám outbox…</td></tr>
                )}
                {outbox.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 pr-3 font-medium text-slate-800">{r.to_email}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                        r.status === "sent" ? "bg-emerald-50 text-emerald-600" : r.status === "failed" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {r.status === "sent" ? "Odesláno" : r.status === "failed" ? "Chyba" : "Čeká"}
                      </span>
                      {r.error && <span className="ml-2 text-[11px] text-rose-500">{r.error}</span>}
                    </td>
                    <td className="py-2 text-slate-500">{fmtDate(r.sent_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

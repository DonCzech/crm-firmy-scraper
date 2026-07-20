"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { api, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

interface WebhookLog { id: number; event: string; status_code: number; duration_ms: number; created_at: string }
interface Webhook {
  id: number; url: string; events: string[]; active: boolean;
  fail_count: number; secret?: string; last_triggered_at: string | null;
}

const ALL_EVENTS = [
  "order.created", "order.paid", "order.shipped", "order.completed", "order.cancelled",
  "product.created", "product.updated", "product.deleted",
  "stock.low", "customer.created", "subscription.renewed",
];

const EVENT_LABEL: Record<string, string> = {
  "order.created": "Objednavka vytvorena", "order.paid": "Zaplaceno", "order.shipped": "Odesláno",
  "order.completed": "Dokonceno", "order.cancelled": "Stornováno",
  "product.created": "Produkt vytvoren", "product.updated": "Produkt upraven", "product.deleted": "Produkt smazán",
  "stock.low": "Nízký sklad", "customer.created": "Nový zákazník", "subscription.renewed": "Předplatné obnoveno",
};

export function WebhooksTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const ep = `${base}/webhooks`;
  const [rows, setRows] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formUrl, setFormUrl] = useState("");
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [formActive, setFormActive] = useState(true);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await api<{ webhooks: Webhook[] }>(ep);
      setRows(d.webhooks ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Chyba"); }
    finally { setLoading(false); }
  }, [ep]);

  useEffect(() => { load(); }, [load]);

  async function loadLogs(id: number, page: number) {
    try {
      const d = await api<{ logs: WebhookLog[]; total: number }>(`${ep}/${id}/logs?page=${page}&perPage=10`);
      setLogs(d.logs ?? []); setLogTotal(d.total ?? 0); setLogPage(page);
    } catch {}
  }

  function openCreate() {
    setEditId(null); setFormUrl(""); setFormEvents([]); setFormActive(true);
    setCreatedSecret(null); setShowForm(true);
  }

  function openEdit(w: Webhook) {
    setEditId(w.id); setFormUrl(w.url); setFormEvents([...w.events]); setFormActive(w.active);
    setCreatedSecret(null); setShowForm(true);
  }

  async function submit() {
    setSaving(true); setError(null);
    try {
      if (editId) {
        await api(`${ep}/${editId}`, { method: "PUT", body: JSON.stringify({ url: formUrl, events: formEvents, active: formActive }) });
      } else {
        const d = await api<{ webhook: Webhook }>(`${ep}`, { method: "POST", body: JSON.stringify({ url: formUrl, events: formEvents }) });
        if (d.webhook?.secret) setCreatedSecret(d.webhook.secret);
      }
      setShowForm(false); setEditId(null); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Chyba"); }
    finally { setSaving(false); }
  }

  async function del(id: number) {
    try { await api(`${ep}/${id}`, { method: "DELETE" }); setConfirmDel(null); load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Chyba"); }
  }

  async function test(id: number) {
    try { await api(`${ep}/${id}/test`, { method: "POST" }); load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Test selhal"); }
  }

  function toggleEvent(ev: string) {
    setFormEvents((p) => p.includes(ev) ? p.filter((e) => e !== ev) : [...p, ev]);
  }

  function expand(id: number) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id); loadLogs(id, 1);
  }

  if (loading) return <p className="py-8 text-center text-[13px] text-slate-400">Nacitam webhooky...</p>;

  const logPages = Math.ceil(logTotal / 10);

  return (
    <div className="space-y-5">
      <ErrorBanner message={error} />

      {createdSecret && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          <strong>Secret (zobrazen pouze jednou):</strong>{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[12px]">{createdSecret}</code>
        </div>
      )}

      {showForm && (
        <div className={t.sectionCls}>
          <h3 className={t.sectionTitleCls}>{editId ? "Upravit webhook" : "Nový webhook"}</h3>
          <div className="space-y-4">
            <div>
              <label className={t.labelCls}>URL</label>
              <input className={t.inputCls} value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className={t.labelCls}>Události</label>
              <div className="flex flex-wrap gap-2">
                {ALL_EVENTS.map((ev) => (
                  <label key={ev} className="flex items-center gap-1.5 text-[12px] text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={formEvents.includes(ev)} onChange={() => toggleEvent(ev)} className={`h-3.5 w-3.5 rounded ${t.checkboxAccentCls}`} />
                    {EVENT_LABEL[ev] ?? ev}
                  </label>
                ))}
              </div>
            </div>
            {editId && (
              <div>
                <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} className={`h-3.5 w-3.5 rounded ${t.checkboxAccentCls}`} />
                  Aktivní
                </label>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={submit} disabled={saving || !formUrl || !formEvents.length} className={t.btnPrimary}>
                {saving ? "Ukládám..." : editId ? "Uložit" : "Vytvořit"}
              </button>
              <button onClick={() => setShowForm(false)} className={t.btnGhost}>Zrušit</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {!showForm && <button onClick={openCreate} className={t.btnPrimary}>Nový webhook</button>}
      </div>

      {!rows.length ? (
        <div className={t.emptyStateCls}>
          <p className="text-[14px] font-semibold text-slate-400">Žádné webhooky</p>
          <p className="mt-1 text-[12px] text-slate-400">Vytvořte webhook pro odesílání událostí.</p>
        </div>
      ) : (
        <div className={t.tableShellCls}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className={t.tableHeadRowCls}>
                <th className="px-4 py-2.5">URL</th>
                <th className="px-4 py-2.5">Události</th>
                <th className="px-4 py-2.5">Stav</th>
                <th className="px-4 py-2.5">Chyby</th>
                <th className="px-4 py-2.5">Poslední spuštění</th>
                <th className="px-4 py-2.5">Akce</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <Fragment key={w.id}>
                  <tr className={`${t.tableRowCls} cursor-pointer`} onClick={() => expand(w.id)}>
                    <td className="px-4 py-2.5 max-w-[220px] truncate font-mono text-[12px]">{w.url}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {w.events.slice(0, 3).map((ev) => (
                          <span key={ev} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{ev}</span>
                        ))}
                        {w.events.length > 3 && <span className="text-[10px] text-slate-400">+{w.events.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${w.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}>
                        {w.active ? "Aktivní" : "Neaktivní"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`font-semibold ${w.fail_count > 0 ? "text-rose-600" : "text-slate-400"}`}>{w.fail_count}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{fmtDate(w.last_triggered_at)}</td>
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1.5">
                        <button onClick={() => test(w.id)} className={t.btnGhost + " !h-7 !px-2.5 !text-[11px]"}>Test</button>
                        <button onClick={() => openEdit(w)} className={t.btnGhost + " !h-7 !px-2.5 !text-[11px]"}>Upravit</button>
                        {confirmDel === w.id ? (
                          <>
                            <button onClick={() => del(w.id)} className={t.btnDanger + " !h-7 !px-2.5 !text-[11px]"}>Potvrdit</button>
                            <button onClick={() => setConfirmDel(null)} className={t.btnGhost + " !h-7 !px-2.5 !text-[11px]"}>Ne</button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDel(w.id)} className={t.btnDanger + " !h-7 !px-2.5 !text-[11px]"}>Smazat</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === w.id && (
                    <tr>
                      <td colSpan={6} className={`px-4 py-4 ${t.expandedRowCls}`}>
                        <h4 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-slate-500">Logy</h4>
                        {!logs.length ? (
                          <p className="text-[12px] text-slate-400">Žádné záznamy.</p>
                        ) : (
                          <>
                            <table className="w-full text-[12px]">
                              <thead>
                                <tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wider text-slate-400">
                                  <th className="pb-1.5 pr-3">Událost</th>
                                  <th className="pb-1.5 pr-3">Status</th>
                                  <th className="pb-1.5 pr-3">Doba (ms)</th>
                                  <th className="pb-1.5">Datum</th>
                                </tr>
                              </thead>
                              <tbody>
                                {logs.map((l) => (
                                  <tr key={l.id} className="border-b border-slate-50">
                                    <td className="py-1.5 pr-3 font-mono">{l.event}</td>
                                    <td className="py-1.5 pr-3">
                                      <span className={`font-semibold ${l.status_code >= 200 && l.status_code < 300 ? "text-emerald-600" : l.status_code >= 400 ? "text-rose-600" : "text-amber-600"}`}>
                                        {l.status_code}
                                      </span>
                                    </td>
                                    <td className="py-1.5 pr-3 text-slate-500">{l.duration_ms}</td>
                                    <td className="py-1.5 text-slate-500">{fmtDate(l.created_at)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {logPages > 1 && (
                              <div className="mt-2 flex gap-2">
                                <button disabled={logPage <= 1} onClick={() => loadLogs(w.id, logPage - 1)} className={t.pagerBtnCls}>Předchozí</button>
                                <span className="py-1.5 text-[12px] text-slate-400">{logPage} / {logPages}</span>
                                <button disabled={logPage >= logPages} onClick={() => loadLogs(w.id, logPage + 1)} className={t.pagerBtnCls}>Další</button>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

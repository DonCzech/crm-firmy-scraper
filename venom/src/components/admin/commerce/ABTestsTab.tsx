"use client";

import { useCallback, useEffect, useState } from "react";
import { api, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

interface ABTest {
  id: number; name: string; entity_type: string; entity_id: number;
  status: "draft" | "running" | "completed"; traffic_split: number;
  views_a: number; views_b: number; conversions_a: number; conversions_b: number;
  winner: "a" | "b" | null; variant_a: string; variant_b: string;
  created_at: string; updated_at: string;
}

const ENTITY_TYPES = [
  { value: "product_page", label: "Produktová stránka" },
  { value: "category_page", label: "Kategorie" },
  { value: "checkout", label: "Pokladna" },
];

const STATUS_CLS: Record<string, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  running: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};
const STATUS_LABEL: Record<string, string> = { draft: "Koncept", running: "Běží", completed: "Dokončeno" };

function rate(conv: number, views: number) {
  if (!views) return 0;
  return (conv / views) * 100;
}

function calcSignificance(vA: number, cA: number, vB: number, cB: number) {
  if (!vA || !vB) return { lift: 0, confidence: 0, significant: false };
  const rA = cA / vA;
  const rB = cB / vB;
  const lift = rA > 0 ? ((rB - rA) / rA) * 100 : 0;
  const seA = Math.sqrt((rA * (1 - rA)) / vA);
  const seB = Math.sqrt((rB * (1 - rB)) / vB);
  const se = Math.sqrt(seA * seA + seB * seB);
  const z = se > 0 ? Math.abs(rB - rA) / se : 0;
  const confidence = Math.min(99.9, (1 - Math.exp(-0.717 * z - 0.416 * z * z)) * 100);
  return { lift, confidence: Math.max(0, confidence), significant: confidence >= 95 };
}

export function ABTestsTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const ep = `${base}/ab-tests`;
  const [rows, setRows] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [fName, setFName] = useState("");
  const [fType, setFType] = useState("product_page");
  const [fEntityId, setFEntityId] = useState("");
  const [fVarA, setFVarA] = useState("{}");
  const [fVarB, setFVarB] = useState("{}");
  const [fSplit, setFSplit] = useState(50);
  const [saving, setSaving] = useState(false);
  const [stopId, setStopId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await api<{ tests: ABTest[] }>(ep);
      setRows(d.tests ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Chyba"); }
    finally { setLoading(false); }
  }, [ep]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditId(null); setFName(""); setFType("product_page"); setFEntityId("");
    setFVarA("{}"); setFVarB("{}"); setFSplit(50); setShowForm(true);
  }

  async function submit() {
    setSaving(true); setError(null);
    try {
      const body = { name: fName, entity_type: fType, entity_id: Number(fEntityId), variant_a: fVarA, variant_b: fVarB, traffic_split: fSplit };
      if (editId) {
        await api(`${ep}/${editId}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await api(ep, { method: "POST", body: JSON.stringify(body) });
      }
      setShowForm(false); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Chyba"); }
    finally { setSaving(false); }
  }

  async function start(id: number) {
    try { await api(`${ep}/${id}/start`, { method: "POST" }); load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Chyba"); }
  }

  async function stop(id: number, winner: "a" | "b") {
    try { await api(`${ep}/${id}/stop`, { method: "POST", body: JSON.stringify({ winner }) }); setStopId(null); load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Chyba"); }
  }

  if (loading) return <p className="py-8 text-center text-[13px] text-slate-400">Nacitam A/B testy...</p>;

  const detail = detailId ? rows.find((r) => r.id === detailId) : null;

  return (
    <div className="space-y-5">
      <ErrorBanner message={error} />

      {showForm && (
        <div className={t.sectionCls}>
          <h3 className={t.sectionTitleCls}>{editId ? "Upravit test" : "Nový A/B test"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={t.labelCls}>Název</label>
              <input className={t.inputCls} value={fName} onChange={(e) => setFName(e.target.value)} />
            </div>
            <div>
              <label className={t.labelCls}>Typ entity</label>
              <select className={t.inputCls} value={fType} onChange={(e) => setFType(e.target.value)}>
                {ENTITY_TYPES.map((et) => <option key={et.value} value={et.value}>{et.label}</option>)}
              </select>
            </div>
            <div>
              <label className={t.labelCls}>ID entity</label>
              <input className={t.inputCls} type="number" value={fEntityId} onChange={(e) => setFEntityId(e.target.value)} />
            </div>
            <div>
              <label className={t.labelCls}>Rozložení provozu: {fSplit}% / {100 - fSplit}%</label>
              <input type="range" min={10} max={90} step={5} value={fSplit} onChange={(e) => setFSplit(Number(e.target.value))}
                className={`w-full ${t.checkboxAccentCls}`} />
            </div>
            <div className="sm:col-span-2">
              <label className={t.labelCls}>Varianta A (JSON)</label>
              <textarea className={t.inputCls + " !h-24 py-2 font-mono text-[12px]"} value={fVarA} onChange={(e) => setFVarA(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={t.labelCls}>Varianta B (JSON)</label>
              <textarea className={t.inputCls + " !h-24 py-2 font-mono text-[12px]"} value={fVarB} onChange={(e) => setFVarB(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={submit} disabled={saving || !fName} className={t.btnPrimary}>{saving ? "Ukládám..." : "Uložit"}</button>
            <button onClick={() => setShowForm(false)} className={t.btnGhost}>Zrušit</button>
          </div>
        </div>
      )}

      {detail && (
        <div className={t.sectionCls}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={t.sectionTitleCls}>{detail.name} — detail</h3>
            <button onClick={() => setDetailId(null)} className={t.btnGhost + " !h-7 !px-2.5 !text-[11px]"}>Zavřít</button>
          </div>
          {(() => {
            const rA = rate(detail.conversions_a, detail.views_a);
            const rB = rate(detail.conversions_b, detail.views_b);
            const sig = calcSignificance(detail.views_a, detail.conversions_a, detail.views_b, detail.conversions_b);
            const maxRate = Math.max(rA, rB, 1);
            return (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-[12px] font-semibold text-slate-500">Varianta A</p>
                    <p className="text-[20px] font-bold text-slate-800">{rA.toFixed(2)}%</p>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(rA / maxRate) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-400">{detail.conversions_a} konverzí / {detail.views_a} zobrazení</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[12px] font-semibold text-slate-500">Varianta B</p>
                    <p className="text-[20px] font-bold text-slate-800">{rB.toFixed(2)}%</p>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(rB / maxRate) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-400">{detail.conversions_b} konverzí / {detail.views_b} zobrazení</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div><span className="text-[11px] text-slate-400">Lift</span><p className="text-[14px] font-bold text-slate-700">{sig.lift > 0 ? "+" : ""}{sig.lift.toFixed(1)}%</p></div>
                  <div><span className="text-[11px] text-slate-400">Spolehlivost</span><p className="text-[14px] font-bold text-slate-700">{sig.confidence.toFixed(1)}%</p></div>
                  <div>
                    {sig.significant ? (
                      <span className="mt-1 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Statisticky významné</span>
                    ) : (
                      <span className="mt-1 inline-block rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">Nedostatečná data</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div className="flex items-center gap-3">
        {!showForm && <button onClick={openCreate} className={t.btnPrimary}>Nový A/B test</button>}
      </div>

      {!rows.length ? (
        <div className={t.emptyStateCls}>
          <p className="text-[14px] font-semibold text-slate-400">Žádné A/B testy</p>
          <p className="mt-1 text-[12px] text-slate-400">Vytvořte test pro optimalizaci konverzí.</p>
        </div>
      ) : (
        <div className={t.tableShellCls}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className={t.tableHeadRowCls}>
                <th className="px-4 py-2.5">Název</th>
                <th className="px-4 py-2.5">Typ</th>
                <th className="px-4 py-2.5">Stav</th>
                <th className="px-4 py-2.5">Provoz</th>
                <th className="px-4 py-2.5">Zobrazení A/B</th>
                <th className="px-4 py-2.5">Konverze A/B</th>
                <th className="px-4 py-2.5">Vítěz</th>
                <th className="px-4 py-2.5">Akce</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const rA = rate(r.conversions_a, r.views_a);
                const rB = rate(r.conversions_b, r.views_b);
                const maxR = Math.max(rA, rB, 1);
                return (
                  <tr key={r.id} className={t.tableRowCls}>
                    <td className="px-4 py-2.5 font-semibold">
                      <button onClick={() => setDetailId(r.id)} className={t.linkAccentCls}>{r.name}</button>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{ENTITY_TYPES.find((e) => e.value === r.entity_type)?.label ?? r.entity_type}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_CLS[r.status] ?? ""}`}>{STATUS_LABEL[r.status] ?? r.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{r.traffic_split}/{100 - r.traffic_split}</td>
                    <td className="px-4 py-2.5 text-slate-500">{r.views_a} / {r.views_b}</td>
                    <td className="px-4 py-2.5">
                      {r.status === "running" ? (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1 w-24">
                            <div className="flex items-center gap-1">
                              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(rA / maxR) * 100}%`, minWidth: 2 }} />
                              <span className="text-[10px] text-slate-500">{rA.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(rB / maxR) * 100}%`, minWidth: 2 }} />
                              <span className="text-[10px] text-slate-500">{rB.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">{r.conversions_a} / {r.conversions_b}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {r.winner ? <span className="font-bold text-emerald-600">{r.winner.toUpperCase()}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1.5">
                        {r.status === "draft" && <button onClick={() => start(r.id)} className={t.btnPrimary + " !h-7 !px-2.5 !text-[11px]"}>Spustit</button>}
                        {r.status === "running" && (
                          stopId === r.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => stop(r.id, "a")} className={t.btnGhost + " !h-7 !px-2.5 !text-[11px]"}>Vítěz A</button>
                              <button onClick={() => stop(r.id, "b")} className={t.btnGhost + " !h-7 !px-2.5 !text-[11px]"}>Vítěz B</button>
                              <button onClick={() => setStopId(null)} className={t.btnGhost + " !h-7 !px-2.5 !text-[11px]"}>Zrušit</button>
                            </div>
                          ) : (
                            <button onClick={() => setStopId(r.id)} className={t.btnDanger + " !h-7 !px-2.5 !text-[11px]"}>Zastavit</button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

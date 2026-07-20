"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { api, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

/** Modul „Pokročilé SEO" — audit katalogu s reálnými pravidly a skóre. */

type Severity = "error" | "warning" | "info";
interface SeoIssue { code: string; severity: Severity; message: string }
interface SeoProductResult { id: number; title: string; slug: string; score: number; issues: SeoIssue[] }
interface SeoReport {
  score: number; products_total: number; products_ok: number;
  issues_by_severity: { error: number; warning: number; info: number };
  top_issues: { code: string; message: string; severity: Severity; count: number }[];
  products: SeoProductResult[];
  categories_missing_description: number;
  generated_at: string;
}

const SEV_BADGE: Record<Severity, string> = {
  error: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-sky-50 text-sky-600",
};
const SEV_LABEL: Record<Severity, string> = { error: "Chyba", warning: "Varování", info: "Info" };

function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
}

export function SeoTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [report, setReport] = useState<SeoReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<{ report: SeoReport | null }>(`${base}/seo-audit`);
      setReport(data.report);
      setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function runAudit() {
    setRunning(true);
    setError(null);
    try {
      const data = await api<{ report: SeoReport }>(`${base}/seo-audit`, { method: "POST" });
      setReport(data.report);
    } catch (e) { setError(e instanceof Error ? e.message : "Audit selhal"); }
    finally { setRunning(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>SEO audit katalogu</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Kontrola titulků, meta descriptions, popisů, alt textů, sluků, duplicit a zařazení do kategorií u aktivních produktů.
          </p>
        </div>
        <button type="button" onClick={runAudit} disabled={running} className={t.btnPrimary}>
          {running ? "Analyzuji…" : report ? "Spustit nový audit" : "Spustit audit"}
        </button>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <p className="py-8 text-center text-[13px] text-slate-400">Načítám…</p>
      ) : !report ? (
        <p className={`${t.sectionCls} py-10 text-center text-[13.5px] text-slate-400`}>
          Zatím žádný audit — spusťte první analýzu katalogu.
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className={`${t.sectionCls} !p-4`}>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Celkové skóre</div>
              <div className={`mt-1 text-[28px] font-bold tabular-nums ${scoreColor(report.score)}`}>{report.score}/100</div>
              <div className="text-[11px] text-slate-400">audit {fmtDate(report.generated_at)}</div>
            </div>
            <div className={`${t.sectionCls} !p-4`}>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Produkty bez chyb</div>
              <div className="mt-1 text-[24px] font-bold tabular-nums text-slate-900">{report.products_ok}/{report.products_total}</div>
            </div>
            <div className={`${t.sectionCls} !p-4`}>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Chyby / varování</div>
              <div className="mt-1 text-[24px] font-bold tabular-nums">
                <span className="text-rose-600">{report.issues_by_severity.error}</span>
                <span className="text-slate-300"> / </span>
                <span className="text-amber-600">{report.issues_by_severity.warning}</span>
              </div>
            </div>
            <div className={`${t.sectionCls} !p-4`}>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Kategorie bez popisu</div>
              <div className="mt-1 text-[24px] font-bold tabular-nums text-slate-900">{report.categories_missing_description}</div>
            </div>
          </div>

          {report.top_issues.length > 0 && (
            <div className={t.sectionCls}>
              <h3 className="mb-3 text-[14px] font-semibold text-slate-900">Nejčastější problémy</h3>
              <div className="space-y-2">
                {report.top_issues.map((i) => (
                  <div key={i.code} className="flex items-center justify-between gap-3 text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${SEV_BADGE[i.severity]}`}>{SEV_LABEL[i.severity]}</span>
                      <span className="text-slate-700">{i.message}</span>
                    </div>
                    <span className="font-bold tabular-nums text-slate-500">{i.count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`${t.sectionCls} overflow-x-auto !p-0`}>
            <table className="w-full min-w-[640px] text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  <th className="px-4 py-3">Produkt</th>
                  <th className="px-4 py-3">Skóre</th>
                  <th className="px-4 py-3">Problémy</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {report.products.map((p) => (
                  <Fragment key={p.id}>
                    <tr className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{p.title}</div>
                        <div className="text-[12px] text-slate-400">/{p.slug}</div>
                      </td>
                      <td className={`px-4 py-3 font-bold tabular-nums ${scoreColor(p.score)}`}>{p.score}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.issues.length === 0 ? (
                          <span className="font-semibold text-emerald-600">✓ Bez problémů</span>
                        ) : `${p.issues.length} nálezů`}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.issues.length > 0 && (
                          <button type="button" className={`${t.btnGhost} !px-2.5 !py-1 !text-[12px]`}
                            onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                            {expanded === p.id ? "Skrýt" : "Detail"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded === p.id && (
                      <tr className="border-b border-slate-50">
                        <td colSpan={4} className="bg-slate-50/60 px-6 py-3">
                          <ul className="space-y-1.5">
                            {p.issues.map((i, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-[12.5px]">
                                <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${SEV_BADGE[i.severity]}`}>{SEV_LABEL[i.severity]}</span>
                                <span className="text-slate-700">{i.message}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

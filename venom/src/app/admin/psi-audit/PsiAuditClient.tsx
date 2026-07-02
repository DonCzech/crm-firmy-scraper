"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { RefreshCw, Play, ExternalLink, CheckCircle2, AlertTriangle, XCircle, Loader2, ArrowLeft } from "lucide-react";

interface TemplateRow {
  key: string;
  name: string;
  industry: string;
  review_status: string;
  desktop_score: number | null;
  desktop_at: string | null;
  mobile_score: number | null;
  mobile_at: string | null;
}

type RunState = "idle" | "running" | "done";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-xs">–</span>;
  const color = score >= 90 ? "bg-green-100 text-green-800" : score >= 70 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";
  const Icon = score >= 90 ? CheckCircle2 : score >= 70 ? AlertTriangle : XCircle;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${color}`}>
      <Icon size={11} />
      {score}
    </span>
  );
}

function fmtDate(iso: string | null) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function PsiAuditClient() {
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [runState, setRunState] = useState<RunState>("idle");
  const [progress, setProgress] = useState<{ done: number; total: number; current: string }>({ done: 0, total: 0, current: "" });
  const [filter, setFilter] = useState("");
  const [strategyFilter, setStrategyFilter] = useState<"all" | "desktop" | "mobile">("all");
  const abortRef = useRef(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/psi-audit");
      const json = await res.json() as { rows: TemplateRow[] };
      setRows(json.rows ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  async function runAll(slugs: string[]) {
    abortRef.current = false;
    setRunState("running");
    setProgress({ done: 0, total: slugs.length, current: "" });
    for (let i = 0; i < slugs.length; i++) {
      if (abortRef.current) break;
      const slug = slugs[i];
      setProgress({ done: i, total: slugs.length, current: slug });
      await fetch("/api/admin/psi-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, strategy: "both" }),
      });
      // Reload after each so scores update live
      await reload();
      // Extra pause between full template runs (desktop + mobile = ~6s internal already)
      if (i < slugs.length - 1 && !abortRef.current) await new Promise(r => setTimeout(r, 1500));
    }
    setProgress(p => ({ ...p, done: slugs.length, current: "" }));
    setRunState("done");
  }

  async function runSingle(slug: string) {
    await fetch("/api/admin/psi-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, strategy: "both" }),
    });
    await reload();
  }

  const filtered = rows.filter(r => {
    const q = filter.toLowerCase();
    if (q && !r.key.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q) && !r.industry.toLowerCase().includes(q)) return false;
    if (strategyFilter === "desktop" && (r.desktop_score ?? 100) < 90) return true;
    if (strategyFilter === "mobile"  && (r.mobile_score  ?? 100) < 90) return true;
    if (strategyFilter !== "all") return false;
    return true;
  });

  const displayRows = strategyFilter === "all" ? rows.filter(r => {
    const q = filter.toLowerCase();
    return !q || r.key.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.industry.toLowerCase().includes(q);
  }) : filtered;

  const notAudited = rows.filter(r => r.desktop_score === null || r.mobile_score === null);
  const below90Desktop = rows.filter(r => r.desktop_score !== null && r.desktop_score < 90);
  const below90Mobile  = rows.filter(r => r.mobile_score  !== null && r.mobile_score  < 90);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PageSpeed Audit</h1>
            <p className="text-sm text-gray-500 mt-0.5">Google Lighthouse skóre pro všechny šablony</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Celkem šablon</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{rows.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Bez auditu</p>
            <p className="text-3xl font-bold text-orange-500 mt-1">{notAudited.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Desktop &lt;90</p>
            <p className="text-3xl font-bold text-red-500 mt-1">{below90Desktop.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Mobile &lt;90</p>
            <p className="text-3xl font-bold text-red-500 mt-1">{below90Mobile.length}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Hledat šablonu…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:border-blue-500"
          />
          <select
            value={strategyFilter}
            onChange={e => setStrategyFilter(e.target.value as "all" | "desktop" | "mobile")}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">Všechny</option>
            <option value="desktop">Desktop &lt;90</option>
            <option value="mobile">Mobile &lt;90</option>
          </select>

          <div className="flex-1" />

          <button
            onClick={reload}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Obnovit
          </button>

          {runState === "idle" || runState === "done" ? (
            <>
              <button
                onClick={() => runAll(notAudited.map(r => r.key))}
                disabled={notAudited.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
              >
                <Play size={14} />
                Auditovat chybějící ({notAudited.length})
              </button>
              <button
                onClick={() => runAll(rows.map(r => r.key))}
                disabled={rows.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-40"
              >
                <RefreshCw size={14} />
                Přeauditovat vše ({rows.length})
              </button>
            </>
          ) : (
            <button
              onClick={() => { abortRef.current = true; }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Zastavit
            </button>
          )}
        </div>

        {/* Progress bar */}
        {runState === "running" && (
          <div className="bg-white rounded-lg border border-blue-200 p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {progress.done}/{progress.total} — aktuálně: <strong>{progress.current}</strong>
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Šablona</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Obor</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Desktop</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Mobile</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Poslední audit</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayRows.map(row => (
                <tr key={row.key} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{row.name || row.key}</div>
                    <div className="text-xs text-gray-400 font-mono">{row.key}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{row.industry}</td>
                  <td className="px-4 py-3 text-center">
                    <ScoreBadge score={row.desktop_score} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ScoreBadge score={row.mobile_score} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {fmtDate(row.desktop_at ?? row.mobile_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => runSingle(row.key)}
                        disabled={runState === "running"}
                        title="Spustit audit"
                        className="p-1 hover:text-blue-600 text-gray-400 disabled:opacity-30"
                      >
                        <Play size={14} />
                      </button>
                      <a
                        href={`https://webero.co/demo/${row.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Otevřít šablonu"
                        className="p-1 hover:text-gray-900 text-gray-400"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {displayRows.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    {filter ? "Žádné šablony neodpovídají filtru." : "Žádné šablony v databázi."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          PSI API klíč: {process.env.NEXT_PUBLIC_HAS_PSI_KEY === "1" ? "✅ nastaven" : "⚠️ chybí — bez klíče platí rate limit ~25 req/100s"}
          {" · "}každý audit = 2 requesty (desktop + mobile), mezi nimi 3s pauza.
        </p>
      </div>
    </div>
  );
}

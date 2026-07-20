"use client";

import { useCallback, useEffect, useState } from "react";
import { useCommerceTheme, api, czk, ErrorBanner } from "./shared";

interface PeriodData {
  revenue: number; orders: number; avg_order: number;
  prev_revenue: number; prev_orders: number;
}
interface DayPoint { date: string; revenue: number; orders: number }
interface TopProduct { id: number; title: string; qty: number; revenue: number }
interface Stats {
  periods: Record<string, PeriodData>;
  series_30d: DayPoint[];
  top_products: TopProduct[];
  totals: { total_revenue: number; total_orders: number; total_customers: number };
}

function pct(cur: number, prev: number): { value: string; positive: boolean } | null {
  if (!prev) return cur > 0 ? { value: "+∞", positive: true } : null;
  const p = ((cur - prev) / prev) * 100;
  return { value: `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`, positive: p >= 0 };
}

export function StatsTab({ base, currency }: { base: string; currency: string }) {
  const t = useCommerceTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"d7" | "d30" | "y1">("d30");

  const load = useCallback(async () => {
    try {
      const data = await api<Stats>(`${base}/stats`);
      setStats(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="py-8 text-center text-[13px] text-slate-400">Načítám statistiky…</p>;
  if (!stats) return <ErrorBanner message={error ?? "Statistiky nejsou dostupné"} />;

  const pd = stats.periods[period];

  const maxRevenue = Math.max(10000, ...stats.series_30d.map((d) => d.revenue));
  const maxOrders = Math.max(1, ...stats.series_30d.map((d) => d.orders));
  const chartW = 100;
  const chartH = 40;
  const revenuePath = stats.series_30d.map((d, i) => {
    const x = (i / Math.max(1, stats.series_30d.length - 1)) * chartW;
    const y = chartH - (d.revenue / maxRevenue) * chartH;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const ordersPath = stats.series_30d.map((d, i) => {
    const x = (i / Math.max(1, stats.series_30d.length - 1)) * chartW;
    const y = chartH - (d.orders / maxOrders) * chartH;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const revChange = pd ? pct(pd.revenue, pd.prev_revenue) : null;
  const ordChange = pd ? pct(pd.orders, pd.prev_orders) : null;

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />

      {/* Period selector */}
      <div className="flex items-center gap-2">
        {(["d7", "d30", "y1"] as const).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`rounded-lg border px-3.5 py-2 text-[12.5px] font-semibold transition ${
              period === p ? t.selectedChipCls : t.choiceChipCls
            }`}>
            {p === "d7" ? "7 dní" : p === "d30" ? "30 dní" : "12 měsíců"}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      {pd && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Tržby" value={czk(pd.revenue, currency)} change={revChange} theme={t} />
          <KpiCard label="Objednávky" value={String(pd.orders)} change={ordChange} theme={t} />
          <KpiCard label="Prům. objednávka" value={pd.orders > 0 ? czk(Math.round(pd.revenue / pd.orders), currency) : "—"} change={null} theme={t} />
          <KpiCard label="Konverzní poměr" value="—" change={null} theme={t} note="Brzy" />
        </div>
      )}

      {/* Revenue chart */}
      <div className={t.sectionCls}>
        <h3 className={t.sectionTitleCls}>Vývoj tržeb — posledních 30 dní</h3>
        <div className="relative" style={{ paddingBottom: "30%" }}>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <line key={f} x1="0" y1={chartH * (1 - f)} x2={chartW} y2={chartH * (1 - f)}
                stroke={t.chartGrid} strokeWidth="0.3" />
            ))}
            {revenuePath && <path d={revenuePath} fill="none" stroke={t.chartPrimary} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />}
            {ordersPath && <path d={ordersPath} fill="none" stroke={t.chartSecondary} strokeWidth="0.5" strokeDasharray="1.5,1.5" strokeLinecap="round" />}
          </svg>
        </div>
        <div className="mt-3 flex items-center gap-5 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-5 rounded-full" style={{ background: t.chartPrimary }} />Tržby
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[1px] w-5 border-t-2 border-dashed" style={{ borderColor: t.chartSecondary }} />Objednávky
          </span>
        </div>
      </div>

      {/* Top products + Totals */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={t.sectionCls}>
          <h3 className={t.sectionTitleCls}>Top produkty</h3>
          {stats.top_products.length === 0 ? (
            <p className="text-[13px] text-slate-400">Zatím žádná data.</p>
          ) : (
            <div className="space-y-2">
              {stats.top_products.slice(0, 10).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className={t.rankBadgeCls}>{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{p.title}</span>
                  <span className="text-[12px] tabular-nums text-slate-500">{p.qty} ks</span>
                  <span className="text-[12px] font-semibold tabular-nums">{czk(p.revenue, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={t.sectionCls}>
          <h3 className={t.sectionTitleCls}>Celkové statistiky</h3>
          <div className="space-y-4">
            <TotalRow label="Celkové tržby" value={czk(stats.totals.total_revenue, currency)} theme={t} />
            <TotalRow label="Celkem objednávek" value={String(stats.totals.total_orders)} theme={t} />
            <TotalRow label="Celkem zákazníků" value={String(stats.totals.total_customers)} theme={t} />
            <TotalRow label="Prům. hodnota objednávky"
              value={stats.totals.total_orders > 0 ? czk(Math.round(stats.totals.total_revenue / stats.totals.total_orders), currency) : "—"}
              theme={t} />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, change, theme: t, note }: {
  label: string; value: string; change: { value: string; positive: boolean } | null;
  theme: ReturnType<typeof useCommerceTheme>; note?: string;
}) {
  return (
    <div className={`${t.sectionCls} flex flex-col gap-1`}>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <span className={`text-[22px] font-bold tabular-nums ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>
        {note ? <span className="text-[14px] text-slate-400">{note}</span> : value}
      </span>
      {change && (
        <span className={`text-[12px] font-semibold ${change.positive ? "text-emerald-600" : "text-rose-500"}`}>
          {change.value} vs. předchozí období
        </span>
      )}
    </div>
  );
}

function TotalRow({ label, value, theme: t }: { label: string; value: string; theme: ReturnType<typeof useCommerceTheme> }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100/60 pb-3 last:border-0 last:pb-0">
      <span className="text-[13px] text-slate-500">{label}</span>
      <span className={`text-[15px] font-bold tabular-nums ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}

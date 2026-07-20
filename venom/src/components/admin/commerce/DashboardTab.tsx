"use client";

/**
 * Webero Commerce — dashboard (Shoptet-inspired, povýšený).
 * Období dlaždice → grafy tržeb/objednávek (30 dní, SVG + crosshair tooltip)
 * → KPI s trendy → poslední objednávky s legendou plateb → sklad/top produkty.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  api, czk, czkShort, fmtDate, ErrorBanner, StatusBadge, ORDER_STATUS_LABEL,
  useCommerceTheme,
} from "./shared";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PeriodStat { revenue: number; orders: number; prev: { revenue: number; orders: number } }
interface SeriesPoint { day: string; revenue_cents: number; orders: number }
interface Stats {
  currency: string;
  periods: { today: PeriodStat; d7: PeriodStat; d30: PeriodStat; y1: PeriodStat };
  series_30d: SeriesPoint[];
  low_stock: Array<{ variant_id: number; product_title: string; variant_title: string | null; sku: string | null; stock_qty: number }>;
  latest_orders: Array<{ id: number; order_number: string; email: string; total_cents: number; status: string; payment_status: string; placed_at: string; shipping_method: string | null; payment_method: string | null }>;
  top_products: Array<{ title: string; qty_sold: number; revenue_cents: number }>;
  totals: { pending_payment: number; customers_total: number; products_active: number };
}

const PAY_DOT: Record<string, string> = { paid: "#059669", pending: "#d97706", failed: "#dc2626", cancelled: "#dc2626", refunded: "#6b7280", partially_refunded: "#6b7280", authorized: "#d97706" };
const PAY_LABEL: Record<string, string> = { paid: "Zaplaceno", pending: "Čeká na platbu", failed: "Selhala", cancelled: "Zrušena", refunded: "Vráceno", partially_refunded: "Část. vráceno", authorized: "Autorizována" };

function dayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric" }).format(d);
}

function Trend({ now, prev, money, currency }: { now: number; prev: number; money?: boolean; currency?: string }) {
  const diff = now - prev;
  const pct = prev > 0 ? Math.round((diff / prev) * 100) : now > 0 ? 100 : 0;
  const up = diff > 0, flat = diff === 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11.5px] font-semibold ${flat ? "text-gray-400" : up ? "text-emerald-600" : "text-red-500"}`}>
      {flat ? "→" : up ? "↑" : "↓"} {Math.abs(pct)} %
      <span className="font-normal text-gray-400">({money ? czkShort(Math.abs(diff), currency) : Math.abs(diff)})</span>
    </span>
  );
}

// ── Revenue area chart (single series, crosshair tooltip) ────────────────────

function RevenueChart({ series, currency }: { series: SeriesPoint[]; currency: string }) {
  const theme = useCommerceTheme();
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const W = 560, H = 190, PAD_L = 46, PAD_R = 10, PAD_T = 12, PAD_B = 24;
  const gradientId = `wcRev-${theme.design}`;

  const isEmpty = series.every((s) => s.revenue_cents === 0);
  const max = Math.max(10000, ...series.map((s) => s.revenue_cents));
  const niceMax = max * 1.15;
  const x = (i: number) => PAD_L + (i / Math.max(1, series.length - 1)) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - v / niceMax) * (H - PAD_T - PAD_B);

  const line = series.map((s, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(s.revenue_cents).toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const yTicks = [0, 0.5, 1].map((f) => niceMax * f);

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD_L) / (W - PAD_L - PAD_R)) * (series.length - 1));
    setHover(Math.min(series.length - 1, Math.max(0, i)));
  };

  const h = hover != null ? series[hover] : null;

  return (
    <div className="relative">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label="Tržby za posledních 30 dní">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.chartPrimary} stopOpacity="0.22" />
            <stop offset="100%" stopColor={theme.chartPrimary} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} stroke={theme.chartGrid} strokeWidth="1" />
            <text x={PAD_L - 6} y={y(t) + 3.5} textAnchor="end" fontSize="9.5" fill="#9ca3af">
              {t >= 10000000 ? `${Math.round(t / 10000000) * 100} tis.` : t >= 100000 ? `${(t / 100000).toFixed(1).replace(".0", "")} tis.` : Math.round(t / 100)}
            </text>
          </g>
        ))}
        {series.map((s, i) => (i % 7 === 0 || i === series.length - 1) && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9.5" fill="#9ca3af">{dayLabel(s.day)}</text>
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke={theme.chartPrimary} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hover != null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={PAD_T} y2={H - PAD_B} stroke="#c7cad1" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(series[hover].revenue_cents)} r="4.5" fill={theme.chartPrimary} stroke="#fff" strokeWidth="2" />
          </>
        )}
      </svg>
      {h && hover != null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11.5px] shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%`, top: 0 }}
        >
          <div className="font-semibold text-gray-800">{dayLabel(h.day)}</div>
          <div className="tabular-nums text-gray-600">{czk(h.revenue_cents, currency)}</div>
        </div>
      )}
      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-gray-50 px-3 py-1 text-[12px] text-gray-400">Zatím žádné zaplacené objednávky</span>
        </div>
      )}
    </div>
  );
}

// ── Orders bar chart (single series, per-bar hover) ──────────────────────────

function OrdersChart({ series }: { series: SeriesPoint[] }) {
  const theme = useCommerceTheme();
  const [hover, setHover] = useState<number | null>(null);
  const W = 560, H = 190, PAD_L = 26, PAD_R = 10, PAD_T = 12, PAD_B = 24;
  const max = Math.max(1, ...series.map((s) => s.orders));
  const bw = (W - PAD_L - PAD_R) / series.length - 2;
  const x = (i: number) => PAD_L + (i / series.length) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - v / (max * 1.15)) * (H - PAD_T - PAD_B);
  const h = hover != null ? series[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Objednávky za posledních 30 dní">
        {[0, Math.ceil(max / 2), max].map((t, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} stroke={theme.chartGrid} strokeWidth="1" />
            <text x={PAD_L - 5} y={y(t) + 3.5} textAnchor="end" fontSize="9.5" fill="#9ca3af">{t}</text>
          </g>
        ))}
        {series.map((s, i) => (i % 7 === 0 || i === series.length - 1) && (
          <text key={`l${i}`} x={x(i) + bw / 2} y={H - 8} textAnchor="middle" fontSize="9.5" fill="#9ca3af">{dayLabel(s.day)}</text>
        ))}
        {series.map((s, i) => {
          const barH = Math.max(s.orders > 0 ? 3 : 0, y(0) - y(s.orders));
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* hit target přes celou výšku */}
              <rect x={x(i)} y={PAD_T} width={bw + 2} height={H - PAD_T - PAD_B} fill="transparent" />
              <rect
                x={x(i)} y={y(0) - barH} width={bw} height={barH} rx="2"
                fill={hover === i ? theme.chartSecondary : s.orders > 0 ? theme.chartSecondary : theme.chartSecondarySoft}
                opacity={hover === i ? 1 : 0.75}
              />
            </g>
          );
        })}
      </svg>
      {h && hover != null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11.5px] shadow-lg"
          style={{ left: `${((x(hover) + bw / 2) / W) * 100}%`, top: 0 }}
        >
          <div className="font-semibold text-gray-800">{dayLabel(h.day)}</div>
          <div className="tabular-nums text-gray-600">{h.orders} objednávek</div>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

const PERIOD_TILES: Array<{ key: keyof Stats["periods"]; label: string }> = [
  { key: "today", label: "Dnes" },
  { key: "d7", label: "7 dní" },
  { key: "d30", label: "30 dní" },
  { key: "y1", label: "Rok" },
];

export function DashboardTab({ base, onGoto }: { base: string; onGoto: (tab: string) => void }) {
  const theme = useCommerceTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api<Stats>(`${base}/stats`).then(setStats).catch((e) => setError(e instanceof Error ? e.message : "Načtení selhalo"));
  }, [base]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const payLegend = useMemo(() => Object.entries(PAY_LABEL).slice(0, 3), []);

  if (error) return <ErrorBanner message={error} />;
  if (!stats) return <div className="py-16 text-center text-[13px] text-gray-400">Načítám přehled…</div>;

  const { currency, periods } = stats;
  const cardCls = theme.cardCls;

  return (
    <div className="space-y-4">
      {/* Období dlaždice */}
      <div className={theme.periodShellCls}>
        {PERIOD_TILES.map(({ key, label }) => {
          const p = periods[key];
          const active = key === "today";
          return (
            <div
              key={key}
              className={`relative border-b border-r border-slate-200 px-5 py-4 last:border-r-0 lg:border-b-0 ${
                active ? theme.periodTileActiveCls : theme.periodTileInactiveCls
              }`}
            >
              {active && <span className={`absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 ${theme.periodTileActiveArrowCls}`} aria-hidden />}
              <div className="flex items-baseline justify-between">
                <span className={`text-[12px] font-bold ${active ? theme.periodActiveLabelCls : "text-slate-400"}`}>{label}</span>
                {!active && key !== "y1" && <Trend now={p.revenue} prev={p.prev.revenue} money currency={currency} />}
              </div>
              <div className={`mt-2 text-[27px] font-extrabold leading-none tracking-[-0.02em] tabular-nums ${active ? "text-white" : "text-slate-900"}`}>
                {czkShort(p.revenue, currency)}
              </div>
              <div className={`mt-1 text-[12px] ${active ? "text-white/82" : "text-slate-500"}`}>
                {p.orders === 1 ? "1 objednávka" : p.orders >= 2 && p.orders <= 4 ? `${p.orders} objednávky` : `${p.orders} objednávek`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grafy */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className={`${cardCls} p-5`}>
          <h3 className={`mb-3 text-[21px] font-light tracking-[-0.02em] ${theme.headingAccentCls}`}>
            Tržby <span className="text-[12px] font-normal text-slate-400">· posledních 30 dní</span>
          </h3>
          <RevenueChart series={stats.series_30d} currency={currency} />
        </div>
        <div className={`${cardCls} p-5`}>
          <h3 className={`mb-3 text-[21px] font-light tracking-[-0.02em] ${theme.headingAccentCls}`}>
            Objednávky <span className="text-[12px] font-normal text-slate-400">· posledních 30 dní</span>
          </h3>
          <OrdersChart series={stats.series_30d} />
        </div>
      </div>

      {/* Sekundární KPI */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button onClick={() => onGoto("orders")} className={`${cardCls} px-5 py-4 text-left ${theme.metricActionCls}`}>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Čeká na platbu</div>
          <div className={`mt-1 text-[24px] font-extrabold tracking-[-0.02em] tabular-nums ${stats.totals.pending_payment > 0 ? "text-amber-600" : "text-slate-900"}`}>
            {stats.totals.pending_payment}
          </div>
        </button>
        <button onClick={() => onGoto("customers")} className={`${cardCls} px-5 py-4 text-left ${theme.metricActionCls}`}>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Zákazníci</div>
          <div className="mt-1 text-[24px] font-extrabold tracking-[-0.02em] tabular-nums text-slate-900">{stats.totals.customers_total}</div>
        </button>
        <button onClick={() => onGoto("products")} className={`${cardCls} px-5 py-4 text-left ${theme.metricActionCls}`}>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Aktivní produkty</div>
          <div className="mt-1 text-[24px] font-extrabold tracking-[-0.02em] tabular-nums text-slate-900">{stats.totals.products_active}</div>
        </button>
      </div>

      {/* Nedávné nákupy */}
      <div className={cardCls}>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className={`text-[22px] font-light tracking-[-0.02em] ${theme.headingAccentCls}`}>Nedávné nákupy</h3>
          <button onClick={() => onGoto("orders")} className={theme.ctaSmallCls}>Zobrazit vše</button>
        </div>
        {stats.latest_orders.length === 0 ? (
          <div className="px-4 py-10 text-center text-[13px] text-gray-400">Zatím žádné objednávky — jakmile někdo nakoupí, uvidíte to tady.</div>
        ) : (
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className={theme.tableHeadRowCls}>
                <th className="px-4 py-2 font-semibold">Kód a datum</th>
                <th className="px-2 py-2 font-semibold">Zákazník</th>
                <th className="px-2 py-2 font-semibold">Doprava</th>
                <th className="px-2 py-2 font-semibold">Platba</th>
                <th className="px-2 py-2 font-semibold">Stav</th>
                <th className="px-4 py-2 text-right font-semibold">Cena</th>
              </tr>
            </thead>
            <tbody>
              {stats.latest_orders.map((o) => (
                <tr key={o.id} className={theme.tableRowCls}>
                  <td className="px-4 py-2">
                    <div className={`font-mono text-[11.5px] ${theme.linkAccentCls}`}>{o.order_number}</div>
                    <div className="text-[11px] text-gray-400">{fmtDate(o.placed_at)}</div>
                  </td>
                  <td className="px-2 py-2 text-gray-700">{o.email}</td>
                  <td className="px-2 py-2 text-gray-500">{o.shipping_method?.split(" — ")[0] ?? "—"}</td>
                  <td className="px-2 py-2">
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <span className="h-2 w-2 rounded-full" style={{ background: PAY_DOT[o.payment_status] ?? "#9ca3af" }} aria-hidden />
                      {PAY_LABEL[o.payment_status] ?? o.payment_status}
                    </span>
                  </td>
                  <td className="px-2 py-2"><StatusBadge value={o.status} map={ORDER_STATUS_LABEL} /></td>
                  <td className="px-4 py-2 text-right font-bold tabular-nums">{czk(o.total_cents, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex gap-4 border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400">
          {payLegend.map(([k, label]) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: PAY_DOT[k] }} aria-hidden /> {label}
            </span>
          ))}
        </div>
      </div>

      {/* Sklad + top produkty */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cardCls}>
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-[13px] font-bold text-slate-800">Nízký sklad <span className="font-normal text-slate-400">(≤ 5 ks)</span></h3>
            <button onClick={() => onGoto("products")} className={`text-[12px] ${theme.linkAccentCls}`}>Produkty →</button>
          </div>
          {stats.low_stock.length === 0 ? (
            <div className="px-4 py-6 text-center text-[12.5px] text-gray-400">Vše skladem 👌</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {stats.low_stock.map((v) => (
                <li key={v.variant_id} className="flex items-center justify-between px-4 py-2 text-[12.5px]">
                  <span className="truncate">{v.product_title}{v.variant_title && <span className="text-gray-400"> — {v.variant_title}</span>}</span>
                  <span className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${v.stock_qty <= 0 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
                    {v.stock_qty} ks
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={cardCls}>
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-[13px] font-bold text-slate-800">Top produkty <span className="font-normal text-slate-400">(30 dní)</span></h3>
          </div>
          {stats.top_products.length === 0 ? (
            <div className="px-4 py-6 text-center text-[12.5px] text-gray-400">Zatím žádné prodeje.</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {stats.top_products.map((t, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-2 text-[12.5px]">
                  <span className="truncate">
                    <span className={theme.rankBadgeCls}>{i + 1}</span>
                    {t.title} <span className="text-gray-400">× {t.qty_sold}</span>
                  </span>
                  <span className="ml-3 shrink-0 font-bold tabular-nums">{czk(t.revenue_cents, currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

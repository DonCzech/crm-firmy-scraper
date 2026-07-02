import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import { BarChart3, ChevronLeft, ChevronRight, Download, Target } from "lucide-react";

const MONTHS = [
  "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
  "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec",
];

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

function fmt(n: number) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency", currency: "CZK", minimumFractionDigits: 0,
  }).format(n);
}

function LineChart({ revenue, expenses }: { revenue: number[]; expenses: number[] }) {
  const allVals = [...revenue, ...expenses];
  const max = Math.max(...allVals, 1);
  const W = 780, H = 140, px = 20, py = 16;
  const count = revenue.length;

  const pts = (vals: number[]) =>
    vals.map((v, i) => ({
      x: px + (count === 1 ? W / 2 : (i / (count - 1)) * (W - 2 * px)),
      y: py + (1 - v / max) * (H - 2 * py),
    }));

  const toPolyline = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(" ");

  const revPts = pts(revenue);
  const expPts = pts(expenses);

  return (
    <g>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f}
          x1={px} y1={py + (1 - f) * (H - 2 * py)}
          x2={W - px} y2={py + (1 - f) * (H - 2 * py)}
          stroke="var(--chart-grid)" strokeWidth="1"
        />
      ))}
      {/* Expenses line */}
      <polyline points={toPolyline(expPts)} fill="none" stroke="var(--chart-2)" strokeWidth="2" strokeDasharray="4 2" strokeLinejoin="round" />
      {expPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--surface)" stroke="var(--chart-2)" strokeWidth="2" />
      ))}
      {/* Revenue line */}
      <polyline points={toPolyline(revPts)} fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinejoin="round" />
      {revPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--surface)" stroke="var(--chart-1)" strokeWidth="2" />
      ))}
    </g>
  );
}

export default async function StatistikyPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; period?: string; vat?: string }>;
}) {
  const { year: yearParam, period = "monthly", vat = "without" } = await searchParams;
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const currentYear = new Date().getFullYear();
  const year = Math.min(parseInt(yearParam ?? String(currentYear), 10), currentYear);

  const [invoiceRows, expenseRows] = await Promise.all([
    query(
      `SELECT
         EXTRACT(MONTH FROM issue_date::date)::int AS month,
         COALESCE(SUM(total) FILTER (WHERE status NOT IN ('cancelled', 'draft')), 0) AS vynosy_s_dph,
         COALESCE(SUM(subtotal) FILTER (WHERE status NOT IN ('cancelled', 'draft')), 0) AS vynosy_bez_dph,
         COALESCE(SUM(vat_total) FILTER (WHERE status NOT IN ('cancelled', 'draft')), 0) AS dph,
         COUNT(*) FILTER (WHERE status NOT IN ('cancelled', 'draft')) AS pocet
       FROM fak_invoices
       WHERE company_id = $1 AND issue_date LIKE $2 || '-%'
       GROUP BY month ORDER BY month`,
      [company.id, String(year)]
    ),
    query(
      `SELECT
         EXTRACT(MONTH FROM issue_date::date)::int AS month,
         COALESCE(SUM(total) FILTER (WHERE status NOT IN ('cancelled')), 0) AS naklady
       FROM fak_expenses
       WHERE company_id = $1 AND issue_date LIKE $2 || '-%'
       GROUP BY month ORDER BY month`,
      [company.id, String(year)]
    ),
  ]);

  const monthly = Array.from({ length: 12 }, (_, i) => {
    const ir = invoiceRows.rows.find((r) => r.month === i + 1);
    const er = expenseRows.rows.find((r) => r.month === i + 1);
    const vynosySdph = ir ? parseFloat(ir.vynosy_s_dph) : 0;
    const vynosyBezDph = ir ? parseFloat(ir.vynosy_bez_dph) : 0;
    const dph = ir ? parseFloat(ir.dph) : 0;
    const pocet = ir ? parseInt(ir.pocet) : 0;
    const naklady = er ? parseFloat(er.naklady) : 0;
    return { vynosySdph, vynosyBezDph, dph, pocet, naklady };
  });

  const getVynosy = (m: typeof monthly[0]) => {
    if (vat === "with") return m.vynosySdph;
    if (vat === "only") return m.dph;
    return m.vynosyBezDph;
  };

  // Aggregate by period
  type PeriodRow = { label: string; vynosy: number; naklady: number; pocet: number };
  let periods: PeriodRow[] = [];

  if (period === "quarterly") {
    periods = QUARTERS.map((q, qi) => {
      const slice = monthly.slice(qi * 3, qi * 3 + 3);
      return {
        label: q,
        vynosy: slice.reduce((a, m) => a + getVynosy(m), 0),
        naklady: slice.reduce((a, m) => a + m.naklady, 0),
        pocet: slice.reduce((a, m) => a + m.pocet, 0),
      };
    });
  } else {
    periods = monthly.map((m, i) => ({
      label: MONTHS[i],
      vynosy: getVynosy(m),
      naklady: m.naklady,
      pocet: m.pocet,
    }));
  }

  const totalVynosy = periods.reduce((a, p) => a + p.vynosy, 0);
  const totalNaklady = periods.reduce((a, p) => a + p.naklady, 0);
  const totalVysledek = totalVynosy - totalNaklady;
  const maxVal = Math.max(...periods.map((p) => p.vynosy), ...periods.map((p) => p.naklady), 1);

  const W = 780, H = 140;
  const vatLabel = vat === "with" ? "Včetně DPH" : vat === "only" ? "Pouze DPH" : "Bez DPH";

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Statistiky</h1>
          <p className="page-sub">Přehled za rok {year} · {vatLabel}</p>
        </div>
        <a
          href={`/api/export/statistics?year=${year}`}
          className="btn-secondary"
        >
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </div>

      <div className="toolbar">
        <div className="flex items-center gap-1">
          <Link href={`/dashboard/statistiky?year=${year - 1}&period=${period}&vat=${vat}`}
            className="icon-btn">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <span className="font-display font-bold w-14 text-center" style={{ color: "var(--ink)" }}>{year}</span>
          <Link href={`/dashboard/statistiky?year=${year + 1}&period=${period}&vat=${vat}`}
            className={`icon-btn ${year >= currentYear ? "opacity-30 pointer-events-none" : ""}`}>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="segmented">
          {[["monthly", "Měsíce"], ["quarterly", "Čtvrtletí"]].map(([v, l]) => (
            <Link key={v} href={`/dashboard/statistiky?year=${year}&period=${v}&vat=${vat}`}
              className={period === v ? "on" : ""}>
              {l}
            </Link>
          ))}
        </div>

        <div className="segmented">
          {[["without", "Bez DPH"], ["with", "Včetně DPH"], ["only", "Pouze DPH"]].map(([v, l]) => (
            <Link key={v} href={`/dashboard/statistiky?year=${year}&period=${period}&vat=${v}`}
              className={vat === v ? "on" : ""}>
              {l}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-[18px] mb-[18px]">
        <div className="card stat">
          <div className="stat-top"><div className="stat-ico"><BarChart3 className="w-5 h-5" /></div></div>
          <div className="stat-label">Výnosy ({vatLabel})</div>
          <div className="stat-value font-num">{fmt(totalVynosy)}</div>
        </div>
        <div className="card stat">
          <div className="stat-top"><div className="stat-ico amber"><BarChart3 className="w-5 h-5" /></div></div>
          <div className="stat-label">Náklady</div>
          <div className="stat-value font-num">{fmt(totalNaklady)}</div>
        </div>
        <div className="card stat">
          <div className="stat-top"><div className={`stat-ico ${totalVysledek >= 0 ? "" : "red"}`}><Target className="w-5 h-5" /></div></div>
          <div className="stat-label">Výsledek</div>
          <div className="stat-value font-num" style={{ color: totalVysledek >= 0 ? "var(--ink)" : "var(--overdue)" }}>{fmt(totalVysledek)}</div>
        </div>
      </div>

      <div className="card mb-[18px]">
        <div className="card-head">
          <h3>Příjmy vs. náklady</h3>
          <div className="ml-auto flex items-center gap-4">
          <span className="legend-item">
            <span className="legend-dot" style={{ background: "var(--chart-1)" }} />
            Výnosy ({vatLabel})
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: "var(--chart-2)" }} />
            Náklady
          </span>
          </div>
        </div>
        <div className="chart-panel">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
          <LineChart revenue={periods.map((p) => p.vynosy)} expenses={periods.map((p) => p.naklady)} />
        </svg>
        <div className={`flex ${period === "quarterly" ? "justify-around" : "justify-between"} mt-2 text-xs px-5`} style={{ color: "var(--ink-3)" }}>
          {periods.map((p, i) => (
            <span key={i}>{period === "quarterly" ? p.label : p.label.slice(0, 3)}</span>
          ))}
        </div>
        </div>
      </div>

      <div className="card overflow-hidden table-scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th>Období</th>
              <th className="right">Výnosy</th>
              <th className="right">Faktur</th>
              <th className="right">Náklady</th>
              <th className="right">Výsledek</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((p, i) => {
              const vysledek = p.vynosy - p.naklady;
              const share = maxVal > 0 ? (p.vynosy / maxVal) * 100 : 0;
              return (
                <tr key={i}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="client-name w-24">{p.label}</span>
                      {p.vynosy > 0 && (
                        <div className="flex-1 hidden md:block">
                          <div className="h-1.5 rounded-full" style={{ width: `${share}%`, minWidth: 4, background: "var(--accent)" }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="right amount">{fmt(p.vynosy)}</td>
                  <td className="right">{p.pocet > 0 ? p.pocet : "—"}</td>
                  <td className="right" style={{ color: "var(--pending)", fontWeight: 800 }}>{p.naklady > 0 ? fmt(p.naklady) : "—"}</td>
                  <td className="right amount" style={{ color: vysledek < 0 ? "var(--overdue)" : "var(--ink)" }}>
                    {fmt(vysledek)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="client-name">Celkem</td>
              <td className="right amount">{fmt(totalVynosy)}</td>
              <td className="right">
                {periods.reduce((a, p) => a + p.pocet, 0)}
              </td>
              <td className="right" style={{ color: "var(--pending)", fontWeight: 800 }}>{fmt(totalNaklady)}</td>
              <td className="right amount" style={{ color: totalVysledek < 0 ? "var(--overdue)" : "var(--ink)" }}>
                {fmt(totalVysledek)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="page-sub text-center pb-4">
        Výnosy = vystavené faktury (bez konceptů a stornovaných). Náklady = evidované přijaté faktury.
      </p>
    </div>
  );
}

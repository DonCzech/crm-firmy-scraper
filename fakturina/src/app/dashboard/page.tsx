import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  Download,
  FileCheck,
  FileText,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import InvoiceStatusBadge from "@/components/InvoiceStatusBadge";

function money(value: number | string | null | undefined, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function shortMoney(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (value >= 1000) return `${Math.round(value / 1000)} tis.`;
  return String(Math.round(value));
}

function initials(name?: string | null) {
  return (name || "?")
    .replace(/[.,]/g, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function Sparkline({ values, tone = "green" }: { values: number[]; tone?: "green" | "amber" | "red" }) {
  const safe = values.length ? values : [0, 0];
  const min = Math.min(...safe);
  const max = Math.max(...safe, 1);
  const points = safe.map((v, i) => {
    const x = safe.length === 1 ? 120 : (i / (safe.length - 1)) * 240;
    const y = 40 - ((v - min) / (max - min || 1)) * 32;
    return `${x},${y}`;
  }).join(" ");
  const color = tone === "red" ? "var(--overdue)" : tone === "amber" ? "var(--pending)" : "var(--paid)";
  return (
    <svg className="stat-spark" viewBox="0 0 240 44" preserveAspectRatio="none">
      <polyline points={`0,44 ${points} 240,44`} fill={color} opacity=".08" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RevenueChart({ months, revenue, expenses }: { months: string[]; revenue: number[]; expenses: number[] }) {
  const max = Math.max(...revenue, ...expenses, 1) * 1.15;
  const h = 260;
  const w = 760;
  const pad = 26;
  const xy = (arr: number[]) => arr.map((v, i) => ({
    x: pad + (i / Math.max(arr.length - 1, 1)) * (w - pad * 2),
    y: pad + (1 - v / max) * (h - pad * 2),
  }));
  const rev = xy(revenue);
  const exp = xy(expenses);
  const path = (pts: { x: number; y: number }[]) => pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="chart-panel">
      <div className="flex items-center gap-5 pb-3">
        <span className="legend-item"><span className="legend-dot" style={{ background: "var(--chart-1)" }} />Příjmy</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: "var(--chart-2)" }} />Náklady</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 260 }}>
        {[0, .25, .5, .75, 1].map((g) => (
          <line key={g} x1={pad} x2={w - pad} y1={pad + (1 - g) * (h - pad * 2)} y2={pad + (1 - g) * (h - pad * 2)} stroke="var(--chart-grid)" strokeDasharray="4 5" />
        ))}
        <path d={`${path(rev)} L ${rev[rev.length - 1]?.x ?? pad} ${h - pad} L ${rev[0]?.x ?? pad} ${h - pad} Z`} fill="var(--chart-1)" opacity=".10" />
        <path d={path(exp)} fill="none" stroke="var(--chart-2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 7" />
        <path d={path(rev)} fill="none" stroke="var(--chart-1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {months.map((m, i) => (
          <text key={m} x={rev[i]?.x ?? 0} y={h - 5} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink-3)">{m}</text>
        ))}
      </svg>
    </div>
  );
}

function Donut({ segments }: { segments: { label: string; value: number; count: number; color: string }[] }) {
  const size = 168;
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const count = segments.reduce((sum, s) => sum + s.count, 0);
  let acc = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-inset)" strokeWidth="14" />
      {segments.map((s) => {
        const dash = (s.value / total) * c;
        const offset = -acc * c;
        acc += s.value / total;
        return (
          <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        );
      })}
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontFamily="var(--font-display)" fontWeight="850" fontSize="30" fill="var(--ink)">{count}</text>
      <text x={size / 2} y={size / 2 + 18} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--ink-3)">faktur</text>
    </svg>
  );
}

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const company = await getUserCompany(user.id);
  if (!company) {
    return (
      <div className="page pt-16">
        <div className="card card-pad max-w-lg mx-auto text-center">
          <div className="stat-ico mx-auto mb-5"><Building2 className="w-6 h-6" /></div>
          <h2 className="page-title !text-2xl">Nastavte svoji firmu</h2>
          <p className="page-sub mb-6">Než začnete vystavovat faktury, vyplňte údaje o vaší firmě.</p>
          <Link href="/dashboard/settings/company" className="btn-primary">Nastavit firmu <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    );
  }

  const monthLabels = ["Led", "Úno", "Bře", "Dub", "Kvě", "Čvn", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro"];
  const year = new Date().getFullYear();

  const [statsRes, recentRes, statusRes, monthlyInvRes, monthlyExpRes, clientsRes, expensesRes, draftRes, quoteRes] = await Promise.all([
    query(`
      SELECT
        COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'), 0) AS total_invoiced,
        COALESCE(SUM(total) FILTER (WHERE status = 'paid'), 0) AS total_paid,
        COALESCE(SUM(total) FILTER (WHERE status = 'overdue'), 0) AS total_overdue,
        COALESCE(SUM(total) FILTER (WHERE status IN ('sent','viewed','overdue')), 0) AS total_unpaid
      FROM fak_invoices WHERE company_id = $1
    `, [company.id]),
    query(`
      SELECT i.*, c.name AS client_name
      FROM fak_invoices i
      LEFT JOIN fak_clients c ON c.id = i.client_id
      WHERE i.company_id = $1
      ORDER BY i.created_at DESC LIMIT 6
    `, [company.id]),
    query(`
      SELECT status, COUNT(*)::int AS count, COALESCE(SUM(total), 0) AS value
      FROM fak_invoices
      WHERE company_id = $1 AND status != 'cancelled'
      GROUP BY status
    `, [company.id]),
    query(`
      SELECT EXTRACT(MONTH FROM issue_date::date)::int AS month, COALESCE(SUM(total), 0) AS total
      FROM fak_invoices
      WHERE company_id = $1 AND status NOT IN ('draft','cancelled') AND issue_date LIKE $2 || '-%'
      GROUP BY month
    `, [company.id, String(year)]),
    query(`
      SELECT EXTRACT(MONTH FROM issue_date::date)::int AS month, COALESCE(SUM(total), 0) AS total
      FROM fak_expenses
      WHERE company_id = $1 AND status != 'cancelled' AND issue_date LIKE $2 || '-%'
      GROUP BY month
    `, [company.id, String(year)]),
    query(`
      SELECT c.id, c.name, COUNT(i.id)::int AS invoices, COALESCE(SUM(i.total), 0) AS total
      FROM fak_clients c
      LEFT JOIN fak_invoices i ON i.client_id = c.id AND i.status NOT IN ('draft','cancelled')
      WHERE c.company_id = $1 AND c.archived = false
      GROUP BY c.id, c.name
      ORDER BY total DESC, c.name ASC
      LIMIT 4
    `, [company.id]),
    query(`
      SELECT * FROM fak_expenses
      WHERE company_id = $1 AND status != 'cancelled'
      ORDER BY created_at DESC LIMIT 3
    `, [company.id]),
    query(`SELECT COUNT(*)::int AS count FROM fak_invoices WHERE company_id = $1 AND status = 'draft'`, [company.id]),
    query(`SELECT COUNT(*)::int AS count FROM fak_quotes WHERE company_id = $1 AND status IN ('draft','sent')`, [company.id]),
  ]);

  const stats = statsRes.rows[0];
  const revenue = Array.from({ length: 12 }, (_, i) => Number(monthlyInvRes.rows.find((r) => r.month === i + 1)?.total ?? 0));
  const expenses = Array.from({ length: 12 }, (_, i) => Number(monthlyExpRes.rows.find((r) => r.month === i + 1)?.total ?? 0));
  const spark = revenue.map((v, i) => v - expenses[i]);
  const statusData = [
    { key: "paid", label: "Zaplaceno", color: "var(--paid)" },
    { key: "sent", label: "Čeká na platbu", color: "var(--pending)" },
    { key: "viewed", label: "Zobrazeno", color: "var(--pending)" },
    { key: "overdue", label: "Po splatnosti", color: "var(--overdue)" },
    { key: "draft", label: "Koncepty", color: "var(--draft)" },
  ].map((s) => {
    const row = statusRes.rows.find((r) => r.status === s.key);
    return { label: s.label, color: s.color, value: Number(row?.value ?? 0), count: Number(row?.count ?? 0) };
  }).filter((s) => s.count || s.value);
  const clients = clientsRes.rows;
  const maxClient = Math.max(...clients.map((c) => Number(c.total)), 1);
  const draftCount = Number(draftRes.rows[0]?.count ?? 0);
  const openQuotes = Number(quoteRes.rows[0]?.count ?? 0);

  const cards = [
    { label: "Celkem vyfakturováno", value: money(stats.total_invoiced), icon: TrendingUp, tone: "green" as const, href: "/dashboard/invoices", data: revenue },
    { label: "Nezaplacené faktury", value: money(stats.total_unpaid), icon: Clock, tone: "amber" as const, href: "/dashboard/invoices?status=sent", data: revenue },
    { label: "Po splatnosti", value: money(stats.total_overdue), icon: AlertCircle, tone: "red" as const, href: "/dashboard/invoices?status=overdue", data: revenue },
    { label: "Zaplaceno", value: money(stats.total_paid), icon: CheckCircle, tone: "green" as const, href: "/dashboard/invoices?status=paid", data: spark },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Přehled</h1>
          <div className="page-sub">{company.name} · poslední aktualizace před chvílí</div>
        </div>
        <div className="page-head-actions">
          {draftCount > 0 && <Link href="/dashboard/invoices?status=draft" className="btn-secondary"><FileText className="w-4 h-4" /> {draftCount} konceptů</Link>}
          <Link href="/api/export/statistics" className="btn-secondary"><Download className="w-4 h-4" /> Export</Link>
          <Link href="/dashboard/invoices/new" className="btn-primary"><Plus className="w-4 h-4" /> Nová faktura</Link>
        </div>
      </div>

      <div className="bento">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link href={card.href} key={card.label} className="card stat">
              <div className="stat-top">
                <div className={`stat-ico ${card.tone}`}><Icon className="w-5 h-5" /></div>
                <span className={`delta ${card.tone === "red" ? "down" : "up"}`}>
                  {card.tone === "red" ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  live
                </span>
              </div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value font-num">{card.value}</div>
              <Sparkline values={card.data} tone={card.tone} />
            </Link>
          );
        })}
      </div>

      <div className="grid gap-[18px] lg:grid-cols-[1.66fr_1fr] mb-[18px]">
        <div className="card">
          <div className="card-head">
            <h3>Vývoj příjmů</h3>
          </div>
          <RevenueChart months={monthLabels} revenue={revenue} expenses={expenses} />
        </div>

        <div className="card">
          <div className="card-head"><h3>Stav faktur</h3><span className="page-sub ml-auto !mt-0">Tento rok</span></div>
          {statusData.length ? (
            <div className="donut-row">
              <Donut segments={statusData} />
              <div className="donut-legend">
                {statusData.map((s) => (
                  <div className="dleg" key={s.label}>
                    <span className="sw" style={{ background: s.color }} />
                    <span>{s.label}</span>
                    <span className="v font-num">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card-pad page-sub">Zatím nejsou vystavené žádné faktury.</div>
          )}
        </div>
      </div>

      <div className="grid gap-[18px] lg:grid-cols-[1.66fr_1fr] items-start">
        <div className="card overflow-hidden">
          <div className="card-head">
            <h3>Poslední faktury</h3>
            <Link href="/dashboard/invoices" className="ml-auto btn-secondary !py-2">Všechny <ArrowRight className="w-4 h-4" /></Link>
          </div>
          {recentRes.rows.length ? (
            <div className="table-scroll">
              <table className="tbl">
                <thead><tr><th>Klient</th><th>Vystaveno</th><th>Stav</th><th className="right">Částka</th></tr></thead>
                <tbody>
                  {recentRes.rows.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <Link href={`/dashboard/invoices/${inv.id}`} className="client-cell">
                          <span className="client-ava">{initials(inv.client_name)}</span>
                          <span>
                            <span className="client-name block">{inv.client_name ?? "Bez klienta"}</span>
                            <span className="client-meta block">{inv.number}</span>
                          </span>
                        </Link>
                      </td>
                      <td>{inv.issue_date}</td>
                      <td><InvoiceStatusBadge status={inv.status} /></td>
                      <td className="right amount">{money(inv.total, inv.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card-pad text-center">
              <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--ink-4)" }} />
              <p className="page-sub mb-4">Žádné faktury. Vytvořte první.</p>
              <Link href="/dashboard/invoices/new" className="btn-primary"><Plus className="w-4 h-4" /> Nová faktura</Link>
            </div>
          )}
        </div>

        <div className="grid gap-[18px]">
          <div className="card">
            <div className="card-head"><h3>Nejlepší klienti</h3><Link href="/dashboard/clients" className="ml-auto btn-secondary !py-2">Vše</Link></div>
            <div className="mini-list">
              {clients.length ? clients.map((client) => (
                <Link href={`/dashboard/clients/${client.id}`} className="mini-row" key={client.id}>
                  <span className="client-ava">{initials(client.name)}</span>
                  <span className="min-w-0 w-28">
                    <span className="client-name block truncate">{client.name}</span>
                    <span className="client-meta block">{client.invoices} faktur</span>
                  </span>
                  <span className="bar-track"><span className="bar-fill block" style={{ width: `${Math.max(6, (Number(client.total) / maxClient) * 100)}%` }} /></span>
                  <span className="amount text-sm min-w-14 text-right">{shortMoney(Number(client.total))}</span>
                </Link>
              )) : <div className="page-sub">Zatím žádní klienti s fakturami.</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Poslední náklady</h3><Link href="/dashboard/expenses" className="ml-auto btn-secondary !py-2">Vše</Link></div>
            <div className="mini-list">
              {expensesRes.rows.length ? expensesRes.rows.map((expense) => (
                <Link href={`/dashboard/expenses/${expense.id}`} className="mini-row" key={expense.id}>
                  <span className="stat-ico amber !w-9 !h-9"><Receipt className="w-4 h-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="client-name block truncate">{expense.supplier_name || expense.number || "Náklad"}</span>
                    <span className="client-meta block">{expense.number ? `${expense.number} · ${expense.issue_date}` : expense.issue_date}</span>
                  </span>
                  <span className="amount text-sm">-{money(expense.total, expense.currency)}</span>
                </Link>
              )) : <Link href="/dashboard/expenses/new" className="page-sub">+ Přidat první náklad</Link>}
            </div>
          </div>

          {openQuotes > 0 && (
            <div className="card card-pad">
              <div className="mini-row">
                <span className="stat-ico"><FileCheck className="w-5 h-5" /></span>
                <span>
                  <span className="client-name block">{openQuotes} otevřených nabídek</span>
                  <Link href="/dashboard/quotes" className="client-meta">Zobrazit nabídky</Link>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

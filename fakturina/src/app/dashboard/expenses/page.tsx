import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import { initDb } from "@/lib/db";
import { Plus, Receipt, Download } from "lucide-react";

function fmt(n: number, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  unpaid: { label: "Nezaplaceno", cls: "bg-amber-100 text-amber-700" },
  paid: { label: "Zaplaceno", cls: "bg-green-100 text-green-700" },
  overdue: { label: "Po splatnosti", cls: "bg-red-100 text-red-700" },
  cancelled: { label: "Stornováno", cls: "bg-slate-100 text-slate-500" },
};

const STATUSES = [
  { value: "", label: "Všechny" },
  { value: "unpaid", label: "Nezaplacené" },
  { value: "paid", label: "Zaplacené" },
  { value: "overdue", label: "Po splatnosti" },
  { value: "cancelled", label: "Stornované" },
];

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await initDb();
  const { status, q } = await searchParams;
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const conditions = ["company_id = $1"];
  const params: unknown[] = [company.id];
  let idx = 2;

  if (status) { conditions.push(`status = $${idx++}`); params.push(status); }
  if (q?.trim()) {
    conditions.push(`(supplier_name ILIKE $${idx} OR number ILIKE $${idx} OR variable_symbol ILIKE $${idx})`);
    params.push(`%${q.trim()}%`);
    idx++;
  }

  const { rows: expenses } = await query(
    `SELECT * FROM fak_expenses WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
    params
  );

  const totalUnpaid = expenses.filter((e) => e.status === "unpaid").reduce((s, e) => s + parseFloat(e.total), 0);
  const totalOverdue = expenses.filter((e) => e.status === "overdue").reduce((s, e) => s + parseFloat(e.total), 0);
  const totalAll = expenses.reduce((s, e) => s + parseFloat(e.total), 0);
  const exportParams = new URLSearchParams();
  if (status) exportParams.set("status", status);
  if (q) exportParams.set("q", q);
  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s.value] = s.value ? expenses.filter((e) => e.status === s.value).length : expenses.length;
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Náklady</h1>
          <p className="page-sub">{expenses.length} položek · {fmt(totalAll)} v aktuálním výběru</p>
        </div>
        <div className="page-head-actions">
          <a href={`/api/export/expenses?${exportParams}`} className="btn-secondary" title="Export">
            <Download className="w-4 h-4" /><span className="hidden sm:inline">Export</span>
          </a>
          <Link href="/dashboard/expenses/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Nový náklad
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-[18px] mb-[18px]">
        <div className="card stat">
          <div className="stat-top"><div className="stat-ico amber"><Receipt className="w-5 h-5" /></div></div>
          <div className="stat-label">Nezaplacené</div>
          <div className="stat-value font-num">{fmt(totalUnpaid)}</div>
        </div>
        <div className="card stat">
          <div className="stat-top"><div className="stat-ico red"><Receipt className="w-5 h-5" /></div></div>
          <div className="stat-label">Po splatnosti</div>
          <div className="stat-value font-num" style={{ color: "var(--overdue)" }}>{fmt(totalOverdue)}</div>
        </div>
      </div>

      <form method="GET" className="toolbar">
        <input name="q" defaultValue={q ?? ""} className="input flex-1" placeholder="Název dodavatele, číslo dokladu…" />
        {status && <input type="hidden" name="status" value={status} />}
        <button type="submit" className="btn-primary px-4">Hledat</button>
        {(q) && <Link href={status ? `/dashboard/expenses?status=${status}` : "/dashboard/expenses"} className="btn-secondary px-3">×</Link>}
      </form>

      <div className="toolbar">
        <div className="filter-tabs">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={s.value ? `/dashboard/expenses?status=${s.value}${q ? `&q=${q}` : ""}` : `/dashboard/expenses${q ? `?q=${q}` : ""}`}
            className={(status ?? "") === s.value ? "on" : ""}
          >
            {s.label}<span className="ml-1 opacity-60">{counts[s.value] ?? 0}</span>
          </Link>
        ))}
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="card card-pad text-center py-16">
          <Receipt className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--ink-4)" }} />
          <h2 className="font-display text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>
            {q || status ? "Žádné výsledky" : "Žádné náklady"}
          </h2>
          <p className="page-sub mb-6">
            {q || status ? "Zkuste upravit filtry." : "Přidejte první náklad — fakturu od dodavatele."}
          </p>
          {!q && !status && (
            <Link href="/dashboard/expenses/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nový náklad
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden table-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Dodavatel · číslo</th>
                <th>Datum</th>
                <th>Splatnost</th>
                <th>Stav</th>
                <th className="right">Částka</th>
                <th className="right"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => {
                const st = STATUS_LABELS[exp.status] ?? { label: exp.status, cls: "bg-slate-100 text-slate-600" };
                return (
                  <tr key={exp.id}>
                    <td>
                      <Link href={`/dashboard/expenses/${exp.id}`} className="client-cell">
                        <span className="client-ava">{(exp.supplier_name ?? "N").slice(0, 2).toUpperCase()}</span>
                        <span>
                          <span className="client-name block">{exp.supplier_name ?? "Bez dodavatele"}</span>
                          <span className="client-meta block">{exp.number ?? "Bez čísla"}</span>
                        </span>
                      </Link>
                    </td>
                    <td>{exp.issue_date}</td>
                    <td style={{ color: exp.status === "overdue" ? "var(--overdue)" : "var(--ink-2)" }}>{exp.due_date}</td>
                    <td><span className={`badge-${exp.status === "unpaid" ? "sent" : exp.status}`}>{st.label}</span></td>
                    <td className="right amount">{fmt(parseFloat(exp.total), exp.currency)}</td>
                    <td className="right">
                      <Link href={`/dashboard/expenses/${exp.id}`} className="btn-secondary !py-2">Detail</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Celkem ({expenses.length})</td>
                <td className="right amount">{fmt(totalAll)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

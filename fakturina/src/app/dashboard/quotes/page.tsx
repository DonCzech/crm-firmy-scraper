import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import { initDb } from "@/lib/db";
import { Plus, FileCheck } from "lucide-react";

function fmt(n: number, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  draft: { label: "Koncept", cls: "bg-slate-100 text-slate-600" },
  sent: { label: "Odesláno", cls: "bg-blue-100 text-blue-700" },
  accepted: { label: "Přijato", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Odmítnuto", cls: "bg-red-100 text-red-700" },
  expired: { label: "Expirováno", cls: "bg-amber-100 text-amber-700" },
};

const STATUSES = [
  { value: "", label: "Všechny" },
  { value: "draft", label: "Koncepty" },
  { value: "sent", label: "Odeslané" },
  { value: "accepted", label: "Přijatá" },
  { value: "rejected", label: "Odmítnutá" },
];

export default async function QuotesPage({
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

  const conditions = ["qu.company_id = $1"];
  const params: unknown[] = [company.id];
  let idx = 2;

  if (status) { conditions.push(`qu.status = $${idx++}`); params.push(status); }
  if (q?.trim()) {
    conditions.push(`(qu.number ILIKE $${idx} OR c.name ILIKE $${idx})`);
    params.push(`%${q.trim()}%`);
    idx++;
  }

  const { rows: quotes } = await query(
    `SELECT qu.*, c.name as client_name
     FROM fak_quotes qu
     LEFT JOIN fak_clients c ON c.id = qu.client_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY qu.created_at DESC`,
    params
  );
  const totalAmount = quotes.reduce((sum, quote) => sum + parseFloat(quote.total), 0);
  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s.value] = s.value ? quotes.filter((quote) => quote.status === s.value).length : quotes.length;
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Nabídky</h1>
          <p className="page-sub">{quotes.length} nabídek · {fmt(totalAmount)} v aktuálním výběru</p>
        </div>
        <Link href="/dashboard/quotes/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Nová nabídka
        </Link>
      </div>

      <form method="GET" className="toolbar">
        <input name="q" defaultValue={q ?? ""} className="input flex-1" placeholder="Číslo nabídky, klient…" />
        {status && <input type="hidden" name="status" value={status} />}
        <button type="submit" className="btn-primary px-4">Hledat</button>
        {q && <Link href={status ? `/dashboard/quotes?status=${status}` : "/dashboard/quotes"} className="btn-secondary px-3">×</Link>}
      </form>

      <div className="toolbar">
        <div className="filter-tabs">
        {STATUSES.map((s) => (
          <Link key={s.value}
            href={s.value ? `/dashboard/quotes?status=${s.value}${q ? `&q=${q}` : ""}` : `/dashboard/quotes${q ? `?q=${q}` : ""}`}
            className={(status ?? "") === s.value ? "on" : ""}
          >{s.label}<span className="ml-1 opacity-60">{counts[s.value] ?? 0}</span></Link>
        ))}
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="card card-pad text-center py-16">
          <FileCheck className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--ink-4)" }} />
          <h2 className="font-display text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>
            {q || status ? "Žádné výsledky" : "Žádné nabídky"}
          </h2>
          <p className="page-sub mb-6">
            {q || status ? "Zkuste upravit filtry." : "Vytvořte nabídku pro klienta — po přijetí ji převeďte na fakturu."}
          </p>
          {!q && !status && (
            <Link href="/dashboard/quotes/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nová nabídka
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden table-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Klient · č. nabídky</th>
                <th>Datum</th>
                <th>Platnost do</th>
                <th>Stav</th>
                <th className="right">Částka</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => {
                const st = STATUS_LABELS[q.status] ?? { label: q.status, cls: "bg-slate-100 text-slate-600" };
                return (
                  <tr key={q.id}>
                    <td>
                      <Link href={`/dashboard/quotes/${q.id}`} className="client-cell">
                        <span className="client-ava">{(q.client_name ?? "BN").replace(/[.,]/g, "").split(/\s+/).slice(0, 2).map((word: string) => word[0]).join("").toUpperCase()}</span>
                        <span>
                          <span className="client-name block">{q.client_name ?? "Bez klienta"}</span>
                          <span className="client-meta block">{q.number}</span>
                        </span>
                      </Link>
                    </td>
                    <td>{q.issue_date}</td>
                    <td>{q.valid_until ?? "—"}</td>
                    <td><span className={`badge-${q.status === "accepted" ? "paid" : q.status === "rejected" ? "overdue" : q.status === "sent" ? "sent" : "draft"}`}>{st.label}</span></td>
                    <td className="right amount">{fmt(parseFloat(q.total), q.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Celkem ({quotes.length})</td>
                <td className="right amount">{fmt(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

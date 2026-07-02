import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import { Bell, AlertCircle, Clock, CheckCircle, Info } from "lucide-react";

function getIcon(type: string) {
  switch (type) {
    case "overdue": return <AlertCircle className="w-4 h-4 text-red-500" />;
    case "due_soon": return <Clock className="w-4 h-4 text-amber-500" />;
    case "paid": return <CheckCircle className="w-4 h-4 text-green-500" />;
    default: return <Info className="w-4 h-4 text-indigo-500" />;
  }
}

export default async function NotificationsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const today = new Date().toISOString().slice(0, 10);
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [overdueRes, dueSoonRes, notifRes] = await Promise.all([
    query(`
      SELECT i.id, i.number, i.total, i.currency, i.due_date, c.name as client_name
      FROM fak_invoices i
      LEFT JOIN fak_clients c ON c.id = i.client_id
      WHERE i.company_id = $1 AND i.status IN ('sent','viewed','overdue')
        AND i.due_date < $2
      ORDER BY i.due_date ASC
    `, [company.id, today]),
    query(`
      SELECT i.id, i.number, i.total, i.currency, i.due_date, c.name as client_name
      FROM fak_invoices i
      LEFT JOIN fak_clients c ON c.id = i.client_id
      WHERE i.company_id = $1 AND i.status IN ('sent','viewed')
        AND i.due_date BETWEEN $2 AND $3
      ORDER BY i.due_date ASC
    `, [company.id, today, in7days]),
    query(`
      SELECT * FROM fak_notifications
      WHERE company_id = $1
      ORDER BY created_at DESC LIMIT 20
    `, [company.id]).catch(() => ({ rows: [] })),
  ]);

  const overdue = overdueRes.rows;
  const dueSoon = dueSoonRes.rows;
  const notifications = notifRes.rows;

  function fmt(n: number, currency = "CZK") {
    return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Upozornění</h1>
          <p className="page-sub">{overdue.length + dueSoon.length + notifications.length} aktivních položek</p>
        </div>
        <div className="stat-ico"><Bell className="w-5 h-5" /></div>
      </div>

      {overdue.length > 0 && (
        <div className="card overflow-hidden mb-[18px]">
          <div className="card-head">
            <div className="stat-ico red !w-9 !h-9"><AlertCircle className="w-4 h-4" /></div>
            <h3>Po splatnosti ({overdue.length})</h3>
          </div>
          <div className="mini-list">
            {overdue.map((inv) => (
              <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`}
                className="mini-row">
                <span className="stat-ico red !w-9 !h-9"><AlertCircle className="w-4 h-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="client-name block">{inv.number} · {inv.client_name ?? "Bez klienta"}</span>
                  <span className="client-meta block" style={{ color: "var(--overdue)" }}>Splatno {inv.due_date}</span>
                </span>
                <span className="amount" style={{ color: "var(--overdue)" }}>{fmt(parseFloat(inv.total), inv.currency)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {dueSoon.length > 0 && (
        <div className="card overflow-hidden mb-[18px]">
          <div className="card-head">
            <div className="stat-ico amber !w-9 !h-9"><Clock className="w-4 h-4" /></div>
            <h3>Brzy splatné do 7 dní ({dueSoon.length})</h3>
          </div>
          <div className="mini-list">
            {dueSoon.map((inv) => (
              <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`}
                className="mini-row">
                <span className="stat-ico amber !w-9 !h-9"><Clock className="w-4 h-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="client-name block">{inv.number} · {inv.client_name ?? "Bez klienta"}</span>
                  <span className="client-meta block">Splatno {inv.due_date}</span>
                </span>
                <span className="amount">{fmt(parseFloat(inv.total), inv.currency)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="card overflow-hidden mb-[18px]">
          <div className="card-head">
            <div className="stat-ico !w-9 !h-9"><Bell className="w-4 h-4" /></div>
            <h3>Systémová oznámení</h3>
          </div>
          <div className="mini-list">
            {notifications.map((n) => (
              <div key={n.id} className="mini-row items-start">
                {getIcon(n.type)}
                <div className="flex-1 min-w-0">
                  <div className="client-name">{n.title}</div>
                  {n.body && <div className="client-meta">{n.body}</div>}
                  <div className="client-meta">{new Date(n.created_at * 1000).toLocaleDateString("cs-CZ")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {overdue.length === 0 && dueSoon.length === 0 && notifications.length === 0 && (
        <div className="card card-pad text-center py-16">
          <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--paid)" }} />
          <h2 className="font-display text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>Vše v pořádku</h2>
          <p className="page-sub">Žádné nezaplacené faktury ani upozornění.</p>
        </div>
      )}
    </div>
  );
}

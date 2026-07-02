import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import { Users, Plus, ArrowRight, Mail } from "lucide-react";

function money(value: number | string) {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", minimumFractionDigits: 0 }).format(Number(value));
}

export default async function ClientsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard/settings/company");

  const { rows: clients } = await query(
    `SELECT c.*, COUNT(i.id) as invoice_count, COALESCE(SUM(i.total) FILTER (WHERE i.status != 'cancelled'), 0) as total_invoiced
     FROM fak_clients c
     LEFT JOIN fak_invoices i ON i.client_id = c.id
     WHERE c.company_id = $1 AND c.archived = false
     GROUP BY c.id
     ORDER BY c.name ASC`,
    [company.id]
  );
  const totalInvoiced = clients.reduce((sum, client) => sum + parseFloat(client.total_invoiced), 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Klienti</h1>
          <p className="page-sub">{clients.length} klientů · {money(totalInvoiced)} celkem vyfakturováno</p>
        </div>
        <Link href="/dashboard/clients/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Nový klient
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="card card-pad text-center py-16">
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--ink-4)" }} />
          <h2 className="font-display text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>Žádní klienti</h2>
          <p className="page-sub mb-6">Přidejte prvního klienta a začněte fakturovat.</p>
          <Link href="/dashboard/clients/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Přidat klienta
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden table-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Klient</th>
                <th>IČO</th>
                <th>E-mail</th>
                <th className="right">Faktur</th>
                <th className="right">Vyfakturováno</th>
                <th className="right"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/dashboard/clients/${c.id}`} className="client-cell">
                      <span className="client-ava">{c.name.replace(/[.,]/g, "").split(/\s+/).slice(0, 2).map((word: string) => word[0]).join("").toUpperCase()}</span>
                      <span>
                        <span className="client-name block">{c.name}</span>
                        <span className="client-meta block">{[c.city, c.country].filter(Boolean).join(", ") || "Bez adresy"}</span>
                      </span>
                    </Link>
                  </td>
                  <td>{c.ico ?? "—"}</td>
                  <td>{c.email ? <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span> : "—"}</td>
                  <td className="right">{c.invoice_count}</td>
                  <td className="right amount">{money(c.total_invoiced)}</td>
                  <td className="right">
                    <Link href={`/dashboard/clients/${c.id}`} className="icon-btn !w-8 !h-8 inline-grid" aria-label="Detail klienta">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Celkem ({clients.length})</td>
                <td className="right amount">{money(totalInvoiced)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

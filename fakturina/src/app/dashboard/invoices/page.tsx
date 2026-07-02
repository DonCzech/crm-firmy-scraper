import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import { Plus, FileText, Download, MoreHorizontal } from "lucide-react";
import InvoiceStatusBadge from "@/components/InvoiceStatusBadge";
import InvoiceFilters from "@/components/InvoiceFilters";

function fmt(n: number, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);
}

const TYPE_LABELS: Record<string, string> = {
  invoice: "Faktura", proforma: "Proforma", advance: "Záloha",
  credit_note: "Dobropis", tax_document: "Daňový doklad",
};

const STATUSES = [
  { value: "", label: "Všechny" },
  { value: "draft", label: "Koncepty" },
  { value: "sent", label: "Odeslané" },
  { value: "viewed", label: "Zobrazené" },
  { value: "paid", label: "Zaplacené" },
  { value: "overdue", label: "Po splatnosti" },
  { value: "cancelled", label: "Stornované" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string; type?: string; q?: string;
    from?: string; to?: string;
    amountFrom?: string; amountTo?: string;
    payment?: string;
  }>;
}) {
  const { status, type, q, from, to, amountFrom, amountTo, payment } = await searchParams;
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard/settings/company");

  const conditions: string[] = ["i.company_id = $1"];
  const params: unknown[] = [company.id];
  let idx = 2;

  if (status) { conditions.push(`i.status = $${idx++}`); params.push(status); }
  if (type)   { conditions.push(`i.type = $${idx++}`); params.push(type); }
  if (payment) { conditions.push(`i.payment_method = $${idx++}`); params.push(payment); }
  if (from)   { conditions.push(`i.issue_date >= $${idx++}`); params.push(from); }
  if (to)     { conditions.push(`i.issue_date <= $${idx++}`); params.push(to); }
  if (amountFrom) { conditions.push(`i.total >= $${idx++}`); params.push(parseFloat(amountFrom)); }
  if (amountTo)   { conditions.push(`i.total <= $${idx++}`); params.push(parseFloat(amountTo)); }
  if (q?.trim()) {
    conditions.push(
      `(i.number ILIKE $${idx} OR c.name ILIKE $${idx} OR c.ico ILIKE $${idx} OR i.variable_symbol ILIKE $${idx} OR i.order_number ILIKE $${idx})`
    );
    params.push(`%${q.trim()}%`);
    idx++;
  }

  const { rows: invoices } = await query(
    `SELECT i.*, c.name as client_name
     FROM fak_invoices i
     LEFT JOIN fak_clients c ON c.id = i.client_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY i.created_at DESC`,
    params
  );

  const hasFilters = !!(q || type || status || from || to || amountFrom || amountTo || payment);
  const totalAmount = invoices.reduce((s, i) => s + parseFloat(i.total), 0);
  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s.value] = s.value ? invoices.filter((i) => i.status === s.value).length : invoices.length;
    return acc;
  }, {});

  // Build export URL with current filters
  const exportParams = new URLSearchParams();
  if (status) exportParams.set("status", status);
  if (from) exportParams.set("from", from);
  if (to) exportParams.set("to", to);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Faktury</h1>
          <p className="page-sub">{invoices.length} faktur · {fmt(totalAmount)} vyfakturováno ve výběru</p>
        </div>
        <div className="page-head-actions">
          <a
            href={`/api/export/invoices?format=xlsx&${exportParams}`}
            className="btn-secondary"
            title="Stáhnout Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </a>
          <Link href="/dashboard/invoices/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Nová faktura
          </Link>
        </div>
      </div>

      <InvoiceFilters />

      <div className="toolbar">
        <div className="filter-tabs">
        {STATUSES.map((s) => {
          const base = new URLSearchParams();
          if (q) base.set("q", q);
          if (type) base.set("type", type);
          if (from) base.set("from", from);
          if (to) base.set("to", to);
          if (amountFrom) base.set("amountFrom", amountFrom);
          if (amountTo) base.set("amountTo", amountTo);
          if (payment) base.set("payment", payment);
          if (s.value) base.set("status", s.value);
          return (
            <Link
              key={s.value}
              href={`/dashboard/invoices?${base}`}
              className={(status ?? "") === s.value ? "on" : ""}
            >
              {s.label}<span className="ml-1 opacity-60">{counts[s.value] ?? 0}</span>
            </Link>
          );
        })}
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="card card-pad text-center py-16">
          <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--ink-4)" }} />
          <h2 className="font-display text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>
            {hasFilters ? "Žádné výsledky" : "Žádné faktury"}
          </h2>
          <p className="page-sub mb-6">
            {hasFilters
              ? "Zkuste upravit vyhledávání nebo filtry."
              : "Vytvořte první fakturu a pošlete ji klientovi."}
          </p>
          {!hasFilters && (
            <Link href="/dashboard/invoices/new" className="btn-primary">
              <Plus className="w-4 h-4" /> Nová faktura
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden table-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>Klient · č. faktury</th>
                <th>Typ</th>
                <th>Vystaveno</th>
                <th>Splatnost</th>
                <th>Stav</th>
                <th className="right">Částka</th>
                <th className="right" style={{ width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <Link href={`/dashboard/invoices/${inv.id}`} className="client-cell">
                      <span className="client-ava">
                        {(inv.client_name ?? "BF").replace(/[.,]/g, "").split(/\s+/).slice(0, 2).map((word: string) => word[0]).join("").toUpperCase()}
                      </span>
                      <span>
                        <span className="client-name block">{inv.client_name ?? "Bez klienta"}</span>
                        <span className="client-meta block">{inv.number}</span>
                      </span>
                    </Link>
                  </td>
                  <td>{TYPE_LABELS[inv.type] ?? inv.type}</td>
                  <td>{inv.issue_date}</td>
                  <td style={{ color: inv.status === "overdue" ? "var(--overdue)" : "var(--ink-2)", fontWeight: inv.status === "overdue" ? 800 : 500 }}>{inv.due_date}</td>
                  <td><InvoiceStatusBadge status={inv.status} /></td>
                  <td className="right amount">{fmt(parseFloat(inv.total), inv.currency)}</td>
                  <td className="right">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="icon-btn !w-8 !h-8 inline-grid" aria-label="Detail faktury">
                      <MoreHorizontal className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}>Celkem ({invoices.length})</td>
                <td className="right amount">{fmt(totalAmount)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

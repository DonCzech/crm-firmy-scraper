import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import ClientForm from "@/components/ClientForm";
import InvoiceStatusBadge from "@/components/InvoiceStatusBadge";
import { ArrowLeft, FileText } from "lucide-react";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const { rows } = await query(
    "SELECT * FROM fak_clients WHERE id = $1 AND company_id = $2",
    [id, company.id]
  );
  const client = rows[0];
  if (!client) notFound();

  const { rows: invoices } = await query(
    "SELECT * FROM fak_invoices WHERE client_id = $1 AND company_id = $2 ORDER BY created_at DESC",
    [id, company.id]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/clients" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Upravit klienta</h2>
          <ClientForm client={client} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Faktury</h2>
            <Link href={`/dashboard/invoices/new?client=${id}`} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              + Nová faktura
            </Link>
          </div>
          {invoices.length === 0 ? (
            <div className="card p-8 text-center">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Žádné faktury pro tohoto klienta</p>
            </div>
          ) : (
            <div className="card divide-y divide-slate-100">
              {invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/dashboard/invoices/${inv.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{inv.number}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{inv.due_date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      {new Intl.NumberFormat("cs-CZ", { style: "currency", currency: inv.currency }).format(parseFloat(inv.total))}
                    </div>
                    <InvoiceStatusBadge status={inv.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import RecurringInvoiceForm from "@/components/RecurringInvoiceForm";

export default async function EditRecurringInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const { rows } = await query(
    "SELECT * FROM fak_recurring_invoices WHERE id = $1 AND company_id = $2",
    [id, company.id]
  );
  const rec = rows[0];
  if (!rec) notFound();

  const { rows: items } = await query(
    "SELECT * FROM fak_recurring_invoice_items WHERE recurring_invoice_id = $1 ORDER BY sort_order ASC",
    [id]
  );

  const { rows: clients } = await query(
    "SELECT id, name FROM fak_clients WHERE company_id = $1 AND archived = false ORDER BY name ASC",
    [company.id]
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/invoices/recurring" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Upravit: {rec.name}</h1>
      </div>
      <RecurringInvoiceForm
        company={company}
        clients={clients}
        recurring={{
          id: rec.id,
          clientId: rec.client_id,
          name: rec.name,
          startDate: rec.start_date,
          endDate: rec.end_date,
          period: rec.period,
          sendByEmail: rec.send_by_email,
          asProforma: rec.as_proforma,
          dueDays: rec.due_days,
          currency: rec.currency,
          note: rec.note,
          items: items.map((i) => ({
            name: i.name,
            quantity: parseFloat(i.quantity),
            unit: i.unit ?? "",
            unitPrice: parseFloat(i.unit_price),
            vatRate: i.vat_rate,
          })),
        }}
      />
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import InvoiceForm from "@/components/InvoiceForm";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const { rows } = await query(
    "SELECT * FROM fak_invoices WHERE id = $1 AND company_id = $2",
    [id, company.id]
  );
  const invoice = rows[0];
  if (!invoice) notFound();

  if (invoice.status === "paid" || invoice.status === "cancelled") {
    redirect(`/dashboard/invoices/${id}`);
  }

  const { rows: items } = await query(
    "SELECT * FROM fak_invoice_items WHERE invoice_id = $1 ORDER BY sort_order ASC",
    [id]
  );

  const { rows: clients } = await query(
    "SELECT id, name, ico, dic, address, city, zip, country, email FROM fak_clients WHERE company_id = $1 AND archived = false ORDER BY name ASC",
    [company.id]
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/invoices/${id}`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Upravit fakturu {invoice.number}</h1>
      </div>
      <InvoiceForm
        company={company}
        clients={clients}
        defaultIssueDate={invoice.issue_date}
        defaultDueDate={invoice.due_date}
        invoice={{
          id: invoice.id,
          clientId: invoice.client_id,
          type: invoice.type,
          currency: invoice.currency,
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          taxableDate: invoice.taxable_date,
          note: invoice.note,
          variableSymbol: invoice.variable_symbol,
          paymentMethod: invoice.payment_method,
          orderNumber: invoice.order_number,
          noteBeforeItems: invoice.note_before_items,
          footerText: invoice.footer_text,
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

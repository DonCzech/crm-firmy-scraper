import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import QuoteForm from "@/components/QuoteForm";

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const { rows: [quote] } = await query(
    "SELECT * FROM fak_quotes WHERE id = $1 AND company_id = $2",
    [id, company.id]
  );
  if (!quote) notFound();
  if (quote.converted_invoice_id) redirect(`/dashboard/quotes/${id}`);

  const { rows: items } = await query(
    "SELECT * FROM fak_quote_items WHERE quote_id = $1 ORDER BY sort_order",
    [id]
  );
  const { rows: clients } = await query(
    "SELECT id, name, ico, dic, email, address, city, zip, country FROM fak_clients WHERE company_id = $1 AND archived = false ORDER BY name",
    [company.id]
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/quotes/${id}`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upravit nabídku {quote.number}</h1>
          <p className="text-slate-500 text-sm mt-1">Změny se projeví v detailu nabídky.</p>
        </div>
      </div>

      <QuoteForm
        company={company}
        clients={clients}
        defaultIssueDate={quote.issue_date}
        defaultValidUntil={quote.valid_until ?? new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]}
        quote={{
          id: quote.id,
          clientId: quote.client_id,
          currency: quote.currency,
          issueDate: quote.issue_date,
          validUntil: quote.valid_until,
          language: quote.language,
          note: quote.note,
          noteBeforeItems: quote.note_before_items,
          footerText: quote.footer_text,
          items: items.map((item) => ({
            name: item.name,
            quantity: parseFloat(item.quantity),
            unit: item.unit ?? "",
            unitPrice: parseFloat(item.unit_price),
            vatRate: item.vat_rate,
          })),
        }}
      />
    </div>
  );
}

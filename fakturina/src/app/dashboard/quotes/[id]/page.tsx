import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import QuoteActions from "./QuoteActions";

function fmt(n: number, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  draft: { label: "Koncept", cls: "text-slate-600 bg-slate-100" },
  sent: { label: "Odesláno", cls: "text-blue-700 bg-blue-50" },
  accepted: { label: "Přijato ✓", cls: "text-green-700 bg-green-50" },
  rejected: { label: "Odmítnuto", cls: "text-red-700 bg-red-50" },
  expired: { label: "Expirováno", cls: "text-amber-700 bg-amber-50" },
};

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const { rows: [quote] } = await query(
    `SELECT q.*, c.name as client_name, c.address as client_address, c.city as client_city,
            c.ico as client_ico, c.dic as client_dic
     FROM fak_quotes q
     LEFT JOIN fak_clients c ON c.id = q.client_id
     WHERE q.id = $1 AND q.company_id = $2`,
    [id, company.id]
  );
  if (!quote) notFound();

  const { rows: items } = await query(
    "SELECT * FROM fak_quote_items WHERE quote_id = $1 ORDER BY sort_order", [id]
  );

  const st = STATUS_LABELS[quote.status] ?? { label: quote.status, cls: "text-slate-600 bg-slate-100" };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/quotes" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{quote.number}</h1>
          <p className="text-slate-500 text-sm">{quote.client_name ?? "Bez klienta"}</p>
        </div>
        <span className={`ml-auto px-3 py-1.5 rounded-xl text-sm font-semibold ${st.cls}`}>{st.label}</span>
      </div>

      <QuoteActions quoteId={quote.id} status={quote.status} convertedInvoiceId={quote.converted_invoice_id} />

      <div className="card p-6 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Klient</div>
          <div className="font-medium text-slate-900">{quote.client_name ?? "—"}</div>
          {quote.client_ico && <div className="text-sm text-slate-500">IČO: {quote.client_ico}</div>}
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Termíny</div>
          <div className="text-sm text-slate-700">Vystaveno: {quote.issue_date}</div>
          <div className="text-sm text-slate-700">Platnost do: {quote.valid_until ?? "—"}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Položka</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Množství</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cena/ks</th>
              {company.vat_status === "vat_payer" && <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">DPH</th>}
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Celkem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-3 text-slate-700">{item.name}</td>
                <td className="px-4 py-3 text-right text-slate-500">{item.quantity} {item.unit}</td>
                <td className="px-4 py-3 text-right text-slate-500">{fmt(parseFloat(item.unit_price), quote.currency)}</td>
                {company.vat_status === "vat_payer" && <td className="px-4 py-3 text-right text-slate-500">{item.vat_rate} %</td>}
                <td className="px-6 py-3 text-right font-medium text-slate-900">{fmt(parseFloat(item.total_with_vat), quote.currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-200">
            <tr>
              <td colSpan={company.vat_status === "vat_payer" ? 4 : 3} className="px-6 py-3 font-bold text-slate-900">CELKEM</td>
              <td className="px-6 py-3 text-right font-bold text-xl text-indigo-700">
                {fmt(parseFloat(quote.total), quote.currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {quote.converted_invoice_id && (
        <div className="card p-4 bg-green-50 border border-green-200">
          <p className="text-sm text-green-800 font-medium">
            Nabídka byla převedena na fakturu.{" "}
            <Link href={`/dashboard/invoices/${quote.converted_invoice_id}`} className="underline">
              Zobrazit fakturu →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

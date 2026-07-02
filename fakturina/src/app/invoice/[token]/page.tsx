import { notFound } from "next/navigation";
import Link from "next/link";
import { query, initDb } from "@/lib/db";
import { auditLog } from "@/lib/audit";
import { Download, CheckCircle, Clock, AlertCircle, Zap } from "lucide-react";

function fmt(n: number, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
}

const STATUS_UI: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  paid: { label: "Zaplaceno", color: "text-green-600 bg-green-50", icon: CheckCircle },
  overdue: { label: "Po splatnosti", color: "text-red-600 bg-red-50", icon: AlertCircle },
  sent: { label: "Odesláno", color: "text-blue-600 bg-blue-50", icon: Clock },
  viewed: { label: "Zobrazeno", color: "text-purple-600 bg-purple-50", icon: Clock },
  draft: { label: "Koncept", color: "text-slate-600 bg-slate-50", icon: Clock },
};

export default async function PublicInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await initDb();

  const { rows } = await query(
    `SELECT i.*,
       co.name as company_name, co.ico as company_ico, co.dic as company_dic,
       co.address as company_address, co.city as company_city, co.zip as company_zip,
       co.bank_account, co.iban, co.swift, co.logo_url, co.vat_status,
       cl.name as client_name, cl.ico as client_ico, cl.address as client_address,
       cl.city as client_city, cl.zip as client_zip
     FROM fak_invoices i
     JOIN fak_companies co ON co.id = i.company_id
     LEFT JOIN fak_clients cl ON cl.id = i.client_id
     WHERE i.public_token = $1 AND i.status != 'cancelled'`,
    [token]
  );
  const invoice = rows[0];
  if (!invoice) notFound();

  // Record view
  if (!invoice.viewed_at) {
    await query(
      "UPDATE fak_invoices SET status = CASE WHEN status = 'sent' THEN 'viewed' ELSE status END, viewed_at = $1 WHERE public_token = $2",
      [Math.floor(Date.now() / 1000), token]
    );
    await auditLog({
      userId: "public",
      companyId: invoice.company_id,
      action: "invoice.viewed_public",
      entityType: "invoice",
      entityId: invoice.id,
    });
  }

  const { rows: items } = await query(
    "SELECT * FROM fak_invoice_items WHERE invoice_id = $1 ORDER BY sort_order ASC",
    [invoice.id]
  );

  const isVatPayer = invoice.vat_status === "vat_payer";
  const statusUi = STATUS_UI[invoice.status] ?? STATUS_UI.sent;
  const StatusIcon = statusUi.icon;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const pdfUrl = `${appUrl}/api/public/invoice/${token}/pdf`;

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-900">Fakturina</span>
        </div>
        <a href={pdfUrl} className="btn-primary text-sm flex items-center gap-2 py-2 px-4">
          <Download className="w-4 h-4" /> Stáhnout PDF
        </a>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Status banner */}
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl ${statusUi.color}`}>
          <StatusIcon className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-semibold">{statusUi.label}</div>
            <div className="text-sm opacity-75">Faktura č. {invoice.number} • splatná {invoice.due_date}</div>
          </div>
        </div>

        {/* Invoice card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-start px-8 pt-8 pb-6 border-b border-slate-100">
            <div>
              {invoice.logo_url ? (
                <img src={invoice.logo_url} alt="logo" className="h-12 object-contain" />
              ) : (
                <div className="text-xl font-bold text-slate-900">{invoice.company_name}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-indigo-600">FAKTURA</div>
              <div className="text-slate-400 text-sm mt-0.5">č. {invoice.number}</div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Parties */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Dodavatel</h3>
                <div className="font-semibold text-slate-900">{invoice.company_name}</div>
                {invoice.company_address && <div className="text-sm text-slate-500">{invoice.company_address}</div>}
                {invoice.company_city && <div className="text-sm text-slate-500">{invoice.company_zip} {invoice.company_city}</div>}
                {invoice.company_ico && <div className="text-sm text-slate-500 mt-1">IČ: {invoice.company_ico}</div>}
                {invoice.company_dic && <div className="text-sm text-slate-500">DIČ: {invoice.company_dic}</div>}
                {invoice.vat_status === "non_vat" && <div className="text-xs text-slate-400 italic mt-1">Neplátce DPH</div>}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Odběratel</h3>
                {invoice.client_name ? (
                  <>
                    <div className="font-semibold text-slate-900">{invoice.client_name}</div>
                    {invoice.client_address && <div className="text-sm text-slate-500">{invoice.client_address}</div>}
                    {invoice.client_city && <div className="text-sm text-slate-500">{invoice.client_zip} {invoice.client_city}</div>}
                    {invoice.client_ico && <div className="text-sm text-slate-500 mt-1">IČ: {invoice.client_ico}</div>}
                  </>
                ) : <div className="text-sm text-slate-400">—</div>}
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-3 gap-4 bg-slate-50 rounded-xl p-4">
              <div>
                <div className="text-xs text-slate-400 font-medium">Vystaveno</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">{invoice.issue_date}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Splatnost</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">{invoice.due_date}</div>
              </div>
              {invoice.variable_symbol && (
                <div>
                  <div className="text-xs text-slate-400 font-medium">Var. symbol</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">{invoice.variable_symbol}</div>
                </div>
              )}
            </div>

            {/* Items */}
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide rounded-l-lg">Položka</th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Mn.</th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">Cena/ks</th>
                  {isVatPayer && <th className="text-right px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">DPH</th>}
                  <th className="text-right px-4 py-2.5 text-xs font-semibold uppercase tracking-wide rounded-r-lg">Celkem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-3 py-3 text-right text-slate-500">{item.quantity} {item.unit}</td>
                    <td className="px-3 py-3 text-right text-slate-500">{fmt(parseFloat(item.unit_price), invoice.currency)}</td>
                    {isVatPayer && <td className="px-3 py-3 text-right text-slate-500">{item.vat_rate} %</td>}
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {fmt(parseFloat(isVatPayer ? item.total_with_vat : item.total_without_vat), invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="min-w-[220px] space-y-1 text-sm">
                {isVatPayer && (
                  <>
                    <div className="flex justify-between text-slate-500">
                      <span>Základ DPH</span><span>{fmt(parseFloat(invoice.subtotal), invoice.currency)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>DPH celkem</span><span>{fmt(parseFloat(invoice.vat_total), invoice.currency)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold text-xl text-indigo-700 border-t border-indigo-200 pt-2 mt-1">
                  <span>Celkem</span><span>{fmt(parseFloat(invoice.total), invoice.currency)}</span>
                </div>
              </div>
            </div>

            {/* Payment */}
            {(invoice.bank_account || invoice.iban) && invoice.status !== "paid" && (
              <div className="bg-indigo-50 rounded-xl p-5 grid sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Platební údaje</h4>
                  {invoice.bank_account && (
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-500">Číslo účtu</span>
                      <span className="font-semibold text-slate-800">{invoice.bank_account}</span>
                    </div>
                  )}
                  {invoice.iban && (
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-500">IBAN</span>
                      <span className="font-semibold text-slate-800 text-xs">{invoice.iban}</span>
                    </div>
                  )}
                  {invoice.swift && (
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-500">SWIFT</span>
                      <span className="font-semibold text-slate-800">{invoice.swift}</span>
                    </div>
                  )}
                  {invoice.variable_symbol && (
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-500">Var. symbol</span>
                      <span className="font-semibold text-slate-800">{invoice.variable_symbol}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-indigo-200">
                    <span className="text-slate-600">K úhradě</span>
                    <span className="text-indigo-700">{fmt(parseFloat(invoice.total), invoice.currency)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white rounded-xl border border-indigo-100 flex items-center justify-center mx-auto mb-2">
                      <div className="text-xs text-slate-300">QR platba</div>
                    </div>
                    <div className="text-xs text-slate-400">Naskenujte QR kód</div>
                  </div>
                </div>
              </div>
            )}

            {invoice.note && (
              <div className="border-l-4 border-amber-400 pl-4 py-2 bg-amber-50 rounded-r-xl text-sm text-amber-800">
                {invoice.note}
              </div>
            )}
          </div>

          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
            Faktura vystavena elektronicky přes{" "}
            <Link href="/" className="text-indigo-600 hover:underline">Fakturina.cz</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, FileCheck, Zap } from "lucide-react";
import { initDb, query } from "@/lib/db";

function fmt(n: number, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Koncept",
  sent: "Odesláno",
  accepted: "Přijato",
  rejected: "Odmítnuto",
  expired: "Expirováno",
};

export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await initDb();

  const { rows: [quote] } = await query(
    `SELECT q.*,
       co.name as company_name, co.ico as company_ico, co.dic as company_dic,
       co.address as company_address, co.city as company_city, co.zip as company_zip,
       co.logo_url, co.vat_status,
       cl.name as client_name, cl.ico as client_ico, cl.dic as client_dic,
       cl.address as client_address, cl.city as client_city, cl.zip as client_zip
     FROM fak_quotes q
     JOIN fak_companies co ON co.id = q.company_id
     LEFT JOIN fak_clients cl ON cl.id = q.client_id
     WHERE q.public_token = $1`,
    [token]
  );
  if (!quote) notFound();

  if (!quote.viewed_at && quote.status === "sent") {
    await query("UPDATE fak_quotes SET viewed_at = $1 WHERE public_token = $2", [Math.floor(Date.now() / 1000), token]);
  }

  const { rows: items } = await query(
    "SELECT * FROM fak_quote_items WHERE quote_id = $1 ORDER BY sort_order",
    [quote.id]
  );
  const isVatPayer = quote.vat_status === "vat_payer";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-900">Fakturina</span>
        </div>
        <a href={`${appUrl}/api/public/quote/${token}/pdf`} className="btn-primary text-sm">
          <Download className="w-4 h-4" /> Stáhnout PDF
        </a>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-emerald-700 bg-emerald-50">
          <FileCheck className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-semibold">{STATUS_LABELS[quote.status] ?? quote.status}</div>
            <div className="text-sm opacity-75">Nabídka č. {quote.number}{quote.valid_until ? ` · platná do ${quote.valid_until}` : ""}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-start px-8 pt-8 pb-6 border-b border-slate-100">
            <div>
              {quote.logo_url ? <img src={quote.logo_url} alt="logo" className="h-12 object-contain" /> : <div className="text-xl font-bold text-slate-900">{quote.company_name}</div>}
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-700">NABÍDKA</div>
              <div className="text-slate-400 text-sm mt-0.5">č. {quote.number}</div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Dodavatel</h3>
                <div className="font-semibold text-slate-900">{quote.company_name}</div>
                {quote.company_address && <div className="text-sm text-slate-500">{quote.company_address}</div>}
                {quote.company_city && <div className="text-sm text-slate-500">{quote.company_zip} {quote.company_city}</div>}
                {quote.company_ico && <div className="text-sm text-slate-500 mt-1">IČ: {quote.company_ico}</div>}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Klient</h3>
                <div className="font-semibold text-slate-900">{quote.client_name ?? "—"}</div>
                {quote.client_address && <div className="text-sm text-slate-500">{quote.client_address}</div>}
                {quote.client_city && <div className="text-sm text-slate-500">{quote.client_zip} {quote.client_city}</div>}
                {quote.client_ico && <div className="text-sm text-slate-500 mt-1">IČ: {quote.client_ico}</div>}
              </div>
            </div>

            {quote.note_before_items && <div className="border-l-4 border-emerald-500 pl-4 py-2 bg-emerald-50 rounded-r-xl text-sm text-emerald-900">{quote.note_before_items}</div>}

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-700 text-white">
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
                    <td className="px-3 py-3 text-right text-slate-500">{fmt(parseFloat(item.unit_price), quote.currency)}</td>
                    {isVatPayer && <td className="px-3 py-3 text-right text-slate-500">{item.vat_rate} %</td>}
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmt(parseFloat(isVatPayer ? item.total_with_vat : item.total_without_vat), quote.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="min-w-[220px] space-y-1 text-sm">
                {isVatPayer && (
                  <>
                    <div className="flex justify-between text-slate-500"><span>Základ DPH</span><span>{fmt(parseFloat(quote.subtotal), quote.currency)}</span></div>
                    <div className="flex justify-between text-slate-500"><span>DPH celkem</span><span>{fmt(parseFloat(quote.vat_total), quote.currency)}</span></div>
                  </>
                )}
                <div className="flex justify-between font-bold text-xl text-emerald-700 border-t border-emerald-200 pt-2 mt-1">
                  <span>Celkem</span><span>{fmt(parseFloat(quote.total), quote.currency)}</span>
                </div>
              </div>
            </div>

            {quote.footer_text && <div className="text-sm text-slate-500 border-t border-slate-100 pt-4">{quote.footer_text}</div>}
          </div>

          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
            Nabídka vystavena elektronicky přes <Link href="/" className="text-indigo-600 hover:underline">Fakturina.cz</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import InvoiceStatusBadge from "@/components/InvoiceStatusBadge";
import InvoiceActions from "@/components/InvoiceActions";
import InvoiceAttachments from "@/components/InvoiceAttachments";
import { ArrowLeft, ExternalLink } from "lucide-react";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank: "Bankovní převod",
  card: "Kartou",
  cash: "Hotově",
  cod: "Dobírka",
  other: "Jiný",
};

function fmt(n: number, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
}

const TYPE_LABELS: Record<string, string> = {
  invoice: "Faktura",
  proforma: "Proforma faktura",
  advance: "Zálohová faktura",
  credit_note: "Dobropis",
  tax_document: "Daňový doklad",
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const { rows } = await query(
    "SELECT i.*, c.name as client_name, c.ico as client_ico, c.dic as client_dic, c.address as client_address, c.city as client_city, c.zip as client_zip, c.email as client_email FROM fak_invoices i LEFT JOIN fak_clients c ON c.id = i.client_id WHERE i.id = $1 AND i.company_id = $2",
    [id, company.id]
  );
  const invoice = rows[0];
  if (!invoice) notFound();

  const { rows: items } = await query(
    "SELECT * FROM fak_invoice_items WHERE invoice_id = $1 ORDER BY sort_order ASC",
    [id]
  );

  const { rows: attachments } = await query(
    "SELECT * FROM fak_invoice_attachments WHERE invoice_id = $1 ORDER BY created_at DESC",
    [id]
  ).catch(() => ({ rows: [] }));

  // Resolve bank account (per-invoice override or company default)
  let bankAccount = company.bank_account as string | null;
  let iban = company.iban as string | null;
  let swift = company.swift as string | null;
  if (invoice.bank_account_id) {
    const { rows: bankRows } = await query(
      "SELECT * FROM fak_bank_accounts WHERE id = $1 AND company_id = $2",
      [invoice.bank_account_id, company.id]
    ).catch(() => ({ rows: [] }));
    if (bankRows[0]) {
      bankAccount = bankRows[0].bank_account ?? bankAccount;
      iban = bankRows[0].iban ?? iban;
      swift = bankRows[0].swift ?? swift;
    }
  }
  const showIban = (invoice.show_iban ?? "auto") as string;
  if (showIban === "never") iban = null;

  const isVatPayer = company.vat_status === "vat_payer";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3020";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/invoices" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{invoice.number}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-slate-500 text-sm">{TYPE_LABELS[invoice.type] ?? invoice.type}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Dodavatel</h3>
              <div className="font-semibold text-slate-900">{company.name}</div>
              {company.address && <div className="text-sm text-slate-500">{company.address}</div>}
              {company.city && <div className="text-sm text-slate-500">{company.zip} {company.city}</div>}
              {company.ico && <div className="text-sm text-slate-500">IČ: {company.ico}</div>}
              {company.dic && <div className="text-sm text-slate-500">DIČ: {company.dic}</div>}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Odběratel</h3>
              {invoice.client_name ? (
                <>
                  <div className="font-semibold text-slate-900">{invoice.client_name}</div>
                  {invoice.client_address && <div className="text-sm text-slate-500">{invoice.client_address}</div>}
                  {invoice.client_city && <div className="text-sm text-slate-500">{invoice.client_zip} {invoice.client_city}</div>}
                  {invoice.client_ico && <div className="text-sm text-slate-500">IČ: {invoice.client_ico}</div>}
                  {invoice.client_dic && <div className="text-sm text-slate-500">DIČ: {invoice.client_dic}</div>}
                </>
              ) : (
                <div className="text-sm text-slate-400">Klient nebyl zadán</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 rounded-xl p-4">
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
            {invoice.payment_method && (
              <div>
                <div className="text-xs text-slate-400 font-medium">Způsob platby</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">
                  {PAYMENT_METHOD_LABELS[invoice.payment_method] ?? invoice.payment_method}
                </div>
              </div>
            )}
            {invoice.order_number && (
              <div>
                <div className="text-xs text-slate-400 font-medium">Číslo objednávky</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">{invoice.order_number}</div>
              </div>
            )}
          </div>

          {/* Items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="text-left py-2">Položka</th>
                <th className="text-right py-2">Mn.</th>
                <th className="text-right py-2">Cena/ks</th>
                {isVatPayer && <th className="text-right py-2">DPH %</th>}
                <th className="text-right py-2">Celkem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 text-slate-800 font-medium">{item.name}</td>
                  <td className="py-2.5 text-right text-slate-500">{item.quantity} {item.unit ?? ""}</td>
                  <td className="py-2.5 text-right text-slate-500">{fmt(parseFloat(item.unit_price), invoice.currency)}</td>
                  {isVatPayer && <td className="py-2.5 text-right text-slate-500">{item.vat_rate} %</td>}
                  <td className="py-2.5 text-right font-semibold text-slate-900">
                    {fmt(parseFloat(isVatPayer ? item.total_with_vat : item.total_without_vat), invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-slate-200 pt-4 space-y-1 text-sm">
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
            {(() => {
              const gross = Math.round((parseFloat(invoice.subtotal) + parseFloat(invoice.vat_total)) * 100) / 100;
              const discountPct = invoice.discount_pct ? parseFloat(invoice.discount_pct) : 0;
              const discountAmount = invoice.discount_amount ? parseFloat(invoice.discount_amount) : 0;
              const discountValue = discountPct > 0
                ? Math.round(gross * (discountPct / 100) * 100) / 100
                : discountAmount > 0 ? discountAmount : 0;
              if (discountValue <= 0) return null;
              return (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Sleva {discountPct > 0 ? `(${discountPct} %)` : ""}</span>
                  <span>−{fmt(discountValue, invoice.currency)}</span>
                </div>
              );
            })()}
            <div className="flex justify-between font-bold text-lg text-slate-900 pt-1">
              <span>CELKEM K ÚHRADĚ</span>
              <span className="text-indigo-700">{fmt(parseFloat(invoice.total), invoice.currency)}</span>
            </div>
          </div>

          {invoice.reverse_charge && (
            <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r-xl text-sm text-amber-800">
              <div className="font-semibold">Přenesená daňová povinnost</div>
              <div className="text-xs mt-0.5">Daň odvádí zákazník dle § 92a ZDPH</div>
            </div>
          )}

          {invoice.show_already_paid && (
            <div className="bg-green-50 border-l-4 border-green-500 px-4 py-3 rounded-r-xl text-sm text-green-800 font-semibold">
              NEPLATTE — FAKTURA JIŽ UHRAZENA
            </div>
          )}

          {invoice.note && (
            <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r-xl text-sm text-amber-800">
              {invoice.note}
            </div>
          )}
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4">
          <InvoiceActions invoiceId={id} status={invoice.status} invoiceNumber={invoice.number} clientEmail={invoice.client_email ?? undefined} />

          <div className="card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Online odkaz</h3>
            <p className="text-xs text-slate-500">Sdílejte fakturu s klientem</p>
            <a
              href={`${appUrl}/invoice/${invoice.public_token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Otevřít online fakturu
            </a>
          </div>

          {(bankAccount || iban) && (
            <div className="card p-5 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Platební údaje</h3>
              {bankAccount && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Účet</span>
                  <span className="font-medium text-slate-800">{bankAccount}</span>
                </div>
              )}
              {iban && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">IBAN</span>
                  <span className="font-medium text-slate-800 text-xs">{iban}</span>
                </div>
              )}
              {swift && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">SWIFT</span>
                  <span className="font-medium text-slate-800 text-xs">{swift}</span>
                </div>
              )}
              {invoice.variable_symbol && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Var. symbol</span>
                  <span className="font-medium text-slate-800">{invoice.variable_symbol}</span>
                </div>
              )}
            </div>
          )}

          <InvoiceAttachments invoiceId={id} initialAttachments={attachments} />
        </div>
      </div>
    </div>
  );
}

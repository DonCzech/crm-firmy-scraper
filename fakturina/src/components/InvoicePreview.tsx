"use client";

interface Company {
  name: string;
  ico?: string;
  dic?: string;
  address?: string;
  city?: string;
  zip?: string;
  bank_account?: string;
  iban?: string;
  logo_url?: string;
  vat_status: string;
}

interface Client {
  name: string;
  ico?: string;
  dic?: string;
  address?: string;
  city?: string;
  zip?: string;
}

interface Item {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
}

interface Form {
  type: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  taxableDate?: string;
  note?: string;
  variableSymbol?: string;
  reverseCharge?: boolean;
  discountPct?: number;
  discountAmount?: number;
  showAlreadyPaid?: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  invoice: "FAKTURA",
  proforma: "PROFORMA FAKTURA",
  advance: "ZÁLOHOVÁ FAKTURA",
  credit_note: "DOBROPIS",
  tax_document: "DAŇOVÝ DOKLAD",
};

export default function InvoicePreview({ company, client, form, items, subtotal, vatTotal, isVatPayer }: {
  company: Company;
  client?: Client;
  form: Form;
  items: Item[];
  subtotal: number;
  vatTotal: number;
  total: number;
  isVatPayer: boolean;
}) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: form.currency, minimumFractionDigits: 2 }).format(n);

  const calcItem = (item: Item) => {
    const base = Math.round(item.quantity * item.unitPrice * 100) / 100;
    const vat = isVatPayer ? Math.round(base * (item.vatRate / 100) * 100) / 100 : 0;
    return { base, vat, total: Math.round((base + vat) * 100) / 100 };
  };

  const gross = Math.round((subtotal + vatTotal) * 100) / 100;
  const discountValue = (form.discountPct ?? 0) > 0
    ? Math.round(gross * ((form.discountPct ?? 0) / 100) * 100) / 100
    : (form.discountAmount ?? 0) > 0 ? (form.discountAmount ?? 0) : 0;
  const finalTotal = Math.round((gross - discountValue) * 100) / 100;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs" style={{ fontFamily: "Georgia, serif" }}>
      {/* "Already paid" banner */}
      {form.showAlreadyPaid && (
        <div style={{ background: "#f0fdf4", borderBottom: "2px solid #16a34a", padding: "8px 24px", textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: "#15803d", letterSpacing: "0.5px" }}>
          NEPLATTE — FAKTURA JIŽ UHRAZENA
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start px-6 pt-6 pb-4 border-b border-slate-100">
        <div>
          {company.logo_url ? (
            <img src={company.logo_url} alt="logo" className="h-10 object-contain" />
          ) : (
            <div className="text-base font-bold text-slate-900" style={{ fontFamily: "Inter, sans-serif" }}>{company.name}</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-indigo-600 tracking-tight">{TYPE_LABEL[form.type] ?? "FAKTURA"}</div>
          <div className="text-slate-400 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>č. FA0001</div>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-4 px-6 py-4">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Dodavatel</div>
          <div className="font-bold text-slate-800 text-xs">{company.name}</div>
          {company.address && <div className="text-slate-500">{company.address}</div>}
          {company.city && <div className="text-slate-500">{company.zip} {company.city}</div>}
          {company.ico && <div className="text-slate-500 mt-1">IČ: {company.ico}</div>}
          {company.dic && <div className="text-slate-500">DIČ: {company.dic}</div>}
          {company.vat_status === "non_vat" && <div className="text-slate-400 italic mt-0.5">Neplátce DPH</div>}
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>Odběratel</div>
          {client ? (
            <>
              <div className="font-bold text-slate-800 text-xs">{client.name}</div>
              {client.address && <div className="text-slate-500">{client.address}</div>}
              {client.city && <div className="text-slate-500">{client.zip} {client.city}</div>}
              {client.ico && <div className="text-slate-500 mt-1">IČ: {client.ico}</div>}
              {client.dic && <div className="text-slate-500">DIČ: {client.dic}</div>}
            </>
          ) : (
            <div className="text-slate-300 italic">Vyberte klienta</div>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-3 gap-2 mx-6 mb-4 bg-slate-50 rounded-xl p-3">
        {[
          { label: "Vystaveno", value: form.issueDate },
          { label: "Splatnost", value: form.dueDate },
          ...(form.variableSymbol ? [{ label: "Var. symbol", value: form.variableSymbol }] : []),
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>{label}</div>
            <div className="text-slate-700 font-semibold text-[10px] mt-0.5">{value || "—"}</div>
          </div>
        ))}
      </div>

      {/* Reverse charge notice */}
      {form.reverseCharge && (
        <div className="mx-6 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg" style={{ fontFamily: "Inter, sans-serif" }}>
          <div className="text-[9px] font-bold text-amber-700 uppercase tracking-wider">Přenesená daňová povinnost</div>
          <div className="text-[9px] text-amber-600 mt-0.5">Daň odvádí zákazník dle § 92a ZDPH</div>
        </div>
      )}

      {/* Items */}
      <div className="px-6 mb-4">
        <table className="w-full" style={{ fontFamily: "Inter, sans-serif" }}>
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="text-left px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider rounded-l-lg">Položka</th>
              <th className="text-right px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider">Mn.</th>
              <th className="text-right px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider">Cena</th>
              {isVatPayer && <th className="text-right px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider">DPH</th>}
              <th className="text-right px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wider rounded-r-lg">Celkem</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-3 text-slate-300 text-[9px]">Přidejte položky</td>
              </tr>
            ) : (
              items.map((item, i) => {
                const c = calcItem(item);
                return (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-2 py-1.5 text-slate-700">{item.name || "—"}</td>
                    <td className="px-2 py-1.5 text-right text-slate-500">{item.quantity} {item.unit}</td>
                    <td className="px-2 py-1.5 text-right text-slate-500">{fmt(item.unitPrice)}</td>
                    {isVatPayer && <td className="px-2 py-1.5 text-right text-slate-500">{item.vatRate}%</td>}
                    <td className="px-2 py-1.5 text-right font-semibold text-slate-800">{fmt(c.total)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-6 pb-4 flex justify-end" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="min-w-[160px] space-y-0.5">
          {isVatPayer && (
            <>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Základ DPH</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>DPH</span><span>{fmt(vatTotal)}</span>
              </div>
            </>
          )}
          {discountValue > 0 && (
            <div className="flex justify-between text-[10px] text-green-600 font-medium">
              <span>Sleva {(form.discountPct ?? 0) > 0 ? `(${form.discountPct} %)` : ""}</span>
              <span>−{fmt(discountValue)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-indigo-700 border-t border-indigo-200 pt-1.5 mt-1">
            <span>Celkem</span><span>{fmt(finalTotal)}</span>
          </div>
        </div>
      </div>

      {/* Payment */}
      {(company.bank_account || company.iban) && (
        <div className="mx-6 mb-4 bg-slate-50 rounded-xl p-3" style={{ fontFamily: "Inter, sans-serif" }}>
          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Platební údaje</div>
          {company.bank_account && (
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Číslo účtu</span>
              <span className="font-semibold text-slate-700">{company.bank_account}</span>
            </div>
          )}
          {company.iban && (
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">IBAN</span>
              <span className="font-semibold text-slate-700">{company.iban}</span>
            </div>
          )}
        </div>
      )}

      {form.note && (
        <div className="mx-6 mb-4 border-l-2 border-amber-400 pl-3 py-1" style={{ fontFamily: "Inter, sans-serif" }}>
          <div className="text-[9px] text-amber-600 font-semibold uppercase tracking-wider mb-0.5">Poznámka</div>
          <div className="text-[10px] text-slate-600">{form.note}</div>
        </div>
      )}

      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[9px] text-slate-400" style={{ fontFamily: "Inter, sans-serif" }}>
        Faktura vystavena elektronicky přes Fakturina.cz
      </div>
    </div>
  );
}

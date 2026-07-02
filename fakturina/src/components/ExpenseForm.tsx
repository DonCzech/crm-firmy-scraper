"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import DatePicker from "./DatePicker";

interface Company {
  id: string; name: string; vat_status: string; default_currency: string;
}

interface Item { name: string; quantity: number; unit: string; unitPrice: number; vatRate: number; }

interface Props {
  company: Company;
  defaultIssueDate: string;
  defaultDueDate: string;
  expense?: {
    id: string; supplierName?: string; supplierIco?: string; number?: string;
    variableSymbol?: string; currency: string; issueDate: string; dueDate: string;
    taxableDate?: string; paymentMethod?: string; note?: string; items: Item[];
  };
}

const VAT_RATES = [0, 12, 21];

export default function ExpenseForm({ company, defaultIssueDate, defaultDueDate, expense }: Props) {
  const router = useRouter();
  const isVatPayer = company.vat_status === "vat_payer";

  const [form, setForm] = useState({
    supplierName: expense?.supplierName ?? "",
    supplierIco: expense?.supplierIco ?? "",
    number: expense?.number ?? "",
    variableSymbol: expense?.variableSymbol ?? "",
    currency: expense?.currency ?? company.default_currency ?? "CZK",
    issueDate: expense?.issueDate ?? defaultIssueDate,
    dueDate: expense?.dueDate ?? defaultDueDate,
    taxableDate: expense?.taxableDate ?? "",
    paymentMethod: expense?.paymentMethod ?? "bank",
    note: expense?.note ?? "",
  });

  const [items, setItems] = useState<Item[]>(
    expense?.items?.length
      ? expense.items
      : [{ name: "", quantity: 1, unit: "ks", unitPrice: 0, vatRate: 0 }]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const calcItem = (item: Item) => {
    const base = Math.round(item.quantity * item.unitPrice * 100) / 100;
    const vat = isVatPayer ? Math.round(base * (item.vatRate / 100) * 100) / 100 : 0;
    return { base, vat, total: Math.round((base + vat) * 100) / 100 };
  };

  const subtotal = items.reduce((s, i) => s + calcItem(i).base, 0);
  const vatTotal = items.reduce((s, i) => s + calcItem(i).vat, 0);
  const total = Math.round((subtotal + vatTotal) * 100) / 100;

  const fmt = (n: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: form.currency, minimumFractionDigits: 2 }).format(n);

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      const url = expense?.id ? `/api/expenses/${expense.id}` : "/api/expenses";
      const method = expense?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit, unitPrice: i.unitPrice, vatRate: i.vatRate })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Chyba");
      const exp = await res.json();
      router.push(`/dashboard/expenses/${exp.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba při ukládání");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-900">Dodavatel</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Název dodavatele</label>
            <input className="input" value={form.supplierName} onChange={set("supplierName")} placeholder="Firma s.r.o." />
          </div>
          <div>
            <label className="label">IČO</label>
            <input className="input" value={form.supplierIco} onChange={set("supplierIco")} placeholder="12345678" />
          </div>
          <div>
            <label className="label">Číslo dokladu</label>
            <input className="input" value={form.number} onChange={set("number")} placeholder="2024-001" />
          </div>
          <div>
            <label className="label">Variabilní symbol</label>
            <input className="input" value={form.variableSymbol} onChange={set("variableSymbol")} />
          </div>
          <div>
            <label className="label">Měna</label>
            <select className="input" value={form.currency} onChange={set("currency")}>
              <option>CZK</option><option>EUR</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-900">Datum a platba</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Datum přijetí</label>
            <DatePicker value={form.issueDate} onChange={(v) => setForm((f) => ({ ...f, issueDate: v }))} />
          </div>
          <div>
            <label className="label">Datum splatnosti</label>
            <DatePicker value={form.dueDate} onChange={(v) => setForm((f) => ({ ...f, dueDate: v }))} />
          </div>
          {isVatPayer && (
            <div>
              <label className="label">DUZP</label>
              <DatePicker value={form.taxableDate} onChange={(v) => setForm((f) => ({ ...f, taxableDate: v }))} />
            </div>
          )}
        </div>

        <div>
          <label className="label">Způsob platby</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {[
              { value: "bank", label: "Bankou" }, { value: "card", label: "Kartou" },
              { value: "cash", label: "Hotově" }, { value: "cod", label: "Dobírka" },
              { value: "other", label: "Jinak" },
            ].map((m) => (
              <button key={m.value} type="button"
                onClick={() => setForm((f) => ({ ...f, paymentMethod: m.value }))}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  form.paymentMethod === m.value
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >{m.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Poznámka</label>
          <textarea className="input resize-none" rows={2} value={form.note} onChange={set("note")} />
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-slate-900">Položky</h2>

        {items.map((item, i) => {
          const calc = calcItem(item);
          return (
            <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="label">Název</label>
                  <input className="input" value={item.name}
                    onChange={(e) => setItems((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    placeholder="Název položky" />
                </div>
                <button type="button" onClick={() => setItems((p) => p.filter((_, j) => j !== i))}
                  className="mt-6 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="label">Množství</label>
                  <input className="input" type="number" step="0.01" value={item.quantity}
                    onChange={(e) => setItems((p) => p.map((x, j) => j === i ? { ...x, quantity: parseFloat(e.target.value) || 0 } : x))} />
                </div>
                <div>
                  <label className="label">Jednotka</label>
                  <input className="input" value={item.unit}
                    onChange={(e) => setItems((p) => p.map((x, j) => j === i ? { ...x, unit: e.target.value } : x))}
                    placeholder="ks" />
                </div>
                <div>
                  <label className="label">Cena/ks</label>
                  <input className="input" type="number" step="0.01" value={item.unitPrice}
                    onChange={(e) => setItems((p) => p.map((x, j) => j === i ? { ...x, unitPrice: parseFloat(e.target.value) || 0 } : x))} />
                </div>
                {isVatPayer && (
                  <div>
                    <label className="label">DPH %</label>
                    <select className="input" value={item.vatRate}
                      onChange={(e) => setItems((p) => p.map((x, j) => j === i ? { ...x, vatRate: parseInt(e.target.value) } : x))}>
                      {VAT_RATES.map((r) => <option key={r} value={r}>{r} %</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-4 text-sm text-slate-500">
                <span>Základ: <strong className="text-slate-800">{fmt(calc.base)}</strong></span>
                {isVatPayer && <span>DPH: <strong>{fmt(calc.vat)}</strong></span>}
                <span>Celkem: <strong className="text-indigo-700">{fmt(calc.total)}</strong></span>
              </div>
            </div>
          );
        })}

        <button type="button"
          onClick={() => setItems((p) => [...p, { name: "", quantity: 1, unit: "ks", unitPrice: 0, vatRate: 0 }])}
          className="btn-secondary w-full flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Přidat položku
        </button>

        <div className="border-t border-slate-200 pt-4 flex justify-between font-bold text-lg text-slate-900">
          <span>CELKEM</span><span className="text-indigo-700">{fmt(total)}</span>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <button type="button" onClick={handleSave} disabled={loading}
        className="btn-primary flex items-center gap-2 disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Uložit náklad
      </button>
    </div>
  );
}

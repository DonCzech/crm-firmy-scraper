"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import DatePicker from "./DatePicker";

interface Client {
  id: string;
  name: string;
}

interface Item {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
}

interface RecurringInvoice {
  id: string;
  clientId?: string | null;
  name: string;
  startDate: string;
  endDate?: string | null;
  period: string;
  sendByEmail: boolean;
  asProforma: boolean;
  dueDays: number;
  currency: string;
  note?: string | null;
  items: Item[];
}

interface Props {
  company: { vat_status: string; default_currency: string; default_due_days: number };
  clients: Client[];
  recurring?: RecurringInvoice;
}

const PERIODS = [
  { value: "weekly", label: "Týdně" },
  { value: "monthly", label: "Měsíčně" },
  { value: "quarterly", label: "Čtvrtletně" },
  { value: "yearly", label: "Ročně" },
];

const VAT_RATES = [0, 12, 21];

export default function RecurringInvoiceForm({ company, clients, recurring }: Props) {
  const router = useRouter();
  const isEdit = !!recurring;
  const isVatPayer = company.vat_status === "vat_payer";
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: recurring?.name ?? "",
    clientId: recurring?.clientId ?? "",
    startDate: recurring?.startDate ?? today,
    endDate: recurring?.endDate ?? "",
    period: recurring?.period ?? "monthly",
    sendByEmail: recurring?.sendByEmail ?? false,
    asProforma: recurring?.asProforma ?? false,
    dueDays: String(recurring?.dueDays ?? company.default_due_days ?? 14),
    currency: recurring?.currency ?? company.default_currency ?? "CZK",
    note: recurring?.note ?? "",
    hasEndDate: !!(recurring?.endDate),
  });

  const [items, setItems] = useState<Item[]>(
    recurring?.items?.length
      ? recurring.items.map((i) => ({ ...i, unit: i.unit ?? "" }))
      : [{ name: "", quantity: 1, unit: "ks", unitPrice: 0, vatRate: isVatPayer ? 21 : 0 }]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const setItem = (i: number, k: keyof Item) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = ["quantity", "unitPrice", "vatRate"].includes(k)
        ? parseFloat(e.target.value) || 0
        : e.target.value;
      setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [k]: val } : item)));
    };

  const addItem = () =>
    setItems((prev) => [...prev, { name: "", quantity: 1, unit: "ks", unitPrice: 0, vatRate: isVatPayer ? 21 : 0 }]);

  const removeItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const calcItem = (item: Item) => {
    const base = Math.round(item.quantity * item.unitPrice * 100) / 100;
    const vat = isVatPayer ? Math.round(base * (item.vatRate / 100) * 100) / 100 : 0;
    return { base, vat, total: Math.round((base + vat) * 100) / 100 };
  };

  const total = items.reduce((s, i) => s + calcItem(i).total, 0);
  const fmt = (n: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: form.currency, minimumFractionDigits: 2 }).format(n);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = isEdit ? `/api/recurring-invoices/${recurring!.id}` : "/api/recurring-invoices";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          clientId: form.clientId || null,
          startDate: form.startDate,
          endDate: form.hasEndDate && form.endDate ? form.endDate : null,
          period: form.period,
          sendByEmail: form.sendByEmail,
          asProforma: form.asProforma,
          dueDays: parseInt(form.dueDays),
          currency: form.currency,
          note: form.note || null,
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
            vatRate: i.vatRate,
          })),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Chyba při ukládání");
        return;
      }
      router.push("/dashboard/invoices/recurring");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-900">Základní nastavení</h2>

        <div>
          <label className="label">Název šablony *</label>
          <input
            className="input"
            value={form.name}
            onChange={set("name")}
            required
            placeholder="např. Měsíční hosting"
          />
        </div>

        <div>
          <label className="label">Klient</label>
          <select className="input" value={form.clientId} onChange={set("clientId")}>
            <option value="">— Vyberte klienta —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Perioda opakování</label>
            <select className="input" value={form.period} onChange={set("period")}>
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Měna</label>
            <select className="input" value={form.currency} onChange={set("currency")}>
              <option>CZK</option>
              <option>EUR</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Kdy začít</label>
            <DatePicker value={form.startDate} onChange={(v) => setForm((f) => ({ ...f, startDate: v }))} />
          </div>
          <div>
            <label className="label">Splatnost (dny)</label>
            <input
              className="input"
              type="number"
              min={1}
              max={365}
              value={form.dueDays}
              onChange={set("dueDays")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.hasEndDate}
              onChange={(e) => setForm((f) => ({ ...f, hasEndDate: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-slate-700">Zadat datum ukončení</span>
          </label>
          {form.hasEndDate && (
            <DatePicker value={form.endDate} onChange={(v) => setForm((f) => ({ ...f, endDate: v }))} />
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.sendByEmail}
              onChange={(e) => setForm((f) => ({ ...f, sendByEmail: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-slate-700">Automaticky posílat emailem</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.asProforma}
              onChange={(e) => setForm((f) => ({ ...f, asProforma: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-slate-700">Vystavit jako proformu</span>
          </label>
        </div>
      </div>

      {/* Items */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-slate-900">Položky</h2>

        {items.map((item, i) => {
          const calc = calcItem(item);
          return (
            <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="label">Název</label>
                  <input
                    className="input"
                    value={item.name}
                    onChange={setItem(i, "name")}
                    placeholder="Název položky / služby"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="mt-6 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="label">Množství</label>
                  <input className="input" type="number" step="0.01" value={item.quantity} onChange={setItem(i, "quantity")} />
                </div>
                <div>
                  <label className="label">Jednotka</label>
                  <input className="input" value={item.unit} onChange={setItem(i, "unit")} placeholder="ks" />
                </div>
                <div>
                  <label className="label">Cena/ks</label>
                  <input className="input" type="number" step="0.01" value={item.unitPrice} onChange={setItem(i, "unitPrice")} />
                </div>
                {isVatPayer && (
                  <div>
                    <label className="label">DPH %</label>
                    <select className="input" value={item.vatRate} onChange={setItem(i, "vatRate")}>
                      {VAT_RATES.map((r) => (
                        <option key={r} value={r}>{r} %</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end text-sm text-slate-500">
                <span>Celkem: <strong className="text-indigo-700">{fmt(calc.total)}</strong></span>
              </div>
            </div>
          );
        })}

        <button type="button" onClick={addItem} className="btn-secondary w-full flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Přidat položku
        </button>

        <div className="flex justify-end border-t border-slate-200 pt-3">
          <span className="font-bold text-lg text-slate-900">
            CELKEM <span className="text-indigo-700">{fmt(total)}</span>
          </span>
        </div>
      </div>

      <div className="card p-5">
        <label className="label">Poznámka</label>
        <textarea
          className="input resize-none"
          rows={2}
          value={form.note}
          onChange={set("note")}
          placeholder="Nepovinná poznámka…"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {isEdit ? "Uložit změny" : "Vytvořit pravidelnou fakturu"}
      </button>
    </form>
  );
}

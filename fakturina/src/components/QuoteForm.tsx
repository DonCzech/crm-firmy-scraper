"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Save, Send, UserPlus } from "lucide-react";
import DatePicker from "./DatePicker";
import NewClientModal from "./NewClientModal";

interface Client { id: string; name: string; ico?: string; dic?: string; email?: string; address?: string; city?: string; zip?: string; country?: string; }
interface Company { id: string; name: string; vat_status: string; default_currency: string; }
interface Item { name: string; quantity: number; unit: string; unitPrice: number; vatRate: number; }

interface Props {
  company: Company;
  clients: Client[];
  defaultIssueDate: string;
  defaultValidUntil: string;
  quote?: {
    id: string; clientId?: string; currency: string; issueDate: string;
    validUntil?: string; language: string; note?: string;
    noteBeforeItems?: string; footerText?: string; items: Item[];
  };
}

const VAT_RATES = [0, 12, 21];

export default function QuoteForm({ company, clients, defaultIssueDate, defaultValidUntil, quote }: Props) {
  const router = useRouter();
  const isVatPayer = company.vat_status === "vat_payer";

  const [form, setForm] = useState({
    clientId: quote?.clientId ?? "",
    currency: quote?.currency ?? company.default_currency ?? "CZK",
    issueDate: quote?.issueDate ?? defaultIssueDate,
    validUntil: quote?.validUntil ?? defaultValidUntil,
    language: quote?.language ?? "cs",
    note: quote?.note ?? "",
    noteBeforeItems: quote?.noteBeforeItems ?? "",
    footerText: quote?.footerText ?? "",
  });

  const [items, setItems] = useState<Item[]>(
    quote?.items?.length
      ? quote.items
      : [{ name: "", quantity: 1, unit: "ks", unitPrice: 0, vatRate: isVatPayer ? 21 : 0 }]
  );

  const [clientList, setClientList] = useState<Client[]>(clients);
  const [showNewClient, setShowNewClient] = useState(false);
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

  async function save(sendEmail = false) {
    setLoading(true);
    setError("");
    try {
      const url = quote?.id ? `/api/quotes/${quote.id}` : "/api/quotes";
      const method = quote?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, clientId: form.clientId || null,
          items: items.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit, unitPrice: i.unitPrice, vatRate: i.vatRate })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Chyba");
      const q = await res.json();

      if (sendEmail) {
        await fetch(`/api/quotes/${q.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "sent" }),
        });
      }
      router.push(`/dashboard/quotes/${q.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-900">Základní údaje</h2>

        <div>
          <label className="label">Klient</label>
          <div className="flex gap-2">
            <select className="input flex-1" value={form.clientId} onChange={set("clientId")}>
              <option value="">— Vyberte klienta —</option>
              {clientList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="button" onClick={() => setShowNewClient(true)}
              className="btn-secondary flex items-center gap-1.5 h-[42px] px-3 shrink-0">
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Datum vystavení</label>
            <DatePicker value={form.issueDate} onChange={(v) => setForm((f) => ({ ...f, issueDate: v }))} />
          </div>
          <div>
            <label className="label">Platnost do</label>
            <DatePicker value={form.validUntil} onChange={(v) => setForm((f) => ({ ...f, validUntil: v }))} />
          </div>
          <div>
            <label className="label">Měna</label>
            <select className="input" value={form.currency} onChange={set("currency")}>
              <option>CZK</option><option>EUR</option>
            </select>
          </div>
          <div>
            <label className="label">Jazyk</label>
            <select className="input" value={form.language} onChange={set("language")}>
              <option value="cs">Čeština</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="sk">Slovenčina</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Text před položkami</label>
          <textarea className="input resize-none" rows={2} value={form.noteBeforeItems} onChange={set("noteBeforeItems")}
            placeholder="Dovolujeme si Vám předložit nabídku na..." />
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
                    placeholder="Název položky / služby" />
                </div>
                <button type="button" onClick={() => setItems((p) => p.filter((_, j) => j !== i))}
                  className="mt-6 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
                    onChange={(e) => setItems((p) => p.map((x, j) => j === i ? { ...x, unit: e.target.value } : x))} placeholder="ks" />
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
                <span>Základ: <strong>{fmt(calc.base)}</strong></span>
                {isVatPayer && <span>DPH: <strong>{fmt(calc.vat)}</strong></span>}
                <span>Celkem: <strong className="text-indigo-700">{fmt(calc.total)}</strong></span>
              </div>
            </div>
          );
        })}

        <button type="button"
          onClick={() => setItems((p) => [...p, { name: "", quantity: 1, unit: "ks", unitPrice: 0, vatRate: isVatPayer ? 21 : 0 }])}
          className="btn-secondary w-full flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Přidat položku
        </button>

        <div className="border-t border-slate-200 pt-4 flex justify-between font-bold text-lg text-slate-900">
          <span>CELKEM</span><span className="text-indigo-700">{fmt(total)}</span>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <div>
          <label className="label">Patička nabídky</label>
          <textarea className="input resize-none" rows={2} value={form.footerText} onChange={set("footerText")} />
        </div>
        <div>
          <label className="label">Poznámka (interní)</label>
          <textarea className="input resize-none" rows={2} value={form.note} onChange={set("note")} />
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="flex gap-3">
        <button type="button" onClick={() => save(false)} disabled={loading}
          className="btn-secondary flex-1 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Uložit koncept
        </button>
        <button type="button" onClick={() => save(true)} disabled={loading}
          className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Odeslat nabídku
        </button>
      </div>

      {showNewClient && (
        <NewClientModal
          onClose={() => setShowNewClient(false)}
          onCreated={(c) => { setClientList((p) => [...p, c].sort((a, b) => a.name.localeCompare(b.name))); setForm((f) => ({ ...f, clientId: c.id })); setShowNewClient(false); }}
        />
      )}
    </div>
  );
}

"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Save, Send, Eye, Download, ExternalLink, UserPlus, ChevronDown, ChevronUp, Tag, X } from "lucide-react";
import DatePicker from "./DatePicker";
import ValidationWarnings from "./ValidationWarnings";
import InvoicePreview from "./InvoicePreview";
import NewClientModal from "./NewClientModal";
import { validateInvoice } from "@/lib/invoice-validator";

interface Client {
  id: string;
  name: string;
  ico?: string;
  dic?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  email?: string;
}

interface Company {
  id: string;
  name: string;
  ico?: string;
  dic?: string;
  address?: string;
  city?: string;
  zip?: string;
  bank_account?: string;
  iban?: string;
  swift?: string;
  logo_url?: string;
  vat_status: string;
  default_currency: string;
  invoice_prefix: string;
  default_language?: string;
  invoice_footer?: string;
}

interface BankAccount { id: string; name: string; bank_account?: string; iban?: string; currency: string; is_default: boolean; }
interface TagItem { id: string; name: string; color: string; }

interface Item {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
}

interface Props {
  company: Company;
  clients: Client[];
  defaultClientId?: string;
  defaultIssueDate: string;
  defaultDueDate: string;
  invoice?: {
    id: string;
    clientId?: string;
    type: string;
    currency: string;
    issueDate: string;
    dueDate: string;
    taxableDate?: string;
    note?: string;
    variableSymbol?: string;
    paymentMethod?: string;
    orderNumber?: string;
    noteBeforeItems?: string;
    footerText?: string;
    language?: string;
    reverseCharge?: boolean;
    discountPct?: number;
    discountAmount?: number;
    showAlreadyPaid?: boolean;
    showIban?: string;
    bankAccountId?: string;
    tagIds?: string[];
    items: Item[];
  };
}

const INVOICE_TYPE_TABS = [
  { value: "invoice", label: "Faktura" },
  { value: "proforma", label: "Proforma" },
  { value: "advance", label: "Záloha" },
];

const INVOICE_TYPES = [
  { value: "invoice", label: "Faktura" },
  { value: "proforma", label: "Proforma faktura" },
  { value: "advance", label: "Zálohová faktura" },
  { value: "credit_note", label: "Dobropis" },
  { value: "tax_document", label: "Daňový doklad" },
];

const LANGUAGES = [
  { value: "cs", label: "Čeština" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "sk", label: "Slovenčina" },
];

const VAT_RATES = [0, 12, 21];

export default function InvoiceForm({ company, clients, defaultClientId, defaultIssueDate, defaultDueDate, invoice }: Props) {
  const router = useRouter();
  const isVatPayer = company.vat_status === "vat_payer";

  const [form, setForm] = useState({
    clientId: invoice?.clientId ?? defaultClientId ?? "",
    type: invoice?.type ?? "invoice",
    currency: invoice?.currency ?? company.default_currency ?? "CZK",
    issueDate: invoice?.issueDate ?? defaultIssueDate,
    dueDate: invoice?.dueDate ?? defaultDueDate,
    taxableDate: invoice?.taxableDate ?? "",
    note: invoice?.note ?? "",
    variableSymbol: invoice?.variableSymbol ?? "",
    paymentMethod: invoice?.paymentMethod ?? "bank",
    orderNumber: invoice?.orderNumber ?? "",
    noteBeforeItems: invoice?.noteBeforeItems ?? "",
    footerText: invoice?.footerText ?? company.invoice_footer ?? "",
    language: invoice?.language ?? company.default_language ?? "cs",
    reverseCharge: invoice?.reverseCharge ?? false,
    discountPct: invoice?.discountPct ?? 0,
    discountAmount: invoice?.discountAmount ?? 0,
    showAlreadyPaid: invoice?.showAlreadyPaid ?? false,
    showIban: invoice?.showIban ?? "auto",
    bankAccountId: invoice?.bankAccountId ?? "",
  });

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(invoice?.tagIds ?? []);
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    fetch("/api/tags").then((r) => r.json()).then((data) => Array.isArray(data) && setAllTags(data));
    fetch("/api/settings/bank-accounts").then((r) => r.json()).then((data) => Array.isArray(data) && setBankAccounts(data));
  }, []);

  const [items, setItems] = useState<Item[]>(
    invoice?.items?.length
      ? invoice.items.map((i) => ({ ...i, unit: i.unit ?? "" }))
      : [{ name: "", quantity: 1, unit: "ks", unitPrice: 0, vatRate: isVatPayer ? 21 : 0 }]
  );

  const validationRef = useRef<HTMLDivElement>(null);
  const [clientList, setClientList] = useState<Client[]>(clients);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [showMore, setShowMore] = useState(
    !!(invoice?.orderNumber || invoice?.variableSymbol || invoice?.noteBeforeItems || invoice?.footerText || invoice?.note)
  );

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const setItem = (i: number, k: keyof Item) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = ["quantity", "unitPrice", "vatRate"].includes(k) ? parseFloat(e.target.value) || 0 : e.target.value;
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [k]: val } : item));
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

  const subtotal = items.reduce((s, i) => s + calcItem(i).base, 0);
  const vatTotal = items.reduce((s, i) => s + calcItem(i).vat, 0);
  const grossTotal = Math.round((subtotal + vatTotal) * 100) / 100;
  const discountValue = form.discountPct > 0
    ? Math.round(grossTotal * (form.discountPct / 100) * 100) / 100
    : form.discountAmount > 0 ? form.discountAmount : 0;
  const total = Math.round((grossTotal - discountValue) * 100) / 100;

  function handleClientCreated(client: Client) {
    setClientList((prev) => [...prev, client].sort((a, b) => a.name.localeCompare(b.name)));
    setForm((f) => ({ ...f, clientId: client.id }));
    setShowNewClientModal(false);
  }

  const selectedClient = clientList.find((c) => c.id === form.clientId);

  const validation = validateInvoice({
    type: form.type,
    number: invoice?.id ? undefined : "auto",
    supplierName: company.name,
    supplierIco: company.ico,
    supplierDic: company.dic,
    supplierAddress: company.address,
    supplierCity: company.city,
    supplierBankAccount: company.bank_account,
    clientName: selectedClient?.name,
    clientAddress: selectedClient?.address,
    clientDic: selectedClient?.dic,
    issueDate: form.issueDate,
    dueDate: form.dueDate,
    taxableDate: form.taxableDate,
    vatStatus: company.vat_status,
    variableSymbol: form.variableSymbol,
    invoicePrefix: company.invoice_prefix,
    items: items.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice, vatRate: i.vatRate })),
  });

  async function saveInvoice() {
    const url = invoice?.id ? `/api/invoices/${invoice.id}` : "/api/invoices";
    const method = invoice?.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        clientId: form.clientId || null,
        bankAccountId: form.bankAccountId || null,
        tagIds: selectedTagIds,
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
      throw new Error(d.error ?? "Chyba při ukládání");
    }
    return res.json();
  }

  function scrollToTop() {
    setTimeout(() => validationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  async function handleAction(action: "draft" | "send" | "pdf" | "online") {
    if (action === "send" || action === "pdf" || action === "online") {
      setShowValidation(true);
      if (!validation.isValid) {
        scrollToTop();
        return;
      }
    }
    if (action === "draft") {
      scrollToTop();
    }
    setLoading(true);
    setError("");
    try {
      const inv = await saveInvoice();

      if (action === "send") {
        await fetch(`/api/invoices/${inv.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "sent" }),
        });
        router.push(`/dashboard/invoices/${inv.id}`);
      } else if (action === "pdf") {
        window.open(`/api/invoices/${inv.id}/pdf`, "_blank");
        router.push(`/dashboard/invoices/${inv.id}`);
      } else if (action === "online") {
        window.open(`/invoice/${inv.public_token}`, "_blank");
        router.push(`/dashboard/invoices/${inv.id}`);
      } else {
        router.push(`/dashboard/invoices/${inv.id}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chyba při ukládání");
    } finally {
      setLoading(false);
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: form.currency, minimumFractionDigits: 2 }).format(n);

  return (
    <div className="grid xl:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-4">
        <div ref={validationRef}>
          {showValidation && <ValidationWarnings errors={validation.errors} warnings={validation.warnings} />}
        </div>

        <div className="card p-5 space-y-4">
          {/* Type tab switcher */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            {INVOICE_TYPE_TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  form.type === t.value ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
            <select
              className={`text-sm font-medium rounded-lg px-2 transition-all border-0 bg-transparent ${
                ["credit_note","tax_document"].includes(form.type) ? "text-slate-900 bg-white shadow" : "text-slate-500"
              }`}
              value={["credit_note","tax_document"].includes(form.type) ? form.type : ""}
              onChange={(e) => e.target.value && setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="">Více ▾</option>
              <option value="credit_note">Dobropis</option>
              <option value="tax_document">Daňový doklad</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Měna</label>
              <select className="input" value={form.currency} onChange={set("currency")}>
                <option>CZK</option>
                <option>EUR</option>
                <option>USD</option>
                <option>GBP</option>
              </select>
            </div>
            <div>
              <label className="label">Jazyk faktury</label>
              <select className="input" value={form.language} onChange={set("language")}>
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <label className="label flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Štítky</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {allTags.map((tag) => {
                  const selected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSelectedTagIds((p) => selected ? p.filter((id) => id !== tag.id) : [...p, tag.id])}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                        selected ? "text-white border-transparent" : "bg-white border-slate-200 text-slate-600"
                      }`}
                      style={selected ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
                    >
                      {selected && <X className="w-3 h-3 inline mr-1" />}{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="label">Klient</label>
            <div className="flex gap-2">
              <select className="input flex-1" value={form.clientId} onChange={set("clientId")}>
                <option value="">— Vyberte klienta —</option>
                {clientList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewClientModal(true)}
                className="btn-secondary flex items-center gap-1.5 h-[42px] px-3 shrink-0"
                title="Přidat nového klienta"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Nový</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Datum vystavení</label>
              <DatePicker value={form.issueDate} onChange={(v) => setForm((f) => ({ ...f, issueDate: v }))} />
            </div>
            <div>
              <label className="label">Datum splatnosti</label>
              <DatePicker value={form.dueDate} onChange={(v) => setForm((f) => ({ ...f, dueDate: v }))} />
            </div>
          </div>

          <div>
            <label className="label">DUZP (datum zdanitelného plnění)</label>
            <DatePicker value={form.taxableDate} onChange={(v) => setForm((f) => ({ ...f, taxableDate: v }))} />
            {!isVatPayer && (
              <p className="text-xs text-slate-400 mt-1">Relevantní pro plátce DPH.</p>
            )}
          </div>

          <div>
            <label className="label">Způsob platby</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                { value: "bank", label: "Bankou" },
                { value: "card", label: "Kartou" },
                { value: "cash", label: "Hotově" },
                { value: "cod", label: "Dobírka" },
                { value: "other", label: "Jinak" },
              ].map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, paymentMethod: m.value }))}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    form.paymentMethod === m.value
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Další možnosti toggle */}
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showMore ? "Skrýt možnosti" : "Další možnosti"}
          </button>

          {showMore && (
            <div className="space-y-4 pt-1 border-t border-slate-100">
              {bankAccounts.length > 0 && (
                <div>
                  <label className="label">Bankovní účet</label>
                  <select className="input" value={form.bankAccountId} onChange={set("bankAccountId")}>
                    <option value="">Výchozí bankovní účet</option>
                    {bankAccounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} — {a.bank_account ?? a.iban ?? ""} ({a.currency})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="label mb-2 block">Zobrazit IBAN</label>
                <div className="flex gap-2">
                  {[{ value: "auto", label: "Automaticky" }, { value: "always", label: "Vždy" }, { value: "never", label: "Nikdy" }].map((o) => (
                    <button key={o.value} type="button"
                      onClick={() => setForm((f) => ({ ...f, showIban: o.value }))}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                        form.showIban === o.value ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}>{o.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Variabilní symbol</label>
                <input className="input" value={form.variableSymbol} onChange={set("variableSymbol")} placeholder="Bude doplněno automaticky" />
              </div>
              <div>
                <label className="label">Číslo objednávky</label>
                <input className="input" value={form.orderNumber} onChange={set("orderNumber")} placeholder="OP-2024-001" />
              </div>

              {isVatPayer && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <button type="button"
                    onClick={() => setForm((f) => ({ ...f, reverseCharge: !f.reverseCharge }))}
                    className={`relative w-10 h-6 rounded-full transition-colors ${form.reverseCharge ? "bg-indigo-600" : "bg-slate-200"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.reverseCharge ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <div>
                    <span className="text-sm font-medium text-slate-700">Přenesená daňová povinnost</span>
                    <p className="text-xs text-slate-400">Zákazník odvádí DPH sám (§ 92a ZDPH)</p>
                  </div>
                </label>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <button type="button"
                  onClick={() => setForm((f) => ({ ...f, showAlreadyPaid: !f.showAlreadyPaid }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.showAlreadyPaid ? "bg-indigo-600" : "bg-slate-200"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.showAlreadyPaid ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm font-medium text-slate-700">Zobrazit „Neplatte, již uhrazeno"</span>
              </label>

              <div>
                <label className="label">Text před položkami</label>
                <textarea className="input resize-none" rows={2} value={form.noteBeforeItems} onChange={set("noteBeforeItems")}
                  placeholder="Dobrý den, fakturujeme vám následující položky..." />
              </div>
              <div>
                <label className="label">Patička faktury</label>
                <textarea className="input resize-none" rows={2} value={form.footerText} onChange={set("footerText")}
                  placeholder="Faktura byla vystavena elektronicky..." />
              </div>
              <div>
                <label className="label">Poznámka (interní)</label>
                <textarea className="input resize-none" rows={3} value={form.note} onChange={set("note")}
                  placeholder="Nepovinná poznámka k faktuře..." />
              </div>
            </div>
          )}
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

                <div className="flex justify-end gap-4 text-sm text-slate-500">
                  <span>Základ: <strong className="text-slate-800">{fmt(calc.base)}</strong></span>
                  {isVatPayer && <span>DPH: <strong className="text-slate-800">{fmt(calc.vat)}</strong></span>}
                  <span>Celkem: <strong className="text-indigo-700">{fmt(calc.total)}</strong></span>
                </div>
              </div>
            );
          })}

          <button type="button" onClick={addItem} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Přidat položku
          </button>

          {/* Sleva */}
          <div className="border border-dashed border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Sleva</label>
              <div className="flex gap-1">
                <button type="button"
                  onClick={() => setForm((f) => ({ ...f, discountPct: 0, discountAmount: 0 }))}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${form.discountPct === 0 && form.discountAmount === 0 ? "bg-slate-200 text-slate-700" : "text-slate-400 hover:text-slate-600"}`}>Žádná</button>
                <button type="button"
                  onClick={() => setForm((f) => ({ ...f, discountAmount: 0, discountPct: f.discountPct || 5 }))}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${form.discountPct > 0 ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600"}`}>%</button>
                <button type="button"
                  onClick={() => setForm((f) => ({ ...f, discountPct: 0, discountAmount: f.discountAmount || 100 }))}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${form.discountAmount > 0 ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600"}`}>{form.currency}</button>
              </div>
            </div>
            {form.discountPct > 0 && (
              <div className="flex items-center gap-2">
                <input type="number" min={0} max={100} step={1} className="input w-24"
                  value={form.discountPct}
                  onChange={(e) => setForm((f) => ({ ...f, discountPct: parseFloat(e.target.value) || 0 }))} />
                <span className="text-sm text-slate-500">% = {fmt(discountValue)} sleva</span>
              </div>
            )}
            {form.discountAmount > 0 && (
              <div className="flex items-center gap-2">
                <input type="number" min={0} step={1} className="input w-32"
                  value={form.discountAmount}
                  onChange={(e) => setForm((f) => ({ ...f, discountAmount: parseFloat(e.target.value) || 0 }))} />
                <span className="text-sm text-slate-500">sleva {fmt(discountValue)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-1 text-sm">
            {isVatPayer && (() => {
              const byRate = new Map<number, { base: number; vat: number }>();
              items.forEach((item) => {
                const { base, vat } = calcItem(item);
                const existing = byRate.get(item.vatRate) ?? { base: 0, vat: 0 };
                byRate.set(item.vatRate, { base: existing.base + base, vat: existing.vat + vat });
              });
              return Array.from(byRate.entries()).sort((a, b) => b[0] - a[0]).map(([rate, { base, vat }]) => (
                <div key={rate}>
                  <div className="flex justify-between text-slate-500">
                    <span>Základ DPH {rate} %</span><span>{fmt(base)}</span>
                  </div>
                  {rate > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>DPH {rate} %</span><span>{fmt(vat)}</span>
                    </div>
                  )}
                </div>
              ));
            })()}
            {discountValue > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Sleva {form.discountPct > 0 ? `(${form.discountPct} %)` : ""}</span>
                <span>−{fmt(discountValue)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-slate-900 pt-2">
              <span>CELKEM</span><span className="text-indigo-700">{fmt(total)}</span>
            </div>
          </div>
        </div>


        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleAction("draft")}
            disabled={loading}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Uložit koncept
          </button>
          <button
            type="button"
            onClick={() => handleAction("send")}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Odeslat fakturu
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleAction("pdf")}
            disabled={loading}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Stáhnout PDF
          </button>
          <button
            type="button"
            onClick={() => handleAction("online")}
            disabled={loading}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> Otevřít online fakturu
          </button>
        </div>
      </div>

      {showNewClientModal && (
        <NewClientModal
          onClose={() => setShowNewClientModal(false)}
          onCreated={handleClientCreated}
        />
      )}

      {/* Preview */}
      <div className="hidden xl:block">
        <div className="sticky top-6">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Náhled</h2>
          </div>
          <InvoicePreview
            company={company}
            client={selectedClient}
            form={form}
            items={items}
            subtotal={subtotal}
            vatTotal={vatTotal}
            total={total}
            isVatPayer={isVatPayer}
          />
        </div>
      </div>
    </div>
  );
}

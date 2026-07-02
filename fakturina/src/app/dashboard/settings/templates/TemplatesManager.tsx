"use client";
import { useState } from "react";
import { Plus, Trash2, Copy, Loader2, FileText } from "lucide-react";

interface TemplateItem {
  name: string; quantity: number; unit: string; unit_price: number; vat_rate: number;
}
interface Template {
  id: string; name: string; currency: string; language: string;
  note?: string; payment_method?: string; items: TemplateItem[];
}

export default function TemplatesManager({ initialTemplates }: { initialTemplates: Template[] }) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", currency: "CZK", language: "cs", note: "", paymentMethod: "bank",
    footerText: "", noteBeforeItems: "",
  });
  const [items, setItems] = useState([{ name: "", quantity: 1, unit: "ks", unitPrice: 0, vatRate: 0 }]);

  const setItem = (i: number, k: string, v: string | number) =>
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  async function handleCreate() {
    setLoading(true);
    const res = await fetch("/api/invoice-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });
    if (res.ok) {
      const t = await res.json();
      setTemplates((p) => [t, ...p]);
      setShowForm(false);
      setForm({ name: "", currency: "CZK", language: "cs", note: "", paymentMethod: "bank", footerText: "", noteBeforeItems: "" });
      setItems([{ name: "", quantity: 1, unit: "ks", unitPrice: 0, vatRate: 0 }]);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Smazat tuto šablonu?")) return;
    await fetch(`/api/invoice-templates/${id}`, { method: "DELETE" });
    setTemplates((p) => p.filter((t) => t.id !== id));
  }

  function handleUseTemplate(t: Template) {
    window.location.href = `/dashboard/invoices/new?template=${t.id}`;
  }

  return (
    <div className="space-y-4">
      {templates.length === 0 && !showForm && (
        <div className="card p-10 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-4">Žádné šablony. Vytvořte první pro rychlé vystavování faktur.</p>
        </div>
      )}

      {templates.map((t) => (
        <div key={t.id} className="card p-4 flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900">{t.name}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {t.currency} · {t.items?.length ?? 0} položek
              {t.note && ` · ${t.note.slice(0, 60)}...`}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => handleUseTemplate(t)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors">
              <Copy className="w-3.5 h-3.5" /> Použít
            </button>
            <button onClick={() => handleDelete(t.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {showForm ? (
        <div className="card p-5 space-y-4 border-2 border-indigo-200">
          <h3 className="font-semibold text-slate-900">Nová šablona faktury</h3>
          <div>
            <label className="label">Název šablony</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Např. Konzultace hodinová sazba" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Měna</label>
              <select className="input" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
                <option>CZK</option><option>EUR</option><option>USD</option>
              </select>
            </div>
            <div>
              <label className="label">Způsob platby</label>
              <select className="input" value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}>
                <option value="bank">Bankou</option>
                <option value="cash">Hotově</option>
                <option value="card">Kartou</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Položky</label>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-end">
                  <div className="col-span-2">
                    <input className="input text-sm" placeholder="Název položky" value={item.name}
                      onChange={(e) => setItem(i, "name", e.target.value)} />
                  </div>
                  <div>
                    <input className="input text-sm" type="number" placeholder="Cena" value={item.unitPrice}
                      onChange={(e) => setItem(i, "unitPrice", parseFloat(e.target.value) || 0)} />
                  </div>
                  <button type="button" onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-red-500 h-[42px] flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setItems((p) => [...p, { name: "", quantity: 1, unit: "ks", unitPrice: 0, vatRate: 0 }])}
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mt-1">
                <Plus className="w-3.5 h-3.5" /> Přidat položku
              </button>
            </div>
          </div>
          <div>
            <label className="label">Poznámka / interní popis</label>
            <input className="input" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Volitelný popis šablony" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!form.name || loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Vytvořit šablonu
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Zrušit</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-secondary w-full flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Nová šablona
        </button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Search, Trash2, Pencil, ShieldCheck, ShieldAlert, Users, ChevronDown } from "lucide-react";
import { useApi, apiPost, apiPatch, apiDelete } from "@/lib/useApi";

type Person = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: string;
  company: string | null;
  address: string | null;
  note: string | null;
  gdprConsent: boolean;
  createdAt: string;
  _count: { deals: number; demands: number; tasks: number };
};

const TYPE_MAP: Record<string, { label: string; className: string }> = {
  CLIENT: { label: "Klient", className: "bg-emerald-500/10 text-emerald-400" },
  PROSPECT: { label: "Zajemce", className: "bg-amber-500/10 text-amber-400" },
  OWNER: { label: "Majitel", className: "bg-blue-500/10 text-blue-400" },
  PARTNER: { label: "Partner", className: "bg-violet-500/10 text-violet-400" },
};

const inputClass = "h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30";
const selectClass = "h-10 w-full cursor-pointer appearance-none rounded-xl border border-[var(--a-border)] bg-transparent px-4 pr-10 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 focus:border-[var(--a-bronze)]/30";

const EMPTY_FORM = { name: "", email: "", phone: "", type: "CLIENT", company: "", address: "", note: "", gdprConsent: false };

export default function AdresarPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const query = new URLSearchParams();
  if (typeFilter) query.set("type", typeFilter);
  if (search) query.set("q", search);
  const { data, loading, refetch } = useApi<Person[]>(`/api/admin/persons?${query.toString()}`);
  const persons = data || [];

  function openNew() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setModal(true);
  }

  function openEdit(p: Person) {
    setEditId(p.id);
    setForm({
      name: p.name, email: p.email || "", phone: p.phone || "", type: p.type,
      company: p.company || "", address: p.address || "", note: p.note || "", gdprConsent: p.gdprConsent,
    });
    setModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { alert("Vyplnte jmeno"); return; }
    setSaving(true);
    const { error } = editId
      ? await apiPatch(`/api/admin/persons/${editId}`, form)
      : await apiPost("/api/admin/persons", form);
    setSaving(false);
    if (error) { alert("Chyba: " + error); return; }
    setModal(false);
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Opravdu smazat kontakt vcetne vazeb?")) return;
    await apiDelete(`/api/admin/persons/${id}`);
    refetch();
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">Adresar</h2>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Evidence klientu, zajemcu a majitelu s GDPR souhlasy</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl"
        >
          <Plus size={14} /> Novy kontakt
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-[320px]">
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
          <input
            type="text"
            className={`${inputClass} pl-10`}
            placeholder="Hledat jmeno, e-mail, telefon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {[["", "Vse"], ...Object.entries(TYPE_MAP).map(([k, v]) => [k, v.label])].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setTypeFilter(val)}
              className={`rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold transition-all duration-300 ${
                typeFilter === val
                  ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]"
                  : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
        </div>
      ) : persons.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <Users size={28} className="text-[var(--a-text-3)]" />
          <p className="mt-3 text-[14px] font-semibold text-[var(--a-text)]">Zadne kontakty</p>
          <p className="mt-1 text-[12px] text-[var(--a-text-3)]">Pridejte prvni kontakt do adresare</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--a-border)]">
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Jmeno</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Typ</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Kontakt</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Vazby</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">GDPR</th>
                  <th className="w-24 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--a-border)]">
                {persons.map((p) => {
                  const t = TYPE_MAP[p.type] || TYPE_MAP.CLIENT;
                  return (
                    <tr key={p.id} className="hover-row transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-semibold text-[var(--a-text)]">{p.name}</p>
                        {p.company && <p className="text-[10.5px] text-[var(--a-text-3)]">{p.company}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${t.className}`}>{t.label}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[12px] text-[var(--a-text-2)]">{p.email || "-"}</p>
                        <p className="text-[11px] text-[var(--a-text-3)]">{p.phone || ""}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[11.5px] text-[var(--a-text-3)]">
                        {p._count.deals} pripadu &middot; {p._count.demands} poptavek &middot; {p._count.tasks} ukolu
                      </td>
                      <td className="px-5 py-3.5">
                        {p.gdprConsent ? (
                          <span className="flex items-center gap-1.5 text-[11.5px] text-emerald-400"><ShieldCheck size={13} /> Souhlas</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[11.5px] text-amber-400"><ShieldAlert size={13} /> Chybi</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => openEdit(p)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--a-text-3)] transition-all hover:bg-[var(--a-surface-2)] hover:text-[var(--a-text)]" title="Upravit">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--a-text-3)] transition-all hover:bg-red-500/10 hover:text-red-400" title="Smazat">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-[520px] rounded-2xl border border-[var(--a-border)] bg-[var(--a-surface)] p-6 shadow-2xl">
            <h3 className="text-[17px] font-semibold text-[var(--a-text)]">{editId ? "Upravit kontakt" : "Novy kontakt"}</h3>
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input type="text" className={inputClass} placeholder="Jmeno a prijmeni *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <div className="relative">
                  <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input type="email" className={inputClass} placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input type="tel" className={inputClass} placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input type="text" className={inputClass} placeholder="Firma" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                <input type="text" className={inputClass} placeholder="Adresa" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 py-3 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30"
                placeholder="Poznamka..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--a-border)] px-4 py-3 transition-all duration-300 hover:border-[var(--a-border-hover)]">
                <span className="text-[12.5px] font-semibold text-[var(--a-text)]">Souhlas se zpracovanim osobnich udaju (GDPR)</span>
                <input type="checkbox" className="h-4 w-4 cursor-pointer rounded accent-[var(--a-bronze)]" checked={form.gdprConsent} onChange={(e) => setForm({ ...form, gdprConsent: e.target.checked })} />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="rounded-xl border border-[var(--a-border)] px-5 py-2.5 text-[12px] font-semibold text-[var(--a-text-2)] transition-all hover:border-[var(--a-border-hover)]">
                Zrusit
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] transition-all hover:shadow-lg disabled:opacity-50"
              >
                {saving ? "Ukladam..." : "Ulozit"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

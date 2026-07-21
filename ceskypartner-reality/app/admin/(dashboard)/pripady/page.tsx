"use client";

import { useState } from "react";
import { Plus, Trash2, Briefcase, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useApi, apiPost, apiPatch, apiDelete } from "@/lib/useApi";

type Deal = {
  id: string;
  title: string;
  stage: string;
  dealType: string;
  price: number | null;
  commission: number | null;
  note: string | null;
  closedAt: string | null;
  createdAt: string;
  listing: { id: string; title: string; location: string; price: number } | null;
  client: { id: string; name: string; phone: string | null; email: string | null } | null;
  agent: { id: string; name: string } | null;
  _count: { tasks: number; documents: number };
};

type Listing = { id: string; title: string };
type Person = { id: string; name: string };

const STAGES: { key: string; label: string; accent: string }[] = [
  { key: "LEAD", label: "Lead", accent: "text-[var(--a-text-3)]" },
  { key: "VIEWING", label: "Prohlidky", accent: "text-blue-400" },
  { key: "OFFER", label: "Nabidka", accent: "text-amber-400" },
  { key: "RESERVATION", label: "Rezervace", accent: "text-orange-400" },
  { key: "CONTRACT", label: "Smlouva", accent: "text-violet-400" },
  { key: "CLOSED", label: "Uzavreno", accent: "text-emerald-400" },
  { key: "LOST", label: "Ztraceno", accent: "text-red-400" },
];

const inputClass = "h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30";
const selectClass = "h-10 w-full cursor-pointer appearance-none rounded-xl border border-[var(--a-border)] bg-transparent px-4 pr-10 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 focus:border-[var(--a-bronze)]/30";

const fmtPrice = (n: number | null) => (n ? n.toLocaleString("cs-CZ") + " Kc" : "-");

const EMPTY_FORM = { title: "", stage: "LEAD", dealType: "SALE", price: "", commission: "", note: "", listingId: "", clientId: "" };

export default function PripadyPage() {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const { data, loading, refetch } = useApi<Deal[]>("/api/admin/deals");
  const { data: listingsData } = useApi<{ listings: Listing[] }>("/api/admin/listings?limit=50");
  const { data: personsData } = useApi<Person[]>("/api/admin/persons");
  const deals = data || [];

  function openNew() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setModal(true);
  }

  function openEdit(d: Deal) {
    setEditId(d.id);
    setForm({
      title: d.title, stage: d.stage, dealType: d.dealType,
      price: d.price ? String(d.price) : "", commission: d.commission ? String(d.commission) : "",
      note: d.note || "", listingId: d.listing?.id || "", clientId: d.client?.id || "",
    });
    setModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { alert("Vyplnte nazev pripadu"); return; }
    setSaving(true);
    const { error } = editId
      ? await apiPatch(`/api/admin/deals/${editId}`, form)
      : await apiPost("/api/admin/deals", form);
    setSaving(false);
    if (error) { alert("Chyba: " + error); return; }
    setModal(false);
    refetch();
  }

  async function moveStage(d: Deal, dir: 1 | -1) {
    const idx = STAGES.findIndex((s) => s.key === d.stage);
    const next = STAGES[idx + dir];
    if (!next) return;
    await apiPatch(`/api/admin/deals/${d.id}`, { stage: next.key });
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Opravdu smazat obchodni pripad?")) return;
    await apiDelete(`/api/admin/deals/${id}`);
    refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">Obchodni pripady</h2>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Pipeline zakazek od leadu po uzavreni</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl"
        >
          <Plus size={14} /> Novy pripad
        </button>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-[1400px] gap-3">
            {STAGES.map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage.key);
              const sum = stageDeals.reduce((s, d) => s + (d.commission || 0), 0);
              return (
                <div key={stage.key} className="w-[200px] shrink-0">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className={`text-[11px] font-semibold uppercase tracking-[0.1em] ${stage.accent}`}>{stage.label}</span>
                    <span className="text-[11px] text-[var(--a-text-3)]">{stageDeals.length}</span>
                  </div>
                  {sum > 0 && <p className="mb-2 px-1 text-[10px] text-[var(--a-text-3)]">Provize: {fmtPrice(sum)}</p>}
                  <div className="space-y-2">
                    {stageDeals.map((d) => (
                      <div key={d.id} className="glass-card group rounded-xl p-3">
                        <button type="button" onClick={() => openEdit(d)} className="block w-full text-left">
                          <p className="text-[12.5px] font-semibold leading-snug text-[var(--a-text)]">{d.title}</p>
                          {d.listing && <p className="mt-1 truncate text-[10.5px] text-[var(--a-text-3)]">{d.listing.title}</p>}
                          {d.client && <p className="mt-0.5 text-[10.5px] text-[var(--a-text-2)]">{d.client.name}</p>}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[var(--a-bronze)]">{fmtPrice(d.price)}</span>
                            {d.commission ? <span className="text-[10px] text-emerald-400">+{fmtPrice(d.commission)}</span> : null}
                          </div>
                        </button>
                        <div className="mt-2 flex items-center justify-between border-t border-[var(--a-border)] pt-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => moveStage(d, -1)} disabled={stage.key === "LEAD"} className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--a-text-3)] transition-colors hover:bg-[var(--a-surface-2)] hover:text-[var(--a-text)] disabled:opacity-30" title="Posunout zpet">
                            <ChevronLeft size={13} />
                          </button>
                          <button onClick={() => handleDelete(d.id)} className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--a-text-3)] transition-colors hover:bg-red-500/10 hover:text-red-400" title="Smazat">
                            <Trash2 size={11} />
                          </button>
                          <button onClick={() => moveStage(d, 1)} disabled={stage.key === "LOST"} className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--a-text-3)] transition-colors hover:bg-[var(--a-surface-2)] hover:text-[var(--a-text)] disabled:opacity-30" title="Posunout dal">
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-[var(--a-border)]">
                        <Briefcase size={14} className="text-[var(--a-text-3)] opacity-40" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="fixed inset-x-4 top-[8%] z-50 mx-auto max-w-[520px] rounded-2xl border border-[var(--a-border)] bg-[var(--a-surface)] p-6 shadow-2xl">
            <h3 className="text-[17px] font-semibold text-[var(--a-text)]">{editId ? "Upravit pripad" : "Novy obchodni pripad"}</h3>
            <div className="mt-5 space-y-4">
              <input type="text" className={inputClass} placeholder="Nazev pripadu *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <select className={selectClass} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                    {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
                <div className="relative">
                  <select className={selectClass} value={form.dealType} onChange={(e) => setForm({ ...form, dealType: e.target.value })}>
                    <option value="SALE">Prodej</option>
                    <option value="RENT">Pronajem</option>
                    <option value="INVESTMENT">Investice</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input type="number" className={inputClass} placeholder="Cena (Kc)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                <input type="number" className={inputClass} placeholder="Provize (Kc)" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} />
              </div>
              <div className="relative">
                <select className={selectClass} value={form.listingId} onChange={(e) => setForm({ ...form, listingId: e.target.value })}>
                  <option value="">Bez nemovitosti</option>
                  {(listingsData?.listings || []).map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
              </div>
              <div className="relative">
                <select className={selectClass} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                  <option value="">Bez klienta</option>
                  {(personsData || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
              </div>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 py-3 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30"
                placeholder="Poznamka..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="rounded-xl border border-[var(--a-border)] px-5 py-2.5 text-[12px] font-semibold text-[var(--a-text-2)] transition-all hover:border-[var(--a-border-hover)]">
                Zrusit
              </button>
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] transition-all hover:shadow-lg disabled:opacity-50">
                {saving ? "Ukladam..." : "Ulozit"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

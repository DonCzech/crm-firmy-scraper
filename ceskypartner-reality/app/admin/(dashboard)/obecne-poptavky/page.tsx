"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, ChevronDown, SearchCheck, Building2 } from "lucide-react";
import { useApi, apiPost, apiPatch, apiDelete, apiGet } from "@/lib/useApi";
import { REGION_OPTIONS } from "@/lib/regions";

type Demand = {
  id: string;
  title: string;
  deal: string;
  kind: string | null;
  region: string | null;
  district: string | null;
  dispositions: string[];
  priceMin: number | null;
  priceMax: number | null;
  areaMin: number | null;
  note: string | null;
  status: string;
  createdAt: string;
  person: { id: string; name: string; email: string | null; phone: string | null } | null;
};

type Match = {
  id: string;
  title: string;
  slug: string;
  price: number;
  location: string;
  disposition: string | null;
  area: number | null;
  images: { url: string }[];
};

type Person = { id: string; name: string };

const DEAL_LABELS: Record<string, string> = { SALE: "Prodej", RENT: "Pronajem", INVESTMENT: "Investice" };
const KIND_LABELS: Record<string, string> = { APARTMENT: "Byt", HOUSE: "Dum", LAND: "Pozemek", COMMERCIAL: "Komercni" };
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Aktivni", className: "bg-emerald-500/10 text-emerald-400" },
  MATCHED: { label: "Sparovano", className: "bg-blue-500/10 text-blue-400" },
  CLOSED: { label: "Uzavreno", className: "bg-[var(--a-surface-2)] text-[var(--a-text-3)]" },
};
const DISPOSITIONS = ["1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1", "4+kk", "4+1", "5+kk", "5+1"];

const inputClass = "h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30";
const selectClass = "h-10 w-full cursor-pointer appearance-none rounded-xl border border-[var(--a-border)] bg-transparent px-4 pr-10 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 focus:border-[var(--a-bronze)]/30";

const fmtPrice = (n: number | null) => (n ? n.toLocaleString("cs-CZ") + " Kc" : null);

const EMPTY_FORM = { title: "", deal: "SALE", kind: "", region: "", dispositions: [] as string[], priceMin: "", priceMax: "", areaMin: "", note: "", personId: "", status: "ACTIVE" };

export default function ObecnePoptavkyPage() {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);

  const { data, loading, refetch } = useApi<Demand[]>("/api/admin/demands");
  const { data: personsData } = useApi<Person[]>("/api/admin/persons");
  const demands = data || [];

  useEffect(() => {
    if (!selectedId) { setMatches(null); return; }
    setMatchesLoading(true);
    apiGet<{ matches: Match[] }>(`/api/admin/demands/${selectedId}`).then(({ data }) => {
      setMatches(data?.matches || []);
      setMatchesLoading(false);
    });
  }, [selectedId]);

  function openNew() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setModal(true);
  }

  function openEdit(d: Demand) {
    setEditId(d.id);
    setForm({
      title: d.title, deal: d.deal, kind: d.kind || "", region: d.region || "",
      dispositions: d.dispositions, priceMin: d.priceMin ? String(d.priceMin) : "",
      priceMax: d.priceMax ? String(d.priceMax) : "", areaMin: d.areaMin ? String(d.areaMin) : "",
      note: d.note || "", personId: d.person?.id || "", status: d.status,
    });
    setModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { alert("Vyplnte nazev poptavky"); return; }
    setSaving(true);
    const { error } = editId
      ? await apiPatch(`/api/admin/demands/${editId}`, form)
      : await apiPost("/api/admin/demands", form);
    setSaving(false);
    if (error) { alert("Chyba: " + error); return; }
    setModal(false);
    refetch();
    if (editId === selectedId) setSelectedId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Opravdu smazat poptavku?")) return;
    await apiDelete(`/api/admin/demands/${id}`);
    if (id === selectedId) setSelectedId(null);
    refetch();
  }

  function toggleDisposition(d: string) {
    setForm((f) => ({
      ...f,
      dispositions: f.dispositions.includes(d) ? f.dispositions.filter((x) => x !== d) : [...f.dispositions, d],
    }));
  }

  const selected = demands.find((d) => d.id === selectedId);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">Obecne poptavky</h2>
          <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Evidence poptavek a automaticke parovani s nabidkami</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl"
        >
          <Plus size={14} /> Nova poptavka
        </button>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-2.5">
            {demands.length === 0 && (
              <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
                <SearchCheck size={28} className="text-[var(--a-text-3)]" />
                <p className="mt-3 text-[14px] font-semibold text-[var(--a-text)]">Zadne poptavky</p>
              </div>
            )}
            {demands.map((d) => {
              const st = STATUS_MAP[d.status] || STATUS_MAP.ACTIVE;
              const regionLabel = REGION_OPTIONS.find((r) => r.value === d.region)?.label;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedId(d.id === selectedId ? null : d.id)}
                  className={`glass-card block w-full rounded-2xl p-4 text-left transition-all duration-300 ${selectedId === d.id ? "ring-1 ring-[var(--a-bronze)]/30" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--a-text)]">{d.title}</p>
                      <p className="mt-0.5 text-[11.5px] text-[var(--a-text-3)]">
                        {DEAL_LABELS[d.deal]}
                        {d.kind ? ` · ${KIND_LABELS[d.kind]}` : ""}
                        {regionLabel ? ` · ${regionLabel}` : ""}
                        {d.dispositions.length > 0 ? ` · ${d.dispositions.join(", ")}` : ""}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[var(--a-text-2)]">
                        {[fmtPrice(d.priceMin) && `od ${fmtPrice(d.priceMin)}`, fmtPrice(d.priceMax) && `do ${fmtPrice(d.priceMax)}`, d.areaMin && `min ${d.areaMin} m2`].filter(Boolean).join(" · ")}
                      </p>
                      {d.person && <p className="mt-1 text-[11px] text-[var(--a-bronze)]">{d.person.name}{d.person.phone ? ` · ${d.person.phone}` : ""}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${st.className}`}>{st.label}</span>
                      <span onClick={(e) => { e.stopPropagation(); openEdit(d); }} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-[var(--a-text-3)] transition-all hover:bg-[var(--a-surface-2)] hover:text-[var(--a-text)]"><Pencil size={12} /></span>
                      <span onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-[var(--a-text-3)] transition-all hover:bg-red-500/10 hover:text-red-400"><Trash2 size={12} /></span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Matches panel */}
          <div className="glass-card h-fit rounded-2xl p-5">
            <h3 className="text-[14px] font-semibold text-[var(--a-text)]">
              {selected ? `Odpovidajici nabidky` : "Parovani nabidek"}
            </h3>
            {!selected && <p className="mt-2 text-[12px] text-[var(--a-text-3)]">Vyberte poptavku vlevo a zobrazi se aktivni nemovitosti odpovidajici kriteriim.</p>}
            {selected && matchesLoading && (
              <div className="flex h-24 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
              </div>
            )}
            {selected && !matchesLoading && matches && matches.length === 0 && (
              <p className="mt-3 rounded-xl border border-dashed border-[var(--a-border)] py-6 text-center text-[12px] text-[var(--a-text-3)]">Zadna nabidka neodpovida kriteriim</p>
            )}
            {selected && !matchesLoading && matches && matches.length > 0 && (
              <div className="mt-3 space-y-2">
                {matches.map((m) => (
                  <Link key={m.id} href={`/admin/nemovitosti/${m.id}`} className="flex items-center gap-3 rounded-xl border border-[var(--a-border)] p-2.5 transition-all hover:border-[var(--a-border-hover)]">
                    {m.images[0] ? (
                      <img src={m.images[0].url} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--a-surface-2)]"><Building2 size={14} className="text-[var(--a-text-3)]" /></div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-[var(--a-text)]">{m.title}</p>
                      <p className="text-[10.5px] text-[var(--a-text-3)]">{m.location}{m.disposition ? ` · ${m.disposition}` : ""}{m.area ? ` · ${m.area} m2` : ""}</p>
                      <p className="text-[11px] font-semibold text-[var(--a-bronze)]">{m.price.toLocaleString("cs-CZ")} Kc</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {modal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="fixed inset-x-4 top-[6%] z-50 mx-auto max-w-[540px] rounded-2xl border border-[var(--a-border)] bg-[var(--a-surface)] p-6 shadow-2xl">
            <h3 className="text-[17px] font-semibold text-[var(--a-text)]">{editId ? "Upravit poptavku" : "Nova poptavka"}</h3>
            <div className="mt-5 max-h-[65vh] space-y-4 overflow-y-auto pr-1">
              <input type="text" className={inputClass} placeholder="Nazev poptavky * (napr. Hleda byt 2+kk Praha)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="relative">
                  <select className={selectClass} value={form.deal} onChange={(e) => setForm({ ...form, deal: e.target.value })}>
                    {Object.entries(DEAL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
                <div className="relative">
                  <select className={selectClass} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                    <option value="">Typ: vse</option>
                    {Object.entries(KIND_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
                <div className="relative">
                  <select className={selectClass} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                    <option value="">Kraj: vse</option>
                    {REGION_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DISPOSITIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDisposition(d)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${
                      form.dispositions.includes(d)
                        ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]"
                        : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <input type="number" className={inputClass} placeholder="Cena od (Kc)" value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} />
                <input type="number" className={inputClass} placeholder="Cena do (Kc)" value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} />
                <input type="number" className={inputClass} placeholder="Min plocha (m2)" value={form.areaMin} onChange={(e) => setForm({ ...form, areaMin: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <select className={selectClass} value={form.personId} onChange={(e) => setForm({ ...form, personId: e.target.value })}>
                    <option value="">Bez kontaktu</option>
                    {(personsData || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
                <div className="relative">
                  <select className={selectClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
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

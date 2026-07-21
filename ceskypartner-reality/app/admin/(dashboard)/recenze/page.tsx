"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { useApi, apiPost, apiPatch, apiDelete } from "@/lib/useApi";

type Testimonial = {
  id: string;
  name: string;
  context: string | null;
  quote: string;
  rating: number;
  published: boolean;
  createdAt: string;
};

const inputClass =
  "h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30";

export default function RecenzePage() {
  const { data, loading, refetch } = useApi<Testimonial[]>("/api/admin/testimonials");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);

  async function handleAdd() {
    if (!name || !quote) { alert("Vyplnte jmeno a text recenze"); return; }
    setSaving(true);
    const { error } = await apiPost("/api/admin/testimonials", { name, context, quote, rating, published: true });
    setSaving(false);
    if (error) { alert(error); return; }
    setShowAdd(false);
    setName(""); setContext(""); setQuote(""); setRating(5);
    refetch();
  }

  async function togglePublish(t: Testimonial) {
    await apiPatch(`/api/admin/testimonials/${t.id}`, { published: !t.published });
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Opravdu smazat recenzi?")) return;
    await apiDelete(`/api/admin/testimonials/${id}`);
    refetch();
  }

  const rows = data || [];

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[var(--a-text)]">Recenze klientu</h1>
          <p className="mt-1 text-[12px] text-[var(--a-text-3)]">Zobrazuji se na webu v sekci Reference a na strance Prodano.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-4 py-2 text-[12px] font-semibold text-[#0a0a0b] transition-all duration-300 hover:shadow-lg">
          <Plus size={13} /> Pridat recenzi
        </button>
      </div>

      {loading ? (
        <div className="flex h-24 items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--a-bronze)]" /></div>
      ) : rows.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-[13px] text-[var(--a-text-3)]">Zatim zadne recenze — pridejte prvni.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((t) => (
            <div key={t.id} className="glass-card flex items-start justify-between gap-6 rounded-2xl p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[14px] font-semibold text-[var(--a-text)]">{t.name}</p>
                  {t.context && <p className="text-[12px] text-[var(--a-text-3)]">{t.context}</p>}
                  <span className="flex items-center gap-0.5 text-[var(--a-bronze)]">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${t.published ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-[var(--a-text-3)]"}`}>
                    {t.published ? "Zverejneno" : "Skryto"}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--a-text-2)]">{t.quote}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => togglePublish(t)} title={t.published ? "Skryt" : "Zverejnit"} className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--a-text-3)] transition-colors hover:text-[var(--a-text)]">
                  {t.published ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => handleDelete(t.id)} title="Smazat" className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/70 transition-colors hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="glass-card w-full max-w-md rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[var(--a-text)]">Nova recenze</h3>
              <button onClick={() => setShowAdd(false)} className="text-[var(--a-text-3)] hover:text-[var(--a-text)]"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Jmeno klienta *" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              <input type="text" placeholder="Kontext (napr. Prodej bytu, Praha 2)" className={inputClass} value={context} onChange={(e) => setContext(e.target.value)} />
              <textarea rows={4} placeholder="Text recenze *" className="w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 py-3 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30" value={quote} onChange={(e) => setQuote(e.target.value)} />
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[var(--a-text-3)]">Hodnoceni:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)} className={n <= rating ? "text-[var(--a-bronze)]" : "text-[var(--a-text-3)]"}>
                    <Star size={16} fill={n <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <button onClick={handleAdd} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Ulozit recenzi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface TagItem { id: string; name: string; color: string; }

const PRESET_COLORS = [
  "#4f46e5", "#0891b2", "#059669", "#d97706", "#dc2626",
  "#7c3aed", "#db2777", "#65a30d", "#0369a1", "#92400e",
];

export default function TagsManager({ initialTags }: { initialTags: TagItem[] }) {
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", color: "#4f46e5" });

  async function handleAdd() {
    setLoading(true);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const tag = await res.json();
      setTags((p) => {
        const existing = p.find((t) => t.name === tag.name);
        return existing ? p.map((t) => t.name === tag.name ? tag : t) : [...p, tag];
      });
      setForm({ name: "", color: "#4f46e5" });
      setShowForm(false);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Smazat tento štítek?")) return;
    await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
    setTags((p) => p.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-4">
      {tags.length === 0 && !showForm && (
        <div className="card p-10 text-center">
          <p className="text-slate-400 text-sm mb-4">Žádné štítky. Přidejte první pro kategorizaci faktur.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: tag.color }}>
            <span>{tag.name}</span>
            <button onClick={() => handleDelete(tag.id)}
              className="opacity-70 hover:opacity-100 transition-opacity ml-1">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="card p-5 space-y-4 border-2 border-indigo-200">
          <h3 className="font-semibold text-slate-900">Nový štítek</h3>
          <div>
            <label className="label">Název štítku</label>
            <input className="input" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Např. Urgentní, Export, Projekt X" />
          </div>
          <div>
            <label className="label">Barva</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {PRESET_COLORS.map((c) => (
                <button key={c} type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-slate-900 scale-110" : ""}`}
                  style={{ backgroundColor: c }} />
              ))}
              <div className="flex items-center gap-2">
                <input type="color" value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                <span className="text-xs text-slate-400 font-mono">{form.color}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.name || loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Přidat štítek
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Zrušit</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-secondary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Přidat štítek
        </button>
      )}
    </div>
  );
}

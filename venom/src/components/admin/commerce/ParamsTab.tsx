"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ErrorBanner, useCommerceTheme } from "./shared";

interface ParamDef {
  id: number;
  slug: string;
  name: string;
  type: string;
  unit: string | null;
  filterable: boolean;
  position: number;
}

function slugify(input: string): string {
  return input.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function ParamsTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [params, setParams] = useState<ParamDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ParamDef | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", type: "text", unit: "", filterable: true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ params: ParamDef[] }>(`${base}/params`);
      setParams(data.params);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setForm({ name: "", slug: "", type: "text", unit: "", filterable: true });
  }

  function startEdit(p: ParamDef) {
    setEditing(p);
    setCreating(false);
    setForm({ name: p.name, slug: p.slug, type: p.type, unit: p.unit ?? "", filterable: p.filterable });
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        type: form.type,
        unit: form.unit.trim() || null,
        filterable: form.filterable,
      };
      if (editing) {
        await api(`${base}/params/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await api(`${base}/params`, { method: "POST", body: JSON.stringify(body) });
      }
      setCreating(false);
      setEditing(null);
      load();
    } catch (e) { setError(e instanceof Error ? e.message : "Uložení selhalo"); }
    finally { setSaving(false); }
  }

  async function remove(id: number, name: string) {
    if (!confirm(`Smazat parametr "${name}"? Odstraní se i hodnoty u všech produktů.`)) return;
    try {
      await api(`${base}/params/${id}`, { method: "DELETE" });
      load();
    } catch (e) { setError(e instanceof Error ? e.message : "Smazání selhalo"); }
  }

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Produktové parametry</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">Definujte filtrovatelné vlastnosti produktů (barva, materiál, velikost…). Zákazníci je uvidí ve filtrech na výpisu.</p>
        </div>
        <button onClick={startCreate} className={t.btnPrimary}>+ Nový parametr</button>
      </div>

      {(creating || editing) && (
        <div className={`${t.sectionCls} space-y-4`}>
          <h3 className={t.sectionTitleCls}>{editing ? "Upravit parametr" : "Nový parametr"}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={t.labelCls}>Název</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Barva" className={t.inputCls} />
            </div>
            <div>
              <label className={t.labelCls}>Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder={slugify(form.name) || "barva"} className={`${t.inputCls} font-mono`} />
            </div>
            <div>
              <label className={t.labelCls}>Typ</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={t.inputCls}>
                <option value="text">Text</option>
                <option value="number">Číslo</option>
                <option value="boolean">Ano/Ne</option>
                <option value="select">Výběr</option>
              </select>
            </div>
            <div>
              <label className={t.labelCls}>Jednotka</label>
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="mm, kg, ks…" className={t.inputCls} />
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.filterable}
              onChange={(e) => setForm({ ...form, filterable: e.target.checked })}
              className={`h-4 w-4 rounded ${t.checkboxAccentCls}`} />
            <span className="text-[13px] font-medium">Zobrazit ve filtrech na storefront</span>
          </label>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className={t.btnPrimary}>
              {saving ? "Ukládám…" : editing ? "Uložit" : "Vytvořit"}
            </button>
            <button onClick={() => { setCreating(false); setEditing(null); }} className={t.btnGhost}>Zrušit</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-[13px] text-slate-400">Načítám…</p>
      ) : params.length === 0 ? (
        <div className={t.emptyStateCls}>
          <p className="text-[14px] text-slate-500">Zatím nemáte žádné parametry.</p>
          <p className="mt-1 text-[12.5px] text-slate-400">Vytvořte parametry jako Barva, Materiál, Velikost pro filtrování produktů.</p>
        </div>
      ) : (
        <div className={t.tableShellCls}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className={t.tableHeadRowCls}>
                <th className="px-4 py-3">Název</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Typ</th>
                <th className="px-4 py-3">Jednotka</th>
                <th className="px-4 py-3">Filtrovatelný</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <tr key={p.id} className={t.tableRowCls}>
                  <td className="px-4 py-3 font-semibold">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-500">{p.slug}</td>
                  <td className="px-4 py-3 text-slate-600">{p.type}</td>
                  <td className="px-4 py-3 text-slate-500">{p.unit ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      p.filterable ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}>
                      {p.filterable ? "Ano" : "Ne"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => startEdit(p)} className={`${t.btnGhost} !h-7 !px-2.5 !text-[11px]`}>Upravit</button>
                      <button onClick={() => remove(p.id, p.name)} className={`${t.btnGhost} !h-7 !px-2.5 !text-[11px] hover:!text-rose-600`}>Smazat</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

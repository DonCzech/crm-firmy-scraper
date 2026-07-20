"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

/**
 * Modul chytre-vyhledavani — administrace ve stylu Luigi's Box:
 * statistiky hledání, synonyma, boosting produktů a nastavení našeptávače.
 */

interface SearchSettings {
  min_chars: number;
  typo_tolerance: boolean;
  max_products: number;
  show_phrases: boolean;
  show_categories: boolean;
  show_brands: boolean;
  synonyms: string[][];
  boosted_product_ids: number[];
}

interface QueryStat {
  query: string;
  hits: number;
  suggest_count: number;
  results_count: number | null;
  last_searched_at: string;
}

interface Stats {
  total_confirmed: number;
  total_suggested: number;
  unique_queries: number;
  zero_result_count: number;
  top: QueryStat[];
  zero_results: QueryStat[];
}

interface BoostedProduct { id: number; title: string; image_url: string | null }
interface ProductHit { id: number; title: string }

const DEFAULTS: SearchSettings = {
  min_chars: 2, typo_tolerance: true, max_products: 7,
  show_phrases: true, show_categories: true, show_brands: true,
  synonyms: [], boosted_product_ids: [],
};

export function SearchTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [settings, setSettings] = useState<SearchSettings>(DEFAULTS);
  const [stats, setStats] = useState<Stats | null>(null);
  const [boosted, setBoosted] = useState<BoostedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [synonymDraft, setSynonymDraft] = useState("");
  const [boostQuery, setBoostQuery] = useState("");
  const [boostHits, setBoostHits] = useState<ProductHit[]>([]);
  const boostTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<{ settings: SearchSettings; stats: Stats; boosted: BoostedProduct[] }>(`${base}/search`);
      setSettings(data.settings);
      setStats(data.stats);
      setBoosted(data.boosted);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function save(next: SearchSettings) {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api(`${base}/search`, { method: "POST", body: JSON.stringify({ action: "settings", settings: next }) });
      setSettings(next);
      setSaved(true);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Uložení selhalo"); }
    finally { setSaving(false); }
  }

  function addSynonymGroup() {
    const group = synonymDraft.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (group.length < 2) { setError("Skupina synonym potřebuje alespoň 2 výrazy oddělené čárkou."); return; }
    setError(null);
    setSynonymDraft("");
    save({ ...settings, synonyms: [...settings.synonyms, group] });
  }

  function removeSynonymGroup(idx: number) {
    save({ ...settings, synonyms: settings.synonyms.filter((_, i) => i !== idx) });
  }

  function searchBoostProducts(q: string) {
    setBoostQuery(q);
    if (boostTimer.current) clearTimeout(boostTimer.current);
    if (q.trim().length < 2) { setBoostHits([]); return; }
    boostTimer.current = setTimeout(async () => {
      try {
        const data = await api<{ items: ProductHit[] }>(`${base}/products?search=${encodeURIComponent(q)}&perPage=8&status=active`);
        setBoostHits((data.items ?? []).filter((p) => !settings.boosted_product_ids.includes(p.id)));
      } catch { /* noop */ }
    }, 250);
  }

  function addBoost(p: ProductHit) {
    setBoostQuery("");
    setBoostHits([]);
    save({ ...settings, boosted_product_ids: [...settings.boosted_product_ids, p.id] });
  }

  function removeBoost(id: number) {
    save({ ...settings, boosted_product_ids: settings.boosted_product_ids.filter((x) => x !== id) });
  }

  async function clearStats() {
    if (!window.confirm("Opravdu smazat všechny statistiky hledání?")) return;
    try {
      await api(`${base}/search`, { method: "POST", body: JSON.stringify({ action: "clear_stats" }) });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Smazání selhalo"); }
  }

  if (loading) return <p className="py-8 text-center text-[13px] text-slate-400">Načítám…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Chytré vyhledávání</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">Našeptávač s typo-tolerancí, synonyma, boosting produktů a statistiky hledání — vše, co zákazníci ve vašem obchodě hledají, pod kontrolou.</p>
      </div>

      <ErrorBanner message={error} />

      {/* ── Statistiky ── */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Dotazů našeptávače", value: stats?.total_suggested ?? 0, color: "text-slate-900" },
          { label: "Potvrzených hledání", value: stats?.total_confirmed ?? 0, color: "text-emerald-600" },
          { label: "Unikátních frází", value: stats?.unique_queries ?? 0, color: "text-slate-900" },
          { label: "Bez výsledků", value: stats?.zero_result_count ?? 0, color: "text-rose-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${t.sectionCls} flex flex-col gap-1`}>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
            <span className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nejhledanější */}
        <div className={t.sectionCls}>
          <div className="flex items-center justify-between">
            <h3 className={t.sectionTitleCls}>Nejhledanější fráze</h3>
            <button type="button" onClick={clearStats} className="text-[12px] font-semibold text-slate-400 transition hover:text-rose-600">Smazat statistiky</button>
          </div>
          {(stats?.top.length ?? 0) === 0 ? (
            <p className="py-6 text-center text-[13px] text-slate-400">Zatím žádná data — statistiky se plní automaticky z hledání zákazníků.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className={t.tableHeadRowCls}>
                  <th className="px-3 py-2 text-left">Fráze</th>
                  <th className="px-3 py-2 text-center">Našeptávač</th>
                  <th className="px-3 py-2 text-center">Potvrzeno</th>
                  <th className="px-3 py-2 text-right">Naposledy</th>
                </tr>
              </thead>
              <tbody>
                {stats!.top.map((q) => (
                  <tr key={q.query} className={t.tableRowCls}>
                    <td className="px-3 py-2 font-medium">{q.query}</td>
                    <td className="px-3 py-2 text-center tabular-nums">{q.suggest_count}</td>
                    <td className="px-3 py-2 text-center tabular-nums">{q.hits}</td>
                    <td className="px-3 py-2 text-right text-[12px] text-slate-500">{fmtDate(q.last_searched_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Bez výsledků */}
        <div className={t.sectionCls}>
          <h3 className={t.sectionTitleCls}>Hledání bez výsledků</h3>
          <p className="mb-2 text-[12px] text-slate-500">Co zákazníci hledají a nenacházejí — kandidáti na synonyma nebo doplnění sortimentu.</p>
          {(stats?.zero_results.length ?? 0) === 0 ? (
            <p className="py-6 text-center text-[13px] text-slate-400">Žádné dotazy bez výsledků. 🎉</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className={t.tableHeadRowCls}>
                  <th className="px-3 py-2 text-left">Fráze</th>
                  <th className="px-3 py-2 text-center">Hledáno</th>
                  <th className="px-3 py-2 text-right">Naposledy</th>
                </tr>
              </thead>
              <tbody>
                {stats!.zero_results.map((q) => (
                  <tr key={q.query} className={t.tableRowCls}>
                    <td className="px-3 py-2 font-medium text-rose-700">{q.query}</td>
                    <td className="px-3 py-2 text-center tabular-nums">{q.suggest_count}</td>
                    <td className="px-3 py-2 text-right text-[12px] text-slate-500">{fmtDate(q.last_searched_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Synonyma ── */}
      <div className={t.sectionCls}>
        <h3 className={t.sectionTitleCls}>Synonyma</h3>
        <p className="mb-3 text-[12px] text-slate-500">Dotaz na kterýkoli výraz skupiny najde produkty odpovídající všem ostatním výrazům. Např. „mobil, telefon, smartphone".</p>
        <div className="flex gap-2">
          <input
            className={t.inputCls}
            placeholder="mobil, telefon, smartphone"
            value={synonymDraft}
            onChange={(e) => setSynonymDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSynonymGroup(); } }}
          />
          <button
            type="button"
            onClick={addSynonymGroup}
            disabled={saving}
            className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            Přidat skupinu
          </button>
        </div>
        {settings.synonyms.length > 0 && (
          <ul className="mt-4 space-y-2">
            {settings.synonyms.map((group, idx) => (
              <li key={`${group.join("|")}-${idx}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="flex flex-wrap gap-1.5">
                  {group.map((term) => (
                    <span key={term} className="rounded-full bg-white px-2.5 py-0.5 text-[12px] font-semibold text-slate-700 shadow-sm">{term}</span>
                  ))}
                </span>
                <button type="button" onClick={() => removeSynonymGroup(idx)} className="shrink-0 text-[12px] font-semibold text-slate-400 transition hover:text-rose-600">Odebrat</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Boosting ── */}
      <div className={t.sectionCls}>
        <h3 className={t.sectionTitleCls}>Boosting produktů</h3>
        <p className="mb-3 text-[12px] text-slate-500">Boostované produkty se ve výsledcích našeptávače zobrazují vždy nahoře — ideální pro akce, výprodeje nebo vlastní značku.</p>
        <div className="relative max-w-md">
          <input
            className={t.inputCls}
            placeholder="Hledat produkt k boostování…"
            value={boostQuery}
            onChange={(e) => searchBoostProducts(e.target.value)}
          />
          {boostHits.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {boostHits.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => addBoost(p)}
                    className="block w-full px-3 py-2 text-left text-[13px] transition hover:bg-slate-50"
                  >
                    {p.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {boosted.length > 0 && (
          <ul className="mt-4 space-y-2">
            {boosted.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="flex items-center gap-2.5">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-8 w-8 rounded-md object-cover" />
                  ) : (
                    <span className="h-8 w-8 rounded-md bg-slate-200" />
                  )}
                  <span className="text-[13px] font-semibold text-slate-800">{p.title}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">Boost</span>
                </span>
                <button type="button" onClick={() => removeBoost(p.id)} className="shrink-0 text-[12px] font-semibold text-slate-400 transition hover:text-rose-600">Odebrat</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Nastavení našeptávače ── */}
      <div className={t.sectionCls}>
        <h3 className={t.sectionTitleCls}>Nastavení našeptávače</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={t.labelCls}>Napovídat od počtu znaků</label>
            <select
              className={t.inputCls}
              value={String(settings.min_chars)}
              onChange={(e) => setSettings((s) => ({ ...s, min_chars: Number(e.target.value) }))}
            >
              <option value="1">1 znaku</option>
              <option value="2">2 znaků</option>
              <option value="3">3 znaků</option>
              <option value="4">4 znaků</option>
            </select>
          </div>
          <div>
            <label className={t.labelCls}>Max. produktů v našeptávači</label>
            <select
              className={t.inputCls}
              value={String(settings.max_products)}
              onChange={(e) => setSettings((s) => ({ ...s, max_products: Number(e.target.value) }))}
            >
              {[3, 5, 7, 9, 12].map((n) => <option key={n} value={String(n)}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {([
            ["typo_tolerance", "Typo-tolerance — „samsnug“ najde Samsung"],
            ["show_phrases", "Zobrazovat návrhy frází"],
            ["show_categories", "Zobrazovat kategorie"],
            ["show_brands", "Zobrazovat značky"],
          ] as Array<[keyof SearchSettings, string]>).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-slate-700">
              <input
                type="checkbox"
                checked={settings[key] as boolean}
                onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 accent-slate-900"
              />
              {label}
            </label>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => save(settings)}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Ukládám…" : "Uložit nastavení"}
          </button>
          {saved && <span className="text-[12px] font-semibold text-emerald-600">Uloženo ✓</span>}
        </div>
      </div>
    </div>
  );
}

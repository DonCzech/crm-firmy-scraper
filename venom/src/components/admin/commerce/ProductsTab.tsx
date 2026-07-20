"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  api, czk, ErrorBanner,
  useCommerceTheme,
  type ProductRow, type CategoryRow,
} from "./shared";
import { ProductEditor } from "./ProductEditor";

function parseFlags(raw: string): Record<string, boolean> {
  try { return JSON.parse(raw); } catch { return {}; }
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function FlagDot({ on }: { on: boolean }) {
  return on
    ? <span className="inline-block w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.18)]" title="Ano" />
    : <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-slate-200 bg-white" title="Ne" />;
}

export function ProductsTab({ base, tenantSlug, currency, initialSearch = "" }: { base: string; tenantSlug: string; currency: string; initialSearch?: string }) {
  const theme = useCommerceTheme();
  const [items, setItems] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ open: boolean; productId: number | null }>({ open: false, productId: null });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const perPage = 50;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), perPage: String(perPage), status });
      if (search) qs.set("search", search);
      if (categoryId) qs.set("categoryId", categoryId);
      const data = await api<{ items: ProductRow[]; total: number }>(`${base}/products?${qs}`);
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Načtení selhalo");
    } finally {
      setLoading(false);
    }
  }, [base, page, search, status, categoryId]);

  useEffect(() => {
    const t = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  useEffect(() => {
    api<{ categories: CategoryRow[] }>(`${base}/categories`).then((d) => setCategories(d.categories)).catch(() => {});
  }, [base]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || editor.open) return;
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "n") { e.preventDefault(); setEditor({ open: true, productId: null }); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editor.open]);

  function toggleAll() {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((p) => p.id)));
  }

  function toggleOne(id: number) {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  async function bulkAction(action: string) {
    if (selected.size === 0 || bulkBusy) return;
    setBulkBusy(true);
    try {
      await api(`${base}/products/bulk`, {
        method: "POST",
        body: JSON.stringify({ action, productIds: [...selected] }),
      });
      setSelected(new Set());
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk akce selhala");
    } finally {
      setBulkBusy(false);
    }
  }

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      {/* Toolbar */}
      <div className={theme.toolbarCls}>
        <input
          ref={searchRef}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Hledat název, slug, SKU…  ( / )"
          className={`${theme.inputCls} w-80`}
        />

        {/* FUNKCE dropdown */}
        <div className="relative group">
          <button className={`${theme.btnGhost} gap-1`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Funkce ▾
          </button>
          <div className="invisible group-hover:visible absolute left-0 top-full z-30 mt-1 min-w-[180px] rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
            <button onClick={() => setEditor({ open: true, productId: null })} className="block w-full px-4 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50">+ Nový produkt</button>
            {selected.size > 0 && (
              <>
                <hr className="my-1 border-slate-100" />
                <button onClick={() => bulkAction("activate")} disabled={bulkBusy} className="block w-full px-4 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50">Aktivovat vybrané</button>
                <button onClick={() => bulkAction("deactivate")} disabled={bulkBusy} className="block w-full px-4 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50">Deaktivovat vybrané</button>
                <button onClick={() => bulkAction("archive")} disabled={bulkBusy} className="block w-full px-4 py-2 text-left text-[13px] text-rose-600 hover:bg-rose-50">Archivovat vybrané</button>
              </>
            )}
          </div>
        </div>

        {/* FILTR button */}
        <button onClick={() => setShowFilter(!showFilter)} className={`${theme.btnGhost} gap-1`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
          Filtr
        </button>

        <span className="ml-auto text-[12px] font-semibold text-slate-500">{total} produktů</span>
        <button onClick={() => setEditor({ open: true, productId: null })} className={theme.btnPrimary}>
          + Nový produkt <span className="ml-1.5 hidden rounded bg-white/15 px-1 text-[10px] lg:inline">N</span>
        </button>
      </div>

      {/* Expanded filter row */}
      {showFilter && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className={`${theme.inputCls} w-auto min-w-[150px] pr-9`}>
            <option value="all">Všechny stavy</option>
            <option value="active">Aktivní</option>
            <option value="draft">Koncepty</option>
            <option value="archived">Archiv</option>
          </select>
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            className={`${theme.inputCls} w-auto min-w-[190px] pr-9`}>
            <option value="">Všechny kategorie</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => { setStatus("all"); setCategoryId(""); setShowFilter(false); }}
            className="ml-auto text-[12px] text-slate-400 hover:text-slate-600">Resetovat filtry</button>
        </div>
      )}

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-[13px]">
          <span className="font-semibold text-blue-700">Vybráno: {selected.size}</span>
          <button onClick={() => bulkAction("activate")} disabled={bulkBusy}
            className="rounded-md border border-blue-200 bg-white px-3 py-1 text-[12px] font-semibold text-blue-600 hover:bg-blue-50">Aktivovat</button>
          <button onClick={() => bulkAction("deactivate")} disabled={bulkBusy}
            className="rounded-md border border-amber-200 bg-white px-3 py-1 text-[12px] font-semibold text-amber-600 hover:bg-amber-50">Deaktivovat</button>
          <button onClick={() => bulkAction("archive")} disabled={bulkBusy}
            className="rounded-md border border-rose-200 bg-white px-3 py-1 text-[12px] font-semibold text-rose-600 hover:bg-rose-50">Archivovat</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-[12px] text-gray-400 hover:text-gray-600">✕ Zrušit výběr</button>
        </div>
      )}

      <ErrorBanner message={error} />

      <div className={theme.tableShellCls}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className={theme.tableHeadRowCls}>
              <th className="w-8 px-3 py-2"><input type="checkbox" checked={items.length > 0 && selected.size === items.length} onChange={toggleAll} /></th>
              <th className="px-3 py-2 font-semibold">Produkt</th>
              <th className="px-3 py-2 font-semibold text-right">Cena</th>
              <th className="px-3 py-2 font-semibold text-center" title="Akce">Akce</th>
              <th className="px-3 py-2 font-semibold text-center" title="Novinka">Nov.</th>
              <th className="px-3 py-2 font-semibold text-center" title="Doporučený / Tip">Tip</th>
              <th className="px-3 py-2 font-semibold text-center" title="Výprodej / Sleva">Výpr.</th>
              <th className="px-3 py-2 font-semibold text-center">Viditelnost</th>
              <th className="px-3 py-2 font-semibold text-right">Skladem</th>
              <th className="px-3 py-2 font-semibold">Stáří</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="px-3 py-8 text-center text-gray-400">Načítám…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={10} className="px-3 py-10 text-center text-gray-400">
                {"Žádné produkty. Založte první tlačítkem „+ Nový produkt“."}
              </td></tr>
            ) : items.map((p) => {
              const flags = parseFlags(p.flags);
              const age = daysSince(p.created_at);
              return (
                <tr key={p.id} onClick={() => setEditor({ open: true, productId: p.id })}
                  className={`cursor-pointer ${theme.tableRowCls} ${selected.has(p.id) ? "!bg-blue-50/60" : ""}`}>
                  <td className="w-8 px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt="" className="h-10 w-10 rounded-sm object-cover ring-1 ring-slate-200" />
                      ) : (
                        <div className="h-10 w-10 rounded-sm bg-slate-100 ring-1 ring-slate-200" />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate max-w-[260px]">{p.title}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          {p.brand && <span className="text-slate-500">{p.brand}</span>}
                          {p.brand && p.sku && <span>·</span>}
                          {p.sku && <span className="font-mono">{p.sku}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">
                    {p.price_min_cents === p.price_max_cents
                      ? czk(p.price_min_cents, currency)
                      : <span className="text-[12px]">{czk(p.price_min_cents, currency)} – {czk(p.price_max_cents, currency)}</span>}
                  </td>
                  <td className="px-3 py-2 text-center"><FlagDot on={!!flags.sale} /></td>
                  <td className="px-3 py-2 text-center"><FlagDot on={!!flags.new} /></td>
                  <td className="px-3 py-2 text-center"><FlagDot on={!!flags.featured} /></td>
                  <td className="px-3 py-2 text-center"><FlagDot on={!!flags.clearance} /></td>
                  <td className="px-3 py-2 text-center">
                    {p.status === "active" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Viditelný
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Skrytý
                      </span>
                    )}
                  </td>
                  <td className={`px-3 py-2 text-right tabular-nums ${p.stock_total <= 0 ? "font-semibold text-rose-600" : p.stock_total < 5 ? "text-amber-600" : "text-slate-700"}`}>
                    {p.stock_total}
                  </td>
                  <td className="px-3 py-2 text-[12px] text-slate-500 whitespace-nowrap">
                    {age === 0 ? "Dnes" : age === 1 ? "Včera" : `${age} dní`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-3 flex items-center gap-2 text-[13px]">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={theme.pagerBtnCls}>←</button>
          <span className="text-slate-600">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className={theme.pagerBtnCls}>→</button>
        </div>
      )}

      {editor.open && (
        <ProductEditor
          base={base}
          tenantSlug={tenantSlug}
          productId={editor.productId}
          categories={categories}
          onClose={() => setEditor({ open: false, productId: null })}
          onSaved={load}
        />
      )}
    </div>
  );
}

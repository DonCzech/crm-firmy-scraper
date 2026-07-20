"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ErrorBanner, useCommerceTheme, type CategoryRow } from "./shared";

type Action = "update_prices" | "assign_category" | "set_flag" | "set_tax_rate" | "export";

const ACTIONS: Array<{ key: Action; label: string; desc: string }> = [
  { key: "update_prices", label: "Změna cen", desc: "Hromadně upravte ceny procentem nebo pevnou částkou" },
  { key: "assign_category", label: "Přiřazení kategorie", desc: "Přiřaďte produkty do kategorie" },
  { key: "set_flag", label: "Nastavení příznaků", desc: "Hromadně nastavte Akce, Novinka, Tip, Výprodej" },
  { key: "set_tax_rate", label: "Sazba DPH", desc: "Hromadně změňte sazbu DPH" },
  { key: "export", label: "Export CSV", desc: "Exportujte produkty do CSV souboru" },
];

export function BulkOperationsTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [action, setAction] = useState<Action | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [priceMode, setPriceMode] = useState<"percent" | "fixed">("percent");
  const [priceValue, setPriceValue] = useState("");
  const [priceField, setPriceField] = useState("price_cents");
  const [categoryId, setCategoryId] = useState("");
  const [catMode, setCatMode] = useState<"add" | "replace">("add");
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [flag, setFlag] = useState("sale");
  const [flagValue, setFlagValue] = useState(true);
  const [taxRate, setTaxRate] = useState("21");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    api<{ categories: CategoryRow[] }>(`${base}/categories`).then((d) => setCategories(d.categories)).catch(() => {});
  }, [base]);

  async function execute() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      let body: Record<string, unknown>;
      switch (action) {
        case "update_prices":
          body = {
            action: "update_prices",
            categoryId: categoryId ? Number(categoryId) : undefined,
            mode: priceMode,
            value: priceMode === "percent" ? Number(priceValue) : Math.round(Number(priceValue) * 100),
            field: priceField,
          };
          break;
        case "assign_category":
          body = { action: "assign_category", categoryId: Number(targetCategoryId) ? Number(targetCategoryId) : undefined, mode: catMode };
          if (filterCategoryId) body.productIds = undefined;
          break;
        case "set_flag":
          body = { action: "set_flag", flag, value: flagValue };
          break;
        case "set_tax_rate":
          body = { action: "set_tax_rate", taxRate: Number(taxRate) };
          break;
        case "export": {
          const qs = new URLSearchParams();
          if (filterCategoryId) qs.set("categoryId", filterCategoryId);
          if (filterStatus) qs.set("status", filterStatus);
          const res = await api<string>(`${base}/bulk`, {
            method: "POST",
            body: JSON.stringify({ action: "export", categoryId: filterCategoryId ? Number(filterCategoryId) : undefined, status: filterStatus || undefined }),
          });
          if (typeof res === "string") {
            const blob = new Blob([res], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `produkty-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }
          setResult("Export stažen");
          setBusy(false);
          return;
        }
        default:
          setBusy(false);
          return;
      }
      const data = await api<{ updated: number }>(`${base}/bulk`, { method: "POST", body: JSON.stringify(body) });
      setResult(`Aktualizováno: ${data.updated} záznamů`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operace selhala");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Hromadné operace</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">Upravte ceny, příznaky nebo kategorie u více produktů najednou.</p>
      </div>

      <ErrorBanner message={error} />
      {result && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          {result}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map((a) => (
          <button key={a.key} onClick={() => { setAction(a.key); setResult(null); }}
            className={`${t.sectionCls} text-left transition ${t.metricActionCls} ${action === a.key ? "ring-2 ring-offset-2" : ""}`}
            style={action === a.key ? { "--tw-ring-color": t.accentColor } as React.CSSProperties : undefined}>
            <h3 className={`text-[14px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>{a.label}</h3>
            <p className="mt-1 text-[12.5px] text-slate-500">{a.desc}</p>
          </button>
        ))}
      </div>

      {action === "update_prices" && (
        <div className={`${t.sectionCls} space-y-4`}>
          <h3 className={t.sectionTitleCls}>Změna cen</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={t.labelCls}>Režim</label>
              <select value={priceMode} onChange={(e) => setPriceMode(e.target.value as "percent" | "fixed")} className={t.inputCls}>
                <option value="percent">Procentuální změna</option>
                <option value="fixed">Pevná částka (Kč)</option>
              </select>
            </div>
            <div>
              <label className={t.labelCls}>{priceMode === "percent" ? "Změna (%)" : "Změna (Kč)"}</label>
              <input type="number" value={priceValue} onChange={(e) => setPriceValue(e.target.value)}
                placeholder={priceMode === "percent" ? "10 = +10%, -5 = -5%" : "100"} className={t.inputCls} />
            </div>
            <div>
              <label className={t.labelCls}>Cenové pole</label>
              <select value={priceField} onChange={(e) => setPriceField(e.target.value)} className={t.inputCls}>
                <option value="price_cents">Prodejní cena</option>
                <option value="compare_at_price_cents">Původní cena</option>
                <option value="cost_cents">Nákupní cena</option>
              </select>
            </div>
            <div>
              <label className={t.labelCls}>Omezit na kategorii</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={t.inputCls}>
                <option value="">Všechny produkty</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <button onClick={execute} disabled={busy || !priceValue} className={t.btnPrimary}>
            {busy ? "Zpracovávám…" : "Provést změnu cen"}
          </button>
        </div>
      )}

      {action === "assign_category" && (
        <div className={`${t.sectionCls} space-y-4`}>
          <h3 className={t.sectionTitleCls}>Přiřazení kategorie</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={t.labelCls}>Cílová kategorie</label>
              <select value={targetCategoryId} onChange={(e) => setTargetCategoryId(e.target.value)} className={t.inputCls}>
                <option value="">Vyberte…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={t.labelCls}>Režim</label>
              <select value={catMode} onChange={(e) => setCatMode(e.target.value as "add" | "replace")} className={t.inputCls}>
                <option value="add">Přidat ke stávajícím</option>
                <option value="replace">Nahradit všechny</option>
              </select>
            </div>
          </div>
          <button onClick={execute} disabled={busy || !targetCategoryId} className={t.btnPrimary}>
            {busy ? "Zpracovávám…" : "Přiřadit kategorii"}
          </button>
        </div>
      )}

      {action === "set_flag" && (
        <div className={`${t.sectionCls} space-y-4`}>
          <h3 className={t.sectionTitleCls}>Nastavení příznaků</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={t.labelCls}>Příznak</label>
              <select value={flag} onChange={(e) => setFlag(e.target.value)} className={t.inputCls}>
                <option value="sale">Akce</option>
                <option value="new">Novinka</option>
                <option value="featured">Doporučený</option>
                <option value="clearance">Výprodej</option>
              </select>
            </div>
            <div>
              <label className={t.labelCls}>Hodnota</label>
              <select value={flagValue ? "true" : "false"} onChange={(e) => setFlagValue(e.target.value === "true")} className={t.inputCls}>
                <option value="true">Zapnout</option>
                <option value="false">Vypnout</option>
              </select>
            </div>
          </div>
          <button onClick={execute} disabled={busy} className={t.btnPrimary}>
            {busy ? "Zpracovávám…" : "Nastavit příznak"}
          </button>
        </div>
      )}

      {action === "set_tax_rate" && (
        <div className={`${t.sectionCls} space-y-4`}>
          <h3 className={t.sectionTitleCls}>Sazba DPH</h3>
          <div className="max-w-xs">
            <label className={t.labelCls}>DPH (%)</label>
            <select value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className={t.inputCls}>
              <option value="21">21 % (základní)</option>
              <option value="12">12 % (snížená)</option>
              <option value="0">0 % (osvobozeno)</option>
            </select>
          </div>
          <button onClick={execute} disabled={busy} className={t.btnPrimary}>
            {busy ? "Zpracovávám…" : "Nastavit DPH"}
          </button>
        </div>
      )}

      {action === "export" && (
        <div className={`${t.sectionCls} space-y-4`}>
          <h3 className={t.sectionTitleCls}>Export produktů</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={t.labelCls}>Kategorie</label>
              <select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)} className={t.inputCls}>
                <option value="">Všechny</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={t.labelCls}>Stav</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={t.inputCls}>
                <option value="">Všechny</option>
                <option value="active">Aktivní</option>
                <option value="draft">Koncepty</option>
                <option value="archived">Archivované</option>
              </select>
            </div>
          </div>
          <button onClick={execute} disabled={busy} className={t.btnPrimary}>
            {busy ? "Generuji…" : "Stáhnout CSV"}
          </button>
        </div>
      )}
    </div>
  );
}

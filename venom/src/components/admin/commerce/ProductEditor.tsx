"use client";

import { useEffect, useRef, useState } from "react";
import {
  api, centsToKcInput, kcInputToCents, useCommerceTheme,
  type ProductDetailData, type VariantData, type ImageData, type CategoryRow,
} from "./shared";
import { RichTextEditor } from "./RichTextEditor";
import { richTextToPlain } from "@/lib/commerce/html";

/**
 * Celostránkový editor produktu (Shoptet/Alza admin styl):
 * vlevo obsah (název, popisky s WYSIWYG, fotky, varianty, parametry),
 * vpravo publikace, kategorie, příznaky, DPH a SEO. AI generování popisků
 * přes POST {base}/ai (action: generate).
 */

interface Props {
  base: string;
  tenantSlug: string;
  productId: number | null;
  categories: CategoryRow[];
  onClose: () => void;
  onSaved: () => void;
}

interface VariantDraft {
  id?: number;
  title: string;
  sku: string;
  ean: string;
  priceKc: string;
  compareKc: string;
  costKc: string;
  stock: string;
  weightG: string;
  is_default: boolean;
}

interface ParamDef {
  id: number;
  slug: string;
  name: string;
  type: string;
  unit: string | null;
  filterable: boolean;
  position: number;
}

interface ProductParamValue {
  param_id: number;
  value: string;
}

function slugify(input: string): string {
  return input.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const EMPTY_VARIANT: VariantDraft = { title: "", sku: "", ean: "", priceKc: "", compareKc: "", costKc: "", stock: "0", weightG: "", is_default: false };

interface ProductFlags {
  featured: boolean;
  new: boolean;
  sale: boolean;
  clearance: boolean;
}

export function ProductEditor({ base, tenantSlug, productId, categories, onClose, onSaved }: Props) {
  const theme = useCommerceTheme();
  const isNew = productId === null;
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [aiBusy, setAiBusy] = useState<null | "short" | "description">(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "archived">("draft");
  const [brand, setBrand] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [flags, setFlags] = useState<ProductFlags>({ featured: false, new: false, sale: false, clearance: false });
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [taxRate, setTaxRate] = useState("21");
  const [variants, setVariants] = useState<VariantDraft[]>([{ ...EMPTY_VARIANT, is_default: true }]);
  const [images, setImages] = useState<ImageData[]>([]);

  // Parametry (Alza-style tabulka na PDP)
  const [paramDefs, setParamDefs] = useState<ParamDef[]>([]);
  const [paramValues, setParamValues] = useState<Record<number, string>>({});
  const [newParamName, setNewParamName] = useState("");
  const [newParamUnit, setNewParamUnit] = useState("");
  const [addingParam, setAddingParam] = useState(false);
  const [showNewParam, setShowNewParam] = useState(false);

  // Produkt zobrazuje jen parametry, které má přiřazené (klíč v paramValues);
  // ostatní definice jsou k dispozici v dropdownu „+ Přidat parametr…"
  const assignedDefs = paramDefs.filter((pd) => paramValues[pd.id] !== undefined);
  const unassignedDefs = paramDefs.filter((pd) => paramValues[pd.id] === undefined);

  useEffect(() => {
    let cancelled = false;
    api<{ params: ParamDef[] }>(`${base}/params`)
      .then(({ params }) => { if (!cancelled) setParamDefs(params); })
      .catch(() => { /* parametry jsou volitelné */ });
    return () => { cancelled = true; };
  }, [base]);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    Promise.all([
      api<{ product: ProductDetailData }>(`${base}/products/${productId}`),
      api<{ params: Array<{ param_id: number; value: string }> }>(`${base}/products/${productId}/params`).catch(() => ({ params: [] as ProductParamValue[] })),
    ])
      .then(([{ product: p }, { params: pv }]) => {
        if (cancelled) return;
        setTitle(p.title);
        setSlug(p.slug);
        setStatus(p.status);
        setBrand(p.brand ?? "");
        setSubtitle(p.subtitle ?? "");
        setDescription(p.description ?? "");
        setCategoryIds(p.category_ids);
        setFlags({
          featured: p.flags?.featured === true,
          new: p.flags?.new === true,
          sale: p.flags?.sale === true,
          clearance: p.flags?.clearance === true,
        });
        setSeoTitle(p.seo_title ?? "");
        setSeoDescription(p.seo_description ?? "");
        setTaxRate(p.tax_rate != null ? String(p.tax_rate) : "21");
        setImages(p.images.map((i) => ({ url: i.url, alt: i.alt })));
        setVariants(p.variants.map((v: VariantData) => ({
          id: v.id,
          title: v.title ?? "",
          sku: v.sku ?? "",
          ean: v.ean ?? "",
          priceKc: centsToKcInput(v.price_cents),
          compareKc: centsToKcInput(v.compare_at_price_cents),
          costKc: centsToKcInput(v.cost_cents),
          stock: String(v.stock_qty),
          weightG: v.weight_grams ? String(v.weight_grams) : "",
          is_default: v.is_default,
        })));
        setParamValues(Object.fromEntries(pv.map((x) => [x.param_id, x.value])));
        setLoading(false);
      })
      .catch((e) => { if (!cancelled) { setError(e instanceof Error ? e.message : "Načtení selhalo"); setLoading(false); } });
    return () => { cancelled = true; };
  }, [base, productId, isNew]);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`/api/demo/${tenantSlug}/upload-image`, { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string }).error ?? "Upload selhal");
        setImages((prev) => [...prev, { url: (data as { url: string }).url, alt: title || file.name }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload selhal");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function generateAi(type: "short" | "description") {
    if (isNew || productId == null) return;
    setAiBusy(type);
    setError(null);
    try {
      const { text } = await api<{ text: string }>(`${base}/ai`, {
        method: "POST",
        body: JSON.stringify({ action: "generate", productId, type }),
      });
      if (type === "short") setSubtitle(text);
      else setDescription(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI generování selhalo");
    } finally {
      setAiBusy(null);
    }
  }

  async function addParamDefinition() {
    const name = newParamName.trim();
    if (!name) return;
    setAddingParam(true);
    try {
      const { param } = await api<{ param: ParamDef }>(`${base}/params`, {
        method: "POST",
        body: JSON.stringify({ slug: slugify(name), name, unit: newParamUnit.trim() || null, filterable: true }),
      });
      setParamDefs((prev) => [...prev, param]);
      setParamValues((prev) => ({ ...prev, [param.id]: "" }));
      setNewParamName("");
      setNewParamUnit("");
      setShowNewParam(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vytvoření parametru selhalo");
    } finally {
      setAddingParam(false);
    }
  }

  async function save() {
    setError(null);
    if (!title.trim()) { setError("Vyplňte název produktu"); return; }
    const finalSlug = slug.trim() || slugify(title);
    if (!finalSlug) { setError("Vyplňte slug"); return; }

    const parsedVariants = [];
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const price = kcInputToCents(v.priceKc);
      if (price === null) { setError(`Varianta ${i + 1}: neplatná cena`); return; }
      parsedVariants.push({
        id: v.id,
        title: v.title.trim() || null,
        sku: v.sku.trim() || null,
        ean: v.ean.trim() || null,
        price_cents: price,
        compare_at_price_cents: kcInputToCents(v.compareKc),
        cost_cents: kcInputToCents(v.costKc),
        stock_qty: parseInt(v.stock, 10) || 0,
        weight_grams: v.weightG ? parseInt(v.weightG, 10) || null : null,
        is_default: v.is_default,
        position: i,
      });
    }
    if (!parsedVariants.length) { setError("Produkt musí mít alespoň jednu variantu"); return; }
    if (!parsedVariants.some((v) => v.is_default)) parsedVariants[0].is_default = true;

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      status,
      brand: brand.trim() || null,
      subtitle: subtitle.trim() || null,
      description: description.trim() || null,
      category_ids: categoryIds,
      primary_category_id: categoryIds[0] ?? null,
      flags: { featured: flags.featured, new: flags.new, sale: flags.sale, clearance: flags.clearance },
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      tax_rate: parseInt(taxRate, 10) || null,
      variants: parsedVariants,
      images: images.map((img, i) => ({ url: img.url, alt: img.alt, position: i })),
    };

    setSaving(true);
    try {
      let savedId = productId;
      if (isNew) {
        const res = await api<{ product: { id: number } }>(`${base}/products`, { method: "POST", body: JSON.stringify(payload) });
        savedId = res.product.id;
      } else {
        await api(`${base}/products/${productId}`, { method: "PATCH", body: JSON.stringify(payload) });
      }
      if (savedId != null) {
        const items = Object.entries(paramValues)
          .map(([k, v]) => ({ param_id: Number(k), value: v.trim() }))
          .filter((x) => x.value);
        await api(`${base}/products/${savedId}/params`, { method: "PUT", body: JSON.stringify({ params: items }) })
          .catch(() => { /* parametry nesmí shodit uložení produktu */ });
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Uložení selhalo");
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (isNew || !window.confirm("Archivovat produkt? Zmizí ze storefrontu, objednávky zůstanou.")) return;
    try {
      await api(`${base}/products/${productId}`, { method: "DELETE" });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Archivace selhala");
    }
  }

  function setVariant(i: number, patch: Partial<VariantDraft>) {
    setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, ...patch } : v));
  }

  const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]";
  const cardTitle = "mb-4 flex items-center gap-2 text-[12.5px] font-extrabold uppercase tracking-[0.08em] text-slate-800 after:h-px after:flex-1 after:bg-slate-100";
  const help = "mt-1 text-[11.5px] text-slate-400";
  const thCls = "pb-2 pr-2 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400";
  const aiBtn = "inline-flex h-7 items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 text-[11.5px] font-bold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50";

  const statusMeta = {
    active: { label: "Aktivní", dot: "bg-emerald-500" },
    draft: { label: "Koncept", dot: "bg-amber-400" },
    archived: { label: "Archiv", dot: "bg-slate-300" },
  }[status];

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-white font-sans text-slate-900 antialiased">
      {/* ── Horní lišta ─────────────────────────────────────────────────── */}
      <div className="flex h-[58px] shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
        <button onClick={onClose}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
          Produkty
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-extrabold tracking-tight">
            {isNew ? "Nový produkt" : title || "Upravit produkt"}
          </h2>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11.5px] font-bold text-slate-600 sm:inline-flex">
          <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
          {statusMeta.label}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {!isNew && slug && (
            <a href={`/demo/${tenantSlug}/obchod/${slug}`} target="_blank" rel="noreferrer"
              className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex">
              Zobrazit na webu ↗
            </a>
          )}
          {!isNew && (
            <button onClick={archive}
              className="hidden h-9 items-center rounded-lg px-3 text-[13px] font-semibold text-rose-500 transition hover:bg-rose-50 sm:inline-flex">
              Archivovat
            </button>
          )}
          <button onClick={save} disabled={saving || loading} className={theme.btnPrimary}>
            {saving ? "Ukládám…" : "Uložit produkt"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-auto mt-3 w-full max-w-[1160px] px-4 sm:px-6">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[13px] font-medium text-rose-700 shadow-sm">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-[13px] text-slate-400">Načítám produkt…</div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto grid min-h-full w-full max-w-[1160px] grid-cols-1 gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px]">

            {/* ══ LEVÝ SLOUPEC — obsah (Popisky rostou do volné výšky) ══ */}
            <div className="flex min-w-0 flex-col gap-5">

              {/* Základní údaje */}
              <div className={card}>
                <div>
                  <label className={theme.labelCls}>Název produktu *</label>
                  <input
                    className={`${theme.inputCls} !h-[46px] !text-[16px] font-semibold`}
                    value={title} autoFocus={isNew} placeholder="např. Samsung Galaxy S25 Ultra"
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!slugTouched) setSlug(slugify(e.target.value));
                    }} />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={theme.labelCls}>URL slug</label>
                    <input className={theme.inputCls} value={slug}
                      onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} />
                  </div>
                  <div>
                    <label className={theme.labelCls}>Značka</label>
                    <input className={theme.inputCls} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="např. Samsung" />
                  </div>
                </div>
              </div>

              {/* Popisky — karta absorbuje volnou výšku obrazovky */}
              <div className={`${card} flex min-h-0 flex-1 flex-col`}>
                <h3 className={cardTitle}>Popisky</h3>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className={`${theme.labelCls} !mb-0`}>Krátký popis</label>
                    <button type="button" className={aiBtn} disabled={isNew || aiBusy !== null}
                      title={isNew ? "Nejdřív produkt uložte" : "Vygenerovat krátký popis pomocí AI"}
                      onClick={() => generateAi("short")}>
                      ✨ {aiBusy === "short" ? "Píšu…" : "Napsat AI"}
                    </button>
                  </div>
                  <input className={theme.inputCls} value={subtitle} maxLength={160}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Jedna věta, která prodává — zobrazí se pod názvem a ve výpisech" />
                  <p className={help}>{subtitle.length}/160 znaků · zobrazuje se u názvu produktu, v košíku a ve výsledcích hledání</p>
                </div>

                <div className="mt-5 flex min-h-0 flex-1 flex-col">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className={`${theme.labelCls} !mb-0`}>Dlouhý popis</label>
                    <button type="button" className={aiBtn} disabled={isNew || aiBusy !== null}
                      title={isNew ? "Nejdřív produkt uložte" : "Vygenerovat strukturovaný popis pomocí AI"}
                      onClick={() => generateAi("description")}>
                      ✨ {aiBusy === "description" ? "Píšu popis…" : "Napsat popis AI"}
                    </button>
                  </div>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    tenantSlug={tenantSlug}
                    fill
                    placeholder="Napište prodejní popis — nadpisy, odstavce, odrážky i obrázky. Přesně tak se zobrazí na stránce produktu."
                  />
                  <p className={help}>Označte text a použijte lištu: nadpisy sekcí (H2/H3), tučné písmo, odrážky, odkazy a obrázky — jako popisky na Alze.</p>
                </div>
              </div>

              {/* Fotogalerie */}
              <div className={card}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className={`${cardTitle} !mb-0 flex-1`}>Fotogalerie</h3>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => uploadFiles(e.target.files)} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading} className={`${theme.btnGhost} ml-3`}>
                    {uploading ? "Nahrávám…" : "+ Nahrát fotky"}
                  </button>
                </div>
                {images.length === 0 ? (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="block w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 py-10 text-center transition hover:border-slate-300 hover:bg-slate-50">
                    <div className="mb-2 text-[26px]">📸</div>
                    <div className="text-[13px] font-semibold text-slate-500">Zatím žádné fotky</div>
                    <div className="mt-1 text-[11.5px] text-slate-400">Klikněte a nahrajte fotky produktu</div>
                  </button>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                    {images.map((img, i) => (
                      <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
                        {i === 0 && (
                          <span className="absolute left-1.5 top-1.5 rounded-md bg-slate-900/85 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-white">Hlavní</span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 hidden justify-between bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 group-hover:flex">
                          <button title="Posunout doleva" disabled={i === 0}
                            onClick={() => setImages((prev) => { const n = [...prev]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })}
                            className="text-[12px] text-white disabled:opacity-30 hover:text-blue-300">←</button>
                          <button title="Smazat" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-[12px] text-red-300 hover:text-red-200">✕</button>
                          <button title="Posunout doprava" disabled={i === images.length - 1}
                            onClick={() => setImages((prev) => { const n = [...prev]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n; })}
                            className="text-[12px] text-white disabled:opacity-30 hover:text-blue-300">→</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Varianty, ceny a sklad */}
              <div className={card}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className={`${cardTitle} !mb-0 flex-1`}>Varianty, ceny a sklad</h3>
                  <button onClick={() => setVariants((prev) => [...prev, { ...EMPTY_VARIANT }])} className={`${theme.btnGhost} ml-3`}>
                    + Přidat variantu
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-[12.5px]">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className={thCls}>Varianta</th>
                        <th className={thCls}>SKU</th>
                        <th className={thCls}>EAN</th>
                        <th className={`${thCls} text-right`}>Cena (Kč)</th>
                        <th className={`${thCls} text-right`} title="Zobrazí se přeškrtnutá jako sleva">Původní</th>
                        <th className={`${thCls} text-right`} title="Pro výpočet marže — zákazník nevidí">Nákupní</th>
                        <th className={`${thCls} text-right`}>Skladem</th>
                        <th className={`${thCls} text-right`}>Hmot. (g)</th>
                        <th className={`${thCls} text-center`} title="Výchozí varianta">Vých.</th>
                        <th className="pb-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v, i) => (
                        <tr key={i} className="border-b border-slate-50 last:border-0">
                          <td className="min-w-[140px] py-1.5 pr-2">
                            <input className={theme.inputCls} value={v.title} placeholder={variants.length === 1 ? "Standard" : "např. Černá / M"}
                              onChange={(e) => setVariant(i, { title: e.target.value })} />
                          </td>
                          <td className="w-[110px] py-1.5 pr-2">
                            <input className={`${theme.inputCls} font-mono !text-[12px]`} value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} />
                          </td>
                          <td className="w-[130px] py-1.5 pr-2">
                            <input className={`${theme.inputCls} font-mono !text-[12px]`} value={v.ean} placeholder="EAN-13"
                              onChange={(e) => setVariant(i, { ean: e.target.value })} />
                          </td>
                          <td className="w-[92px] py-1.5 pr-2">
                            <input className={`${theme.inputCls} text-right tabular-nums`} value={v.priceKc} inputMode="decimal"
                              onChange={(e) => setVariant(i, { priceKc: e.target.value })} />
                          </td>
                          <td className="w-[92px] py-1.5 pr-2">
                            <input className={`${theme.inputCls} text-right tabular-nums`} value={v.compareKc} inputMode="decimal" placeholder="—"
                              onChange={(e) => setVariant(i, { compareKc: e.target.value })} />
                          </td>
                          <td className="w-[92px] py-1.5 pr-2">
                            <input className={`${theme.inputCls} text-right tabular-nums`} value={v.costKc} inputMode="decimal" placeholder="—"
                              onChange={(e) => setVariant(i, { costKc: e.target.value })} />
                          </td>
                          <td className="w-[80px] py-1.5 pr-2">
                            <input className={`${theme.inputCls} text-right tabular-nums`} value={v.stock} inputMode="numeric"
                              onChange={(e) => setVariant(i, { stock: e.target.value })} />
                          </td>
                          <td className="w-[84px] py-1.5 pr-2">
                            <input className={`${theme.inputCls} text-right tabular-nums`} value={v.weightG} inputMode="numeric" placeholder="—"
                              onChange={(e) => setVariant(i, { weightG: e.target.value })} />
                          </td>
                          <td className="w-[46px] py-1.5 text-center">
                            <input type="radio" name="default-variant" checked={v.is_default}
                              onChange={() => setVariants((prev) => prev.map((x, idx) => ({ ...x, is_default: idx === i })))} />
                          </td>
                          <td className="w-[32px] py-1.5 text-right">
                            <button onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                              disabled={variants.length <= 1} title="Odebrat variantu"
                              className="text-[13px] text-slate-300 transition hover:text-red-500 disabled:opacity-30">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className={help}>„Původní cena" se na webu zobrazí přeškrtnutá. „Nákupní cena" slouží pro výpočet marže. Změny skladu se zapisují do skladové historie.</p>
              </div>

              {/* Parametry — jen ty přiřazené k produktu, další se přidávají výběrem */}
              <div className={card}>
                <h3 className={cardTitle}>Parametry</h3>
                <p className="-mt-2 mb-3 text-[11.5px] text-slate-400">Zobrazí se v tabulce „Parametry" na stránce produktu a slouží k filtrování. Přidejte jen ty, které pro produkt dávají smysl.</p>

                {assignedDefs.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-[12.5px] text-slate-400">
                    Produkt zatím nemá žádné parametry.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignedDefs.map((pd) => (
                      <div key={pd.id} className="grid grid-cols-[minmax(110px,200px)_1fr_28px] items-center gap-2.5">
                        <span className="truncate text-[13px] font-semibold text-slate-600" title={pd.name}>
                          {pd.name}{pd.unit ? <span className="font-normal text-slate-400"> ({pd.unit})</span> : null}
                        </span>
                        <input className={theme.inputCls} value={paramValues[pd.id] ?? ""} placeholder="Hodnota…"
                          onChange={(e) => setParamValues((prev) => ({ ...prev, [pd.id]: e.target.value }))} />
                        <button type="button" title="Odebrat parametr z produktu"
                          onClick={() => setParamValues((prev) => { const n = { ...prev }; delete n[pd.id]; return n; })}
                          className="justify-self-center text-[13px] text-slate-300 transition hover:text-red-500">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  {unassignedDefs.length > 0 && (
                    <select
                      className={`${theme.inputCls} !w-auto min-w-[220px]`}
                      value=""
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        if (id) setParamValues((prev) => ({ ...prev, [id]: "" }));
                      }}>
                      <option value="">+ Přidat parametr…</option>
                      {unassignedDefs.map((pd) => (
                        <option key={pd.id} value={pd.id}>{pd.name}{pd.unit ? ` (${pd.unit})` : ""}</option>
                      ))}
                    </select>
                  )}
                  {!showNewParam ? (
                    <button type="button" onClick={() => setShowNewParam(true)}
                      className="text-[12.5px] font-semibold text-slate-400 transition hover:text-slate-700">
                      + Vytvořit nový parametr
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <input className={`${theme.inputCls} !w-[190px]`} value={newParamName} placeholder="Název (např. Objem)" autoFocus
                        onChange={(e) => setNewParamName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParamDefinition(); } }} />
                      <input className={`${theme.inputCls} !w-[90px]`} value={newParamUnit} placeholder="ml, g…"
                        onChange={(e) => setNewParamUnit(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParamDefinition(); } }} />
                      <button onClick={addParamDefinition} disabled={addingParam || !newParamName.trim()} className={theme.btnGhost}>
                        {addingParam ? "Přidávám…" : "Vytvořit"}
                      </button>
                      <button type="button" onClick={() => { setShowNewParam(false); setNewParamName(""); setNewParamUnit(""); }}
                        className="text-[12px] text-slate-400 hover:text-slate-700">Zrušit</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ══ PRAVÝ SLOUPEC — nastavení ═════════════════════════════ */}
            <div className="space-y-5">

              {/* Publikace */}
              <div className={card}>
                <h3 className={cardTitle}>Publikace</h3>
                <label className={theme.labelCls}>Stav</label>
                <select className={theme.inputCls} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                  <option value="active">Aktivní — viditelný na webu</option>
                  <option value="draft">Koncept — skrytý</option>
                  <option value="archived">Archivovaný</option>
                </select>
                <div className="mt-3">
                  <label className={theme.labelCls}>DPH sazba</label>
                  <select className={theme.inputCls} value={taxRate} onChange={(e) => setTaxRate(e.target.value)}>
                    <option value="21">21 % (základní)</option>
                    <option value="12">12 % (snížená)</option>
                    <option value="0">0 % (osvobozeno)</option>
                  </select>
                </div>
              </div>

              {/* Kategorie */}
              <div className={card}>
                <h3 className={cardTitle}>Kategorie</h3>
                {categories.length === 0 ? (
                  <p className="text-[12.5px] text-slate-400">Zatím žádné kategorie — vytvořte je v záložce Kategorie.</p>
                ) : (
                  <CategoryTreePicker
                    categories={categories}
                    selected={categoryIds}
                    onChange={setCategoryIds}
                    theme={theme}
                  />
                )}
              </div>

              {/* Příznaky */}
              <div className={card}>
                <h3 className={cardTitle}>Příznaky</h3>
                <div className="space-y-2">
                  {([
                    ["sale", "Akce", "Označení akčního produktu"],
                    ["new", "Novinka", "Štítek novinky na webu"],
                    ["featured", "Tip / Doporučený", "Zobrazí se v doporučených"],
                    ["clearance", "Výprodej", "Zařazení do výprodeje"],
                  ] as const).map(([key, label, desc]) => (
                    <label key={key} className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 transition ${
                      flags[key] ? "border-blue-300 bg-blue-50/60" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}>
                      <input
                        className={`${theme.checkboxAccentCls} mt-0.5`}
                        type="checkbox"
                        checked={flags[key]}
                        onChange={(e) => setFlags({ ...flags, [key]: e.target.checked })}
                      />
                      <span>
                        <span className="block text-[13px] font-semibold text-slate-800">{label}</span>
                        <span className="block text-[11px] text-slate-400">{desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SEO */}
              <div className={card}>
                <h3 className={cardTitle}>SEO</h3>
                <label className={theme.labelCls}>SEO titulek</label>
                <input className={theme.inputCls} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title || "Titulek pro vyhledávače"} />
                <div className="mt-3">
                  <label className={theme.labelCls}>SEO popis</label>
                  <textarea className={`${theme.inputCls} !h-20 py-2`} value={seoDescription} maxLength={400}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Nevyplníte-li, použije se začátek popisu produktu" />
                </div>
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Náhled ve vyhledávači</div>
                  <div className="truncate text-[14.5px] font-medium text-blue-700">{seoTitle || title || "Název produktu"}</div>
                  <div className="text-[11.5px] text-green-700">{`webero.cz/obchod/${slug || "url-slug"}`}</div>
                  <div className="mt-0.5 line-clamp-2 text-[12px] text-slate-500">
                    {seoDescription || (description ? richTextToPlain(description).slice(0, 160) : "") || subtitle || "Popis produktu…"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Category Tree Picker (multi-select with nested tree) ────────────────────

interface CatTreeNode {
  id: number; name: string; slug: string; parent_id: number | null;
  children: CatTreeNode[]; depth: number; product_count: number;
  image_url: string | null; sort_order: number;
}

function buildCatTree(cats: CategoryRow[]): CatTreeNode[] {
  const map = new Map<number, CatTreeNode>();
  const roots: CatTreeNode[] = [];
  for (const c of cats) map.set(c.id, { ...c, children: [], depth: 0, image_url: c.image_url ?? null });
  for (const c of cats) {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      const parent = map.get(c.parent_id)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  function sortNodes(nodes: CatTreeNode[]) {
    nodes.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name));
    for (const n of nodes) sortNodes(n.children);
  }
  sortNodes(roots);
  return roots;
}

function CategoryTreePicker({ categories, selected, onChange, theme }: {
  categories: CategoryRow[];
  selected: number[];
  onChange: (ids: number[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme: any;
}) {
  const tree = buildCatTree(categories);
  const [expanded, setExpanded] = useState<Set<number>>(() => {
    const s = new Set<number>();
    for (const c of categories) {
      if (selected.includes(c.id) && c.parent_id) {
        let pid: number | null = c.parent_id;
        while (pid) { s.add(pid); pid = categories.find((x) => x.id === pid)?.parent_id ?? null; }
      }
    }
    return s;
  });

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function renderNode(node: CatTreeNode) {
    const checked = selected.includes(node.id);
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.id);

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 transition cursor-pointer group"
          style={{ paddingLeft: 8 + node.depth * 20 }}
          onClick={() => toggle(node.id)}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 flex-shrink-0"
            >
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{ transition: "transform 0.15s", transform: isExpanded ? "rotate(90deg)" : "rotate(0)" }}
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          ) : (
            <span className="w-5 h-5 flex-shrink-0" />
          )}

          <div className={`flex-shrink-0 rounded border-2 flex items-center justify-center transition ${
            checked ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-slate-400"
          }`} style={{ width: 18, height: 18, borderRadius: 5 }}>
            {checked && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </div>

          {node.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={node.image_url} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" />
          ) : (
            <span className="w-5 h-5 rounded bg-gradient-to-br from-blue-50 to-blue-100 text-blue-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {node.name.charAt(0).toUpperCase()}
            </span>
          )}

          <span className={`text-[13px] ${checked ? "font-semibold text-blue-700" : "text-slate-700"}`}>
            {node.name}
          </span>

          {node.product_count > 0 && (
            <span className="text-[10px] text-slate-400 ml-auto">{node.product_count}</span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>{node.children.map(renderNode)}</div>
        )}
      </div>
    );
  }

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((id) => {
            const cat = categories.find((c) => c.id === id);
            if (!cat) return null;
            return (
              <span key={id} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${theme.selectedChipCls}`}>
                {cat.name}
                <button type="button" onClick={() => toggle(id)} className="ml-0.5 text-current opacity-50 hover:opacity-100">×</button>
              </span>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto bg-white py-1">
        {tree.map(renderNode)}
      </div>
    </div>
  );
}

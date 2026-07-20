"use client";

import { useCallback, useEffect, useState } from "react";
import { api, czk, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

/** Modul „Sady produktů" — správa zvýhodněných sad. */

interface VariantOption {
  variant_id: number;
  product_title: string;
  variant_title: string | null;
  sku: string | null;
  price_cents: number;
}

interface BundleItem {
  variant_id: number;
  qty: number;
  product_title: string;
  variant_title: string | null;
  price_cents: number;
}

interface Bundle {
  id: number;
  name: string;
  discount_pct: number;
  status: string;
  created_at: string;
  items: BundleItem[];
  regular_cents: number;
  bundle_cents: number;
}

export function BundlesTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Formulář nové sady
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [pct, setPct] = useState("10");
  const [picked, setPicked] = useState<{ variant_id: number; qty: number }[]>([]);
  const [pickId, setPickId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ bundles: Bundle[]; variants: VariantOption[] }>(`${base}/bundles`);
      setBundles(data.bundles);
      setVariants(data.variants);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Načtení selhalo");
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  function optLabel(v: VariantOption): string {
    return `${v.product_title}${v.variant_title ? ` — ${v.variant_title}` : ""}${v.sku ? ` (${v.sku})` : ""} · ${czk(v.price_cents)}`;
  }

  function addPick() {
    const id = parseInt(pickId, 10);
    if (!id || picked.some((p) => p.variant_id === id)) return;
    setPicked([...picked, { variant_id: id, qty: 1 }]);
    setPickId("");
  }

  const pickedRegular = picked.reduce((s, p) => {
    const v = variants.find((x) => x.variant_id === p.variant_id);
    return s + (v ? v.price_cents * p.qty : 0);
  }, 0);
  const pctNum = Math.min(50, Math.max(0, parseFloat(pct) || 0));

  async function create() {
    if (name.trim().length < 2 || picked.length < 2 || pctNum < 1) return;
    setBusy(true);
    setError(null);
    try {
      await api(`${base}/bundles`, {
        method: "POST",
        body: JSON.stringify({ action: "create", name: name.trim(), discount_pct: pctNum, items: picked }),
      });
      setNotice(`Sada „${name.trim()}" vytvořena. Zobrazuje se na detailech produktů v sadě.`);
      setName(""); setPct("10"); setPicked([]); setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vytvoření selhalo");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: number, status: "active" | "paused") {
    setBusy(true);
    try {
      await api(`${base}/bundles`, { method: "POST", body: JSON.stringify({ action: "status", id, status }) });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Změna selhala");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Opravdu smazat sadu?")) return;
    setBusy(true);
    try {
      await api(`${base}/bundles`, { method: "POST", body: JSON.stringify({ action: "delete", id }) });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Smazání selhalo");
    } finally {
      setBusy(false);
    }
  }

  const inputCls = t.design === "studio"
    ? "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[13px] text-white outline-none focus:border-white/40"
    : "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none focus:border-neutral-400";

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">{notice}</div>
      )}

      <section className={t.sectionCls}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-bold">Zvýhodněné sady</h3>
            <p className={`mt-1 text-[12.5px] ${t.design === "studio" ? "text-white/50" : "text-neutral-500"}`}>
              Sada se zobrazí na detailu každého produktu, který obsahuje. Sleva se odečte automaticky v pokladně, jakmile jsou v košíku všechny položky.
            </p>
          </div>
          <button type="button" className={t.btnPrimary} onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Zavřít" : "+ Nová sada"}
          </button>
        </div>

        {showForm && (
          <div className={`mt-4 rounded-xl border p-4 ${t.design === "studio" ? "border-white/10 bg-white/5" : "border-neutral-200 bg-neutral-50/60"}`}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-[12px] font-semibold">
                Název sady
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Např. Startovací set" />
              </label>
              <label className="flex flex-col gap-1 text-[12px] font-semibold">
                Sleva (%)
                <input className={inputCls} type="number" min={1} max={50} value={pct} onChange={(e) => setPct(e.target.value)} />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="flex min-w-[260px] flex-1 flex-col gap-1 text-[12px] font-semibold">
                Přidat produkt do sady
                <select className={inputCls} value={pickId} onChange={(e) => setPickId(e.target.value)}>
                  <option value="">— vyberte variantu —</option>
                  {variants.filter((v) => !picked.some((p) => p.variant_id === v.variant_id)).map((v) => (
                    <option key={v.variant_id} value={v.variant_id}>{optLabel(v)}</option>
                  ))}
                </select>
              </label>
              <button type="button" className={t.btnGhost} onClick={addPick} disabled={!pickId}>Přidat</button>
            </div>

            {picked.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {picked.map((p) => {
                  const v = variants.find((x) => x.variant_id === p.variant_id);
                  return (
                    <div key={p.variant_id} className="flex items-center gap-2 text-[13px]">
                      <input
                        className={`${inputCls} w-16 py-1 text-center`}
                        type="number" min={1} max={20} value={p.qty}
                        onChange={(e) => setPicked(picked.map((x) => x.variant_id === p.variant_id ? { ...x, qty: Math.max(1, parseInt(e.target.value, 10) || 1) } : x))}
                      />
                      <span className="flex-1">{v ? optLabel(v) : `Varianta #${p.variant_id}`}</span>
                      <button type="button" className="text-[12px] font-semibold text-rose-500 hover:underline"
                        onClick={() => setPicked(picked.filter((x) => x.variant_id !== p.variant_id))}>Odebrat</button>
                    </div>
                  );
                })}
                <div className={`pt-2 text-[13px] font-semibold ${t.design === "studio" ? "text-white/70" : "text-neutral-600"}`}>
                  Běžná cena {czk(pickedRegular)} → cena sady <strong>{czk(Math.round(pickedRegular * (1 - pctNum / 100)))}</strong>
                  {pctNum > 0 && ` (úspora ${czk(pickedRegular - Math.round(pickedRegular * (1 - pctNum / 100)))})`}
                </div>
              </div>
            )}

            <div className="mt-4">
              <button type="button" className={t.btnPrimary} onClick={create}
                disabled={busy || name.trim().length < 2 || picked.length < 2 || pctNum < 1}>
                {busy ? "Ukládám…" : "Vytvořit sadu"}
              </button>
              {picked.length < 2 && <span className={`ml-3 text-[12px] ${t.design === "studio" ? "text-white/40" : "text-neutral-400"}`}>Sada musí mít alespoň 2 položky.</span>}
            </div>
          </div>
        )}
      </section>

      <section className={t.sectionCls}>
        <h3 className="text-[15px] font-bold">Sady ({bundles.length})</h3>
        {loading ? (
          <p className="mt-3 text-[13px] opacity-60">Načítám…</p>
        ) : bundles.length === 0 ? (
          <p className="mt-3 text-[13px] opacity-60">Zatím žádné sady. Vytvořte první — zvýší průměrnou hodnotu objednávky.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {bundles.map((b) => (
              <div key={b.id} className={`rounded-xl border p-4 ${t.design === "studio" ? "border-white/10" : "border-neutral-200"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px] font-bold">{b.name}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${b.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"}`}>
                      {b.status === "active" ? "Aktivní" : "Pozastaveno"}
                    </span>
                    <span className="text-[12px] opacity-50">{fmtDate(b.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className={t.btnGhost} disabled={busy}
                      onClick={() => setStatus(b.id, b.status === "active" ? "paused" : "active")}>
                      {b.status === "active" ? "Pozastavit" : "Aktivovat"}
                    </button>
                    <button type="button" className="text-[12.5px] font-semibold text-rose-500 hover:underline" disabled={busy}
                      onClick={() => remove(b.id)}>Smazat</button>
                  </div>
                </div>
                <ul className={`mt-2 list-inside list-disc text-[12.5px] ${t.design === "studio" ? "text-white/60" : "text-neutral-500"}`}>
                  {b.items.map((i) => (
                    <li key={i.variant_id}>
                      {i.qty > 1 ? `${i.qty}× ` : ""}{i.product_title}{i.variant_title ? ` — ${i.variant_title}` : ""} · {czk(i.price_cents)}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-[13px]">
                  <span className="opacity-50 line-through">{czk(b.regular_cents)}</span>
                  <span className="ml-2 font-bold">{czk(b.bundle_cents)}</span>
                  <span className="ml-2 text-[12px] text-emerald-600">−{b.discount_pct} % · úspora {czk(b.regular_cents - b.bundle_cents)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

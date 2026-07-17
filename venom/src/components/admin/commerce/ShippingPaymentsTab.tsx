"use client";

import { useCallback, useEffect, useState } from "react";
import { useCommerceTheme, api, centsToKcInput, kcInputToCents, ErrorBanner } from "./shared";

interface ShippingMethod {
  key: string; label: string; description?: string;
  price_cents: number; free_above_cents: number | null; enabled: boolean;
}
interface PaymentMethod {
  key: string; label: string; description?: string;
  fee_cents: number; enabled: boolean;
}
interface Settings {
  shipping_methods?: ShippingMethod[];
  payment_methods?: PaymentMethod[];
}

const DEFAULT_SHIPPING: ShippingMethod[] = [
  { key: "zasilkovna", label: "Zásilkovna — výdejní místo", description: "Doručení na výdejní místo do 1–2 dnů", price_cents: 7900, free_above_cents: 150000, enabled: true },
  { key: "kuryr", label: "Kurýr na adresu (PPL)", description: "Doručení na adresu do 1–2 pracovních dnů", price_cents: 11900, free_above_cents: 150000, enabled: true },
  { key: "osobni", label: "Osobní odběr", description: "Zdarma na prodejně", price_cents: 0, free_above_cents: null, enabled: true },
];
const DEFAULT_PAYMENT: PaymentMethod[] = [
  { key: "gopay", label: "Platba kartou online", description: "GoPay — karta, Apple Pay, Google Pay", fee_cents: 0, enabled: true },
  { key: "bank_transfer", label: "Bankovní převod", description: "Zboží odešleme po připsání platby", fee_cents: 0, enabled: true },
  { key: "cod", label: "Dobírka", description: "Zaplatíte při převzetí", fee_cents: 3900, enabled: true },
];

const SHIPPING_ICONS: Record<string, React.ReactNode> = {
  zasilkovna: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="15" height="13" rx="1"/><path d="M17 13h3l2 2v3h-5z"/><circle cx="7" cy="22" r="1.5"/><circle cx="19.5" cy="22" r="1.5"/></svg>,
  kuryr: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="1.6"/><circle cx="17.5" cy="19" r="1.6"/></svg>,
  osobni: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

export function ShippingPaymentsTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [shipping, setShipping] = useState<ShippingMethod[]>(DEFAULT_SHIPPING);
  const [payment, setPayment] = useState<PaymentMethod[]>(DEFAULT_PAYMENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<{ shop: { settings: Settings } }>(`${base}/settings`);
      const s = data.shop?.settings;
      if (s?.shipping_methods?.length) setShipping(s.shipping_methods);
      if (s?.payment_methods?.length) setPayment(s.payment_methods);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true); setError(null); setSaved(false);
    try {
      await api(`${base}/settings`, {
        method: "PATCH",
        body: JSON.stringify({ settings: { shipping_methods: shipping, payment_methods: payment } }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e instanceof Error ? e.message : "Uložení selhalo"); }
    finally { setSaving(false); }
  }

  function updateShipping(idx: number, patch: Partial<ShippingMethod>) {
    setShipping(prev => prev.map((m, i) => i === idx ? { ...m, ...patch } : m));
  }
  function updatePayment(idx: number, patch: Partial<PaymentMethod>) {
    setPayment(prev => prev.map((m, i) => i === idx ? { ...m, ...patch } : m));
  }

  function move<T>(list: T[], idx: number, dir: -1 | 1): T[] {
    const to = idx + dir;
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    [next[idx], next[to]] = [next[to], next[idx]];
    return next;
  }
  function newKey(prefix: string, taken: Array<{ key: string }>): string {
    let n = 1;
    while (taken.some((m) => m.key === `${prefix}-${n}`)) n++;
    return `${prefix}-${n}`;
  }
  function addShipping() {
    setShipping(prev => [...prev, { key: newKey("vlastni-doprava", prev), label: "Nová doprava", description: "", price_cents: 0, free_above_cents: null, enabled: true }]);
  }
  function addPayment() {
    setPayment(prev => [...prev, { key: newKey("vlastni-platba", prev), label: "Nová platba", description: "", fee_cents: 0, enabled: true }]);
  }
  function removeShipping(idx: number) {
    if (shipping.length <= 1) { setError("Musí zůstat alespoň jedna metoda dopravy"); return; }
    if (!window.confirm(`Smazat metodu „${shipping[idx].label}"?`)) return;
    setShipping(prev => prev.filter((_, i) => i !== idx));
  }
  function removePayment(idx: number) {
    if (payment.length <= 1) { setError("Musí zůstat alespoň jedna platební metoda"); return; }
    if (!window.confirm(`Smazat metodu „${payment[idx].label}"?`)) return;
    setPayment(prev => prev.filter((_, i) => i !== idx));
  }

  const moveBtnCls = `flex h-6 w-6 items-center justify-center rounded text-[11px] ${t.design === "studio" ? "text-slate-400 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"} disabled:opacity-30`;
  const removeBtnCls = `flex h-6 w-6 items-center justify-center rounded text-[13px] ${t.design === "studio" ? "text-slate-400 hover:bg-red-500/20 hover:text-red-300" : "text-slate-400 hover:bg-red-50 hover:text-red-600"}`;

  if (loading) return <p className="py-8 text-center text-[13px] text-slate-400">Načítám nastavení…</p>;

  return (
    <div className="space-y-8">
      <ErrorBanner message={error} />

      {/* Shipping */}
      <section>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Způsoby dopravy</h2>
        <p className="mt-0.5 mb-5 text-[13px] text-slate-500">Zapněte/vypněte metody dopravy a upravte ceny.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shipping.map((m, i) => (
            <div key={m.key} className={`${t.sectionCls} relative transition ${!m.enabled ? "opacity-50" : ""}`}>
              <div className="mb-3 flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  t.design === "studio" ? "bg-violet-500/20 text-violet-300" : t.design === "glass" ? "bg-lime-100 text-lime-700" : "bg-indigo-50 text-indigo-600"
                }`}>
                  {SHIPPING_ICONS[m.key] ?? SHIPPING_ICONS.kuryr}
                </span>
                <div className="flex-1 min-w-0">
                  <input value={m.label} onChange={(e) => updateShipping(i, { label: e.target.value })}
                    className={`${t.inputCls} !h-7 !text-[13px] font-semibold`} />
                </div>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={m.enabled} onChange={(e) => updateShipping(i, { enabled: e.target.checked })}
                    className={`h-4 w-4 rounded ${t.checkboxAccentCls}`} />
                </label>
              </div>
              <div className="absolute right-2 bottom-2 flex items-center gap-0.5">
                <button type="button" title="Posunout výš" disabled={i === 0} onClick={() => setShipping(prev => move(prev, i, -1))} className={moveBtnCls}>▲</button>
                <button type="button" title="Posunout níž" disabled={i === shipping.length - 1} onClick={() => setShipping(prev => move(prev, i, 1))} className={moveBtnCls}>▼</button>
                <button type="button" title="Smazat metodu" onClick={() => removeShipping(i)} className={removeBtnCls}>×</button>
              </div>
              <input value={m.description ?? ""} onChange={(e) => updateShipping(i, { description: e.target.value })}
                placeholder="Popis…" className={`${t.inputCls} !h-7 !text-[12px] mb-3`} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={t.labelCls}>Cena (Kč)</label>
                  <input type="number" value={centsToKcInput(m.price_cents)} min={0} step={1}
                    onChange={(e) => updateShipping(i, { price_cents: kcInputToCents(e.target.value) ?? 0 })}
                    className={t.inputCls} />
                </div>
                <div>
                  <label className={t.labelCls}>Zdarma od (Kč)</label>
                  <input type="number" value={m.free_above_cents ? centsToKcInput(m.free_above_cents) : ""}
                    placeholder="—" min={0} step={1}
                    onChange={(e) => updateShipping(i, { free_above_cents: kcInputToCents(e.target.value) })}
                    className={t.inputCls} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addShipping} className={`${t.btnGhost} mt-4`}>+ Přidat dopravu</button>
      </section>

      {/* Payment */}
      <section>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Platební metody</h2>
        <p className="mt-0.5 mb-5 text-[13px] text-slate-500">Zapněte/vypněte metody platby a nastavte poplatky.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {payment.map((m, i) => (
            <div key={m.key} className={`${t.sectionCls} relative transition ${!m.enabled ? "opacity-50" : ""}`}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <input value={m.label} onChange={(e) => updatePayment(i, { label: e.target.value })}
                    className={`${t.inputCls} !h-7 !text-[13px] font-semibold`} />
                </div>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={m.enabled} onChange={(e) => updatePayment(i, { enabled: e.target.checked })}
                    className={`h-4 w-4 rounded ${t.checkboxAccentCls}`} />
                </label>
              </div>
              <div className="absolute right-2 bottom-2 flex items-center gap-0.5">
                <button type="button" title="Posunout výš" disabled={i === 0} onClick={() => setPayment(prev => move(prev, i, -1))} className={moveBtnCls}>▲</button>
                <button type="button" title="Posunout níž" disabled={i === payment.length - 1} onClick={() => setPayment(prev => move(prev, i, 1))} className={moveBtnCls}>▼</button>
                <button type="button" title="Smazat metodu" onClick={() => removePayment(i)} className={removeBtnCls}>×</button>
              </div>
              <input value={m.description ?? ""} onChange={(e) => updatePayment(i, { description: e.target.value })}
                placeholder="Popis…" className={`${t.inputCls} !h-7 !text-[12px] mb-3`} />
              <div>
                <label className={t.labelCls}>Příplatek (Kč)</label>
                <input type="number" value={centsToKcInput(m.fee_cents)} min={0} step={1}
                  onChange={(e) => updatePayment(i, { fee_cents: kcInputToCents(e.target.value) ?? 0 })}
                  className={t.inputCls} />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addPayment} className={`${t.btnGhost} mt-4`}>+ Přidat platbu</button>
        <p className="mt-2 text-[12px] text-slate-500">Vlastní platební metody fungují jako offline platba (objednávka se potvrdí bez platební brány).</p>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={save} disabled={saving} className={t.btnPrimary}>
          {saving ? "Ukládám…" : saved ? "✓ Uloženo" : "Uložit nastavení"}
        </button>
        {saved && <span className="text-[13px] font-medium text-emerald-600">Změny uloženy.</span>}
      </div>
    </div>
  );
}

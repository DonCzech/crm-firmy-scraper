"use client";

import { useCallback, useEffect, useState } from "react";
import { useCommerceTheme, api, fmtDate, czkShort, ErrorBanner } from "./shared";

interface Coupon {
  id: number; code: string; type: string; value: number;
  min_order_cents: number | null; max_uses: number | null; used_count: number;
  applies_to: string; valid_from: string | null; valid_until: string | null;
  is_active: boolean; created_at: string;
}

const TYPES: Record<string, string> = { percentage: "Procentuální sleva", fixed: "Pevná sleva (Kč)", free_shipping: "Doprava zdarma" };

function couponValue(c: Coupon) {
  if (c.type === "percentage") return `${c.value} %`;
  if (c.type === "fixed") return czkShort(c.value);
  return "Doprava zdarma";
}

export function MarketingTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ coupons: Coupon[] }>(`${base}/coupons`);
      setCoupons(data.coupons);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Slevové kupóny</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">Vytvořte slevové kódy pro zákazníky. Kupón lze omezit časem, minimální objednávkou i počtem použití.</p>
        </div>
        <button onClick={() => { setCreating(true); setEditing(null); }} className={t.btnPrimary}>
          + Nový kupón
        </button>
      </div>

      {/* Coupon form */}
      {(creating || editing) && (
        <CouponForm
          base={base}
          coupon={editing}
          theme={t}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
          onCancel={() => { setCreating(false); setEditing(null); }}
        />
      )}

      {/* Table */}
      {loading ? (
        <p className="py-8 text-center text-[13px] text-slate-400">Načítám kupóny…</p>
      ) : coupons.length === 0 ? (
        <div className={`${t.sectionCls} py-12 text-center`}>
          <p className="text-[14px] text-slate-500">Zatím nemáte žádné kupóny.</p>
          <p className="mt-1 text-[12.5px] text-slate-400">Vytvořte první slevový kód pro zákazníky.</p>
        </div>
      ) : (
        <div className={t.tableShellCls}>
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className={t.tableHeadRowCls}>
                <th className="px-4 py-3">Kód</th>
                <th className="px-4 py-3">Typ</th>
                <th className="px-4 py-3">Hodnota</th>
                <th className="px-4 py-3 hidden sm:table-cell">Min. obj.</th>
                <th className="px-4 py-3 hidden md:table-cell">Použití</th>
                <th className="px-4 py-3 hidden lg:table-cell">Platnost</th>
                <th className="px-4 py-3">Stav</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className={t.tableRowCls}>
                  <td className="px-4 py-3 font-mono font-bold tracking-wide">{c.code}</td>
                  <td className="px-4 py-3">{TYPES[c.type] ?? c.type}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{couponValue(c)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell tabular-nums">{c.min_order_cents ? czkShort(c.min_order_cents) : "—"}</td>
                  <td className="px-4 py-3 hidden md:table-cell tabular-nums">
                    {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[12px]">
                    {c.valid_from || c.valid_until
                      ? `${c.valid_from ? fmtDate(c.valid_from) : "—"} → ${c.valid_until ? fmtDate(c.valid_until) : "∞"}`
                      : "Bez omezení"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      c.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}>
                      {c.is_active ? "Aktivní" : "Neaktivní"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditing(c); setCreating(false); }} className={`${t.btnGhost} !h-7 !px-2.5 !text-[11px]`}>Upravit</button>
                      <button onClick={async () => {
                        if (!confirm("Opravdu smazat kupón?")) return;
                        await api(`${base}/coupons?id=${c.id}`, { method: "DELETE" });
                        load();
                      }} className={`${t.btnGhost} !h-7 !px-2.5 !text-[11px] hover:!text-rose-600`}>Smazat</button>
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

function CouponForm({ base, coupon, theme: t, onSaved, onCancel }: {
  base: string; coupon: Coupon | null; theme: ReturnType<typeof useCommerceTheme>;
  onSaved: () => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    code: coupon?.code ?? "",
    type: coupon?.type ?? "percentage",
    value: coupon ? (coupon.type === "percentage" ? String(coupon.value) : String(coupon.value / 100)) : "",
    min_order: coupon?.min_order_cents ? String(coupon.min_order_cents / 100) : "",
    max_uses: coupon?.max_uses ? String(coupon.max_uses) : "",
    valid_from: coupon?.valid_from ? coupon.valid_from.slice(0, 16) : "",
    valid_until: coupon?.valid_until ? coupon.valid_until.slice(0, 16) : "",
    is_active: coupon?.is_active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const value = form.type === "percentage" ? Number(form.value) : Math.round(Number(form.value) * 100);
      const body: Record<string, unknown> = {
        code: form.code,
        type: form.type,
        value: form.type === "free_shipping" ? 0 : value,
        min_order_cents: form.min_order ? Math.round(Number(form.min_order) * 100) : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
        is_active: form.is_active,
      };
      if (coupon) body.id = coupon.id;
      await api(`${base}/coupons`, {
        method: coupon ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Uložení selhalo"); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className={`${t.sectionCls} space-y-4`}>
      <h3 className={t.sectionTitleCls}>{coupon ? "Upravit kupón" : "Nový kupón"}</h3>
      <ErrorBanner message={error} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={t.labelCls}>Kód kupónu</label>
          <input value={form.code} onChange={set("code")} required placeholder="LETO2026" className={t.inputCls} style={{ textTransform: "uppercase", fontFamily: "monospace" }} />
        </div>
        <div>
          <label className={t.labelCls}>Typ slevy</label>
          <select value={form.type} onChange={set("type")} className={t.inputCls}>
            <option value="percentage">Procentuální sleva</option>
            <option value="fixed">Pevná sleva (Kč)</option>
            <option value="free_shipping">Doprava zdarma</option>
          </select>
        </div>
        {form.type !== "free_shipping" && (
          <div>
            <label className={t.labelCls}>{form.type === "percentage" ? "Sleva (%)" : "Sleva (Kč)"}</label>
            <input type="number" value={form.value} onChange={set("value")} required min={0}
              max={form.type === "percentage" ? 100 : undefined} step={form.type === "percentage" ? 1 : 0.01}
              placeholder={form.type === "percentage" ? "15" : "200"} className={t.inputCls} />
          </div>
        )}
        <div>
          <label className={t.labelCls}>Min. objednávka (Kč)</label>
          <input type="number" value={form.min_order} onChange={set("min_order")} min={0} step={1} placeholder="Neomezeno" className={t.inputCls} />
        </div>
        <div>
          <label className={t.labelCls}>Max. počet použití</label>
          <input type="number" value={form.max_uses} onChange={set("max_uses")} min={0} step={1} placeholder="Neomezeno" className={t.inputCls} />
        </div>
        <div>
          <label className={t.labelCls}>Platnost od</label>
          <input type="datetime-local" value={form.valid_from} onChange={set("valid_from")} className={t.inputCls} />
        </div>
        <div>
          <label className={t.labelCls}>Platnost do</label>
          <input type="datetime-local" value={form.valid_until} onChange={set("valid_until")} className={t.inputCls} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={set("is_active")} className={`h-4 w-4 rounded ${t.checkboxAccentCls}`} />
            <span className="text-[13px] font-medium">Aktivní</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={busy} className={t.btnPrimary}>
          {busy ? "Ukládám…" : coupon ? "Uložit změny" : "Vytvořit kupón"}
        </button>
        <button type="button" onClick={onCancel} className={t.btnGhost}>Zrušit</button>
      </div>
    </form>
  );
}

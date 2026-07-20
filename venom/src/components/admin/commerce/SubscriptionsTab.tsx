"use client";

import { useCallback, useEffect, useState } from "react";
import { api, czk, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

interface Subscription {
  id: number;
  customer_email: string;
  interval_days: number;
  status: string;
  next_order_at: string | null;
  item_count: number;
  discount_pct: number;
  created_at: string;
}

interface SubDetail {
  id: number;
  customer_email: string;
  interval_days: number;
  status: string;
  next_order_at: string | null;
  discount_pct: number;
  shipping_address: string | null;
  payment_method: string | null;
  items: SubItem[];
}

interface SubItem {
  id: number;
  title: string;
  variant_title: string | null;
  qty: number;
  unit_price_cents: number;
}

const STATUS_TABS: Array<{ key: string; label: string }> = [
  { key: "all", label: "Vse" },
  { key: "active", label: "Aktivni" },
  { key: "paused", label: "Pozastavene" },
  { key: "cancelled", label: "Zrusene" },
];

const STATUS_BADGE: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  paused: "border-amber-200 bg-amber-50 text-amber-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-600",
};
const STATUS_LABEL: Record<string, string> = { active: "Aktivni", paused: "Pozastaveno", cancelled: "Zruseno" };

export function SubscriptionsTab({ base, currency }: { base: string; currency: string }) {
  const t = useCommerceTheme();
  const [items, setItems] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SubDetail | null>(null);
  const [creating, setCreating] = useState(false);
  const perPage = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), perPage: String(perPage), status });
      const data = await api<{ items: Subscription[]; total: number }>(`${base}/subscriptions?${qs}`);
      setItems(data.items);
      setTotal(data.total);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Naciteni selhalo");
    } finally {
      setLoading(false);
    }
  }, [base, page, status]);

  useEffect(() => { load(); }, [load]);

  async function openDetail(id: number) {
    if (openId === id) { setOpenId(null); setDetail(null); return; }
    setOpenId(id);
    setDetail(null);
    try {
      const data = await api<{ subscription: SubDetail }>(`${base}/subscriptions/${id}`);
      setDetail(data.subscription);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Detail se nepodarilo nacist");
    }
  }

  async function patchSub(id: number, body: Record<string, unknown>) {
    try {
      const data = await api<{ subscription: SubDetail }>(`${base}/subscriptions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setDetail(data.subscription);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Aktualizace selhala");
    }
  }

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-4">
      <div className={t.tabBarCls}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatus(tab.key); setPage(1); }}
            className={status === tab.key ? t.tabActiveCls : t.tabInactiveCls}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={t.toolbarCls}>
        <button onClick={() => setCreating(!creating)} className={t.btnPrimary}>+ Nove predplatne</button>
        <span className="ml-auto text-[12px] font-semibold text-slate-500">{total} predplatnych</span>
      </div>

      <ErrorBanner message={error} />

      {creating && <SubForm base={base} theme={t} onSaved={() => { setCreating(false); load(); }} onCancel={() => setCreating(false)} />}

      <div className={t.tableShellCls}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className={t.tableHeadRowCls}>
              <th className="px-3 py-2 font-semibold">Zakaznik</th>
              <th className="px-3 py-2 font-semibold">Interval</th>
              <th className="px-3 py-2 font-semibold">Stav</th>
              <th className="px-3 py-2 font-semibold">Dalsi objednavka</th>
              <th className="px-3 py-2 font-semibold text-right">Polozek</th>
              <th className="px-3 py-2 font-semibold text-right">Sleva</th>
              <th className="px-3 py-2 font-semibold">Vytvoreno</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400">Nacitam...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className={t.emptyStateCls}>Zatim zadna predplatna.</td></tr>
            ) : items.map((s) => (
              <SubRow key={s.id} sub={s} currency={currency} theme={t}
                open={openId === s.id} detail={openId === s.id ? detail : null}
                onToggle={() => openDetail(s.id)} onPatch={(body) => patchSub(s.id, body)} />
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-3 flex items-center gap-2 text-[13px]">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={t.pagerBtnCls}>←</button>
          <span className="text-slate-600">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className={t.pagerBtnCls}>→</button>
        </div>
      )}
    </div>
  );
}

function SubRow({ sub, currency, theme: t, open, detail, onToggle, onPatch }: {
  sub: Subscription; currency: string; theme: ReturnType<typeof useCommerceTheme>;
  open: boolean; detail: SubDetail | null; onToggle: () => void;
  onPatch: (body: Record<string, unknown>) => void;
}) {
  return (
    <>
      <tr onClick={onToggle} className={`cursor-pointer ${t.tableRowCls} ${open ? t.expandedRowCls : ""}`}>
        <td className="px-3 py-2 text-slate-700">{sub.customer_email}</td>
        <td className="px-3 py-2 tabular-nums">{sub.interval_days} dni</td>
        <td className="px-3 py-2">
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[sub.status] ?? STATUS_BADGE.cancelled}`}>
            {STATUS_LABEL[sub.status] ?? sub.status}
          </span>
        </td>
        <td className="px-3 py-2 text-[12px] text-slate-500">{sub.next_order_at ? fmtDate(sub.next_order_at) : "—"}</td>
        <td className="px-3 py-2 text-right tabular-nums">{sub.item_count}</td>
        <td className="px-3 py-2 text-right tabular-nums">{sub.discount_pct > 0 ? `${sub.discount_pct} %` : "—"}</td>
        <td className="px-3 py-2 text-[12px] text-slate-500">{fmtDate(sub.created_at)}</td>
      </tr>
      {open && (
        <tr className={`border-b border-slate-100 ${t.expandedRowCls}`}>
          <td colSpan={7} className="px-4 py-4">
            {!detail ? (
              <div className="py-3 text-center text-[13px] text-gray-400">Nacitam detail...</div>
            ) : (
              <SubDetailPanel detail={detail} currency={currency} theme={t} onPatch={onPatch} />
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function SubDetailPanel({ detail, currency, theme: t, onPatch }: {
  detail: SubDetail; currency: string; theme: ReturnType<typeof useCommerceTheme>;
  onPatch: (body: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-blue-600">Dorucovaci adresa</div>
          <div className="text-[12.5px] text-slate-600">{detail.shipping_address ?? "Nenastavena"}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-blue-600">Platebni metoda</div>
          <div className="text-[12.5px] text-slate-600">{detail.payment_method ?? "Nenastavena"}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-blue-600">Sleva</div>
          <div className="text-[12.5px] text-slate-600">{detail.discount_pct > 0 ? `${detail.discount_pct} %` : "Zadna"}</div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-left text-[10.5px] uppercase text-slate-400 bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2 font-semibold">Polozka</th>
              <th className="px-3 py-2 font-semibold text-right">Mn.</th>
              <th className="px-3 py-2 font-semibold text-right">Cena za ks</th>
            </tr>
          </thead>
          <tbody>
            {detail.items.map((it) => (
              <tr key={it.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <div className="font-semibold text-slate-900">{it.title}</div>
                  {it.variant_title && <div className="text-[11px] text-slate-400">{it.variant_title}</div>}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{it.qty} ks</td>
                <td className="px-3 py-2 text-right tabular-nums">{czk(it.unit_price_cents, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        {detail.status === "active" && (
          <>
            <button onClick={() => onPatch({ status: "paused" })} className={t.btnGhost}>Pozastavit</button>
            <button onClick={() => { if (confirm("Opravdu zrusit predplatne?")) onPatch({ status: "cancelled" }); }} className={t.btnDanger}>Zrusit</button>
          </>
        )}
        {detail.status === "paused" && (
          <>
            <button onClick={() => onPatch({ status: "active" })} className={t.btnPrimary}>Obnovit</button>
            <button onClick={() => { if (confirm("Opravdu zrusit predplatne?")) onPatch({ status: "cancelled" }); }} className={t.btnDanger}>Zrusit</button>
          </>
        )}
      </div>
    </div>
  );
}

function SubForm({ base, theme: t, onSaved, onCancel }: {
  base: string; theme: ReturnType<typeof useCommerceTheme>;
  onSaved: () => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({ email: "", interval_days: "30", discount_pct: "0" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await api(`${base}/subscriptions`, {
        method: "POST",
        body: JSON.stringify({
          customer_email: form.email,
          interval_days: Number(form.interval_days),
          discount_pct: Number(form.discount_pct),
        }),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vytvoreni selhalo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={`${t.sectionCls} space-y-4`}>
      <h3 className={t.sectionTitleCls}>Nove predplatne</h3>
      <ErrorBanner message={error} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={t.labelCls}>E-mail zakaznika</label>
          <input type="email" value={form.email} onChange={set("email")} required placeholder="jan@example.cz" className={t.inputCls} />
        </div>
        <div>
          <label className={t.labelCls}>Interval (dny)</label>
          <input type="number" value={form.interval_days} onChange={set("interval_days")} required min={1} placeholder="30" className={t.inputCls} />
        </div>
        <div>
          <label className={t.labelCls}>Sleva (%)</label>
          <input type="number" value={form.discount_pct} onChange={set("discount_pct")} min={0} max={100} placeholder="0" className={t.inputCls} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={busy} className={t.btnPrimary}>{busy ? "Vytvářím…" : "Vytvořit předplatné"}</button>
        <button type="button" onClick={onCancel} className={t.btnGhost}>Zrušit</button>
      </div>
    </form>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { api, czk, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

interface GiftCard {
  id: number;
  code: string;
  initial_amount_cents: number;
  remaining_cents: number;
  purchaser_email: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  message: string | null;
  status: string;
  created_at: string;
  expires_at: string | null;
  transactions?: GiftCardTx[];
}

interface GiftCardTx {
  id: number;
  amount_cents: number;
  type: string;
  description: string | null;
  created_at: string;
}

function balanceColor(remaining: number, initial: number) {
  if (initial === 0) return "text-slate-500";
  const pct = remaining / initial;
  if (pct > 0.5) return "text-emerald-600";
  if (pct >= 0.1) return "text-amber-600";
  return "text-rose-600";
}

const STATUS_BADGE: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-500",
  expired: "border-rose-200 bg-rose-50 text-rose-600",
};
const STATUS_LABEL: Record<string, string> = { active: "Aktivní", inactive: "Neaktivní", expired: "Vypršela" };

export function GiftCardsTab({ base, currency }: { base: string; currency: string }) {
  const t = useCommerceTheme();
  const [items, setItems] = useState<GiftCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const perPage = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), perPage: String(perPage) });
      const data = await api<{ items: GiftCard[]; total: number }>(`${base}/gift-cards?${qs}`);
      setItems(data.items);
      setTotal(data.total);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Naciteni selhalo");
    } finally {
      setLoading(false);
    }
  }, [base, page]);

  useEffect(() => { load(); }, [load]);

  async function toggleDetail(card: GiftCard) {
    if (openId === card.id) { setOpenId(null); return; }
    setOpenId(card.id);
    if (!card.transactions) {
      try {
        const data = await api<{ transactions: GiftCardTx[] }>(`${base}/gift-cards/${card.id}/transactions`);
        setItems((prev) => prev.map((c) => c.id === card.id ? { ...c, transactions: data.transactions } : c));
      } catch { /* silent */ }
    }
  }

  async function deactivate(id: number) {
    if (!confirm("Opravdu deaktivovat tuto dárkovou kartu?")) return;
    try {
      await api(`${base}/gift-cards/${id}`, { method: "PATCH", body: JSON.stringify({ status: "inactive" }) });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deaktivace selhala");
    }
  }

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-5">
      <div className={t.toolbarCls}>
        <button onClick={() => setCreating(!creating)} className={t.btnPrimary}>+ Nova darkova karta</button>
        <span className="ml-auto text-[12px] font-semibold text-slate-500">{total} karet</span>
      </div>

      <ErrorBanner message={error} />

      {creating && <GiftCardForm base={base} theme={t} onSaved={() => { setCreating(false); load(); }} onCancel={() => setCreating(false)} />}

      <div className={t.tableShellCls}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className={t.tableHeadRowCls}>
              <th className="px-3 py-2 font-semibold">Kod</th>
              <th className="px-3 py-2 font-semibold text-right">Pocatecni castka</th>
              <th className="px-3 py-2 font-semibold text-right">Zustatek</th>
              <th className="px-3 py-2 font-semibold">Kupujici</th>
              <th className="px-3 py-2 font-semibold">Prijemce</th>
              <th className="px-3 py-2 font-semibold">Stav</th>
              <th className="px-3 py-2 font-semibold">Vytvoreno</th>
              <th className="px-3 py-2 font-semibold">Expirace</th>
              <th className="px-3 py-2 w-20" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-400">Nacitam...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={9} className={t.emptyStateCls}>Zatim zadne darkove karty.</td></tr>
            ) : items.map((c) => (
              <GiftCardRow key={c.id} card={c} currency={currency} theme={t}
                open={openId === c.id} onToggle={() => toggleDetail(c)} onDeactivate={() => deactivate(c.id)} />
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

function GiftCardRow({ card: c, currency, theme: t, open, onToggle, onDeactivate }: {
  card: GiftCard; currency: string; theme: ReturnType<typeof useCommerceTheme>;
  open: boolean; onToggle: () => void; onDeactivate: () => void;
}) {
  return (
    <>
      <tr onClick={onToggle} className={`cursor-pointer ${t.tableRowCls} ${open ? t.expandedRowCls : ""}`}>
        <td className="px-3 py-2 font-mono font-bold tracking-wide">{c.code}</td>
        <td className="px-3 py-2 text-right tabular-nums">{czk(c.initial_amount_cents, currency)}</td>
        <td className={`px-3 py-2 text-right tabular-nums font-semibold ${balanceColor(c.remaining_cents, c.initial_amount_cents)}`}>
          {czk(c.remaining_cents, currency)}
        </td>
        <td className="px-3 py-2 text-slate-600 text-[12px]">{c.purchaser_email ?? "—"}</td>
        <td className="px-3 py-2 text-slate-600 text-[12px]">{c.recipient_email ?? "—"}</td>
        <td className="px-3 py-2">
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[c.status] ?? STATUS_BADGE.inactive}`}>
            {STATUS_LABEL[c.status] ?? c.status}
          </span>
        </td>
        <td className="px-3 py-2 text-[12px] text-slate-500">{fmtDate(c.created_at)}</td>
        <td className="px-3 py-2 text-[12px] text-slate-500">{c.expires_at ? fmtDate(c.expires_at) : "—"}</td>
        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
          {c.status === "active" && (
            <button onClick={onDeactivate} className={`${t.btnGhost} !h-7 !px-2.5 !text-[11px] hover:!text-rose-600`}>Deaktivovat</button>
          )}
        </td>
      </tr>
      {open && (
        <tr className={`border-b border-slate-100 ${t.expandedRowCls}`}>
          <td colSpan={9} className="px-4 py-4">
            {c.message && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
                {c.message}
              </div>
            )}
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Historie transakcí</div>
            {!c.transactions ? (
              <div className="py-3 text-center text-[13px] text-gray-400">Nacitam...</div>
            ) : c.transactions.length === 0 ? (
              <div className="text-[12.5px] text-slate-400">Zadne transakce.</div>
            ) : (
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10.5px] uppercase text-slate-400 border-b border-slate-200">
                    <th className="px-2 py-1.5 font-semibold">Datum</th>
                    <th className="px-2 py-1.5 font-semibold">Typ</th>
                    <th className="px-2 py-1.5 font-semibold text-right">Castka</th>
                    <th className="px-2 py-1.5 font-semibold">Popis</th>
                  </tr>
                </thead>
                <tbody>
                  {c.transactions.map((tx) => (
                    <tr key={tx.id} className="border-t border-slate-100">
                      <td className="px-2 py-1.5 text-slate-500">{fmtDate(tx.created_at)}</td>
                      <td className="px-2 py-1.5 text-slate-600">{tx.type}</td>
                      <td className={`px-2 py-1.5 text-right tabular-nums font-semibold ${tx.amount_cents < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {tx.amount_cents < 0 ? "−" : "+"}{czk(Math.abs(tx.amount_cents), currency)}
                      </td>
                      <td className="px-2 py-1.5 text-slate-500">{tx.description ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function GiftCardForm({ base, theme: t, onSaved, onCancel }: {
  base: string; theme: ReturnType<typeof useCommerceTheme>;
  onSaved: () => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({ amount: "", recipient_email: "", recipient_name: "", message: "", expires_at: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await api(`${base}/gift-cards`, {
        method: "POST",
        body: JSON.stringify({
          initial_amount_cents: Math.round(Number(form.amount) * 100),
          recipient_email: form.recipient_email || null,
          recipient_name: form.recipient_name || null,
          message: form.message || null,
          expires_at: form.expires_at || null,
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
      <h3 className={t.sectionTitleCls}>Nova darkova karta</h3>
      <ErrorBanner message={error} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={t.labelCls}>Castka (Kc)</label>
          <input type="number" value={form.amount} onChange={set("amount")} required min={1} step={1} placeholder="1000" className={t.inputCls} />
        </div>
        <div>
          <label className={t.labelCls}>E-mail prijemce</label>
          <input type="email" value={form.recipient_email} onChange={set("recipient_email")} placeholder="jan@example.cz" className={t.inputCls} />
        </div>
        <div>
          <label className={t.labelCls}>Jmeno prijemce</label>
          <input value={form.recipient_name} onChange={set("recipient_name")} placeholder="Jan Novak" className={t.inputCls} />
        </div>
        <div>
          <label className={t.labelCls}>Expirace</label>
          <input type="date" value={form.expires_at} onChange={set("expires_at")} className={t.inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={t.labelCls}>Zprava</label>
          <input value={form.message} onChange={set("message")} placeholder="Vsechno nejlepsi k narozeninam!" className={t.inputCls} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={busy} className={t.btnPrimary}>{busy ? "Vytvářím…" : "Vytvořit kartu"}</button>
        <button type="button" onClick={onCancel} className={t.btnGhost}>Zrušit</button>
      </div>
    </form>
  );
}

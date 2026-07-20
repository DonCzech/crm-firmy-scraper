"use client";

import { useCallback, useEffect, useState } from "react";
import { api, czk, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

interface CustomerItem {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  marketing_consent: boolean;
  created_at: string;
  order_count: number;
  total_spent_cents: number;
  last_order_at: string | null;
}

export function CustomersTab({ base, currency }: { base: string; currency: string }) {
  const theme = useCommerceTheme();
  const [items, setItems] = useState<CustomerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const perPage = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), perPage: String(perPage) });
      if (search) qs.set("search", search);
      const data = await api<{ items: CustomerItem[]; total: number }>(`${base}/customers?${qs}`);
      setItems(data.items);
      setTotal(data.total);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Načtení selhalo");
    } finally {
      setLoading(false);
    }
  }, [base, page, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <div className={theme.toolbarCls}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Hledat e-mail, jméno, telefon…"
          className={`${theme.inputCls} w-80`}
        />
        <span className="ml-auto text-[12px] font-semibold text-slate-500">{total} zákazníků</span>
      </div>

      <ErrorBanner message={error} />

      <div className={theme.tableShellCls}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className={theme.tableHeadRowCls}>
              <th className="px-3 py-2 font-semibold">Zákazník</th>
              <th className="px-3 py-2 font-semibold">Telefon</th>
              <th className="px-3 py-2 font-semibold text-right">Objednávky</th>
              <th className="px-3 py-2 font-semibold text-right">Utraceno</th>
              <th className="px-3 py-2 font-semibold">Poslední objednávka</th>
              <th className="px-3 py-2 font-semibold">Newsletter</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-400">Načítám…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-10 text-center text-gray-400">
                Zatím žádní zákazníci — vzniknou automaticky s první objednávkou.
              </td></tr>
            ) : items.map((c) => {
              const name = [c.first_name, c.last_name].filter(Boolean).join(" ");
              return (
                <tr key={c.id} className={theme.tableRowCls}>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-900">{c.email}</div>
                    {name && <div className="text-[11.5px] text-slate-400">{name}</div>}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{c.phone ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{c.order_count}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-900">{czk(c.total_spent_cents, currency)}</td>
                  <td className="px-3 py-2 text-[12px] text-slate-500">{fmtDate(c.last_order_at)}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11.5px] font-semibold ${c.marketing_consent ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}>
                      {c.marketing_consent ? "Ano" : "Ne"}
                    </span>
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
    </div>
  );
}

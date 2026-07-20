"use client";

import { useCallback, useEffect, useState } from "react";
import { api, czk, fmtDate, ErrorBanner, useCommerceTheme } from "./shared";

interface InvoiceRow {
  id: number;
  invoice_number: string;
  invoice_type: string;
  issued_at: string;
  due_date: string;
  customer_name: string;
  total_cents: number;
  currency: string;
  status: string;
  order_id: number | null;
}

const TYPE_TABS: Array<{ key: string; label: string; icon: string }> = [
  { key: "all", label: "Všechny doklady", icon: "📋" },
  { key: "invoice", label: "Daňové doklady", icon: "🧾" },
  { key: "proforma", label: "Zálohové faktury", icon: "📝" },
  { key: "credit_note", label: "Dobropisy", icon: "↩️" },
  { key: "delivery_note", label: "Dodací listy", icon: "📦" },
];

const TYPE_LABEL: Record<string, string> = {
  invoice: "Faktura",
  proforma: "Záloha",
  credit_note: "Dobropis",
  delivery_note: "Dodací list",
};

const STATUS_COLORS: Record<string, string> = {
  issued: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  paid: "border-blue-200 bg-blue-50 text-blue-700",
};

export function DocumentsTab({ base, currency }: { base: string; currency: string }) {
  const theme = useCommerceTheme();
  const [items, setItems] = useState<InvoiceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const perPage = 50;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), perPage: String(perPage) });
      if (type !== "all") qs.set("type", type);
      const data = await api<{ items: InvoiceRow[]; total: number }>(`${base}/invoices?${qs}`);
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Načtení selhalo");
    } finally {
      setLoading(false);
    }
  }, [base, page, type]);

  useEffect(() => { load(); }, [load]);

  const pages = Math.max(1, Math.ceil(total / perPage));

  async function cancelInvoice(id: number) {
    if (!window.confirm("Opravdu stornovat tento doklad?")) return;
    try {
      await api(`${base}/invoices/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Storno selhalo");
    }
  }

  return (
    <div>
      {/* Type tabs */}
      <div className={`mb-4 ${theme.tabBarCls}`}>
        {TYPE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setType(t.key); setPage(1); }}
            className={type === t.key ? theme.tabActiveCls : theme.tabInactiveCls}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={theme.toolbarCls}>
        <span className="text-[12px] font-semibold text-slate-500">{total} dokladů</span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => {
            const qs = new URLSearchParams();
            if (type !== "all") qs.set("type", type);
            window.open(`${base}/invoices/export?${qs}`, "_blank");
          }} className={`${theme.btnGhost} gap-1.5`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className={theme.tableShellCls}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className={theme.tableHeadRowCls}>
              <th className="px-3 py-2 font-semibold">Číslo dokladu</th>
              <th className="px-3 py-2 font-semibold">Typ</th>
              <th className="px-3 py-2 font-semibold">Vystaveno</th>
              <th className="px-3 py-2 font-semibold">Splatnost</th>
              <th className="px-3 py-2 font-semibold">Odběratel</th>
              <th className="px-3 py-2 font-semibold text-right">Částka</th>
              <th className="px-3 py-2 font-semibold">Stav</th>
              <th className="px-3 py-2 font-semibold">Akce</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-400">Načítám…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-10 text-center text-gray-400">
                Zatím žádné doklady. Doklady se vytvoří automaticky z objednávek.
              </td></tr>
            ) : items.map((inv) => (
              <tr key={inv.id} className={theme.tableRowCls}>
                <td className={`px-3 py-2 font-mono text-[12px] font-bold ${theme.linkAccentCls}`}>
                  {inv.invoice_number}
                </td>
                <td className="px-3 py-2 text-[12px]">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {TYPE_LABEL[inv.invoice_type] ?? inv.invoice_type}
                  </span>
                </td>
                <td className="px-3 py-2 text-[12px] text-slate-600">{fmtDate(inv.issued_at)}</td>
                <td className="px-3 py-2 text-[12px] text-slate-600">{fmtDate(inv.due_date)}</td>
                <td className="px-3 py-2 text-slate-700 truncate max-w-[180px]">{inv.customer_name}</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">{czk(inv.total_cents, inv.currency)}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[inv.status] ?? "border-slate-200 bg-slate-50 text-slate-600"}`}>
                    {inv.status === "issued" ? "Vystaveno" : inv.status === "cancelled" ? "Stornováno" : inv.status === "paid" ? "Zaplaceno" : inv.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => window.open(`${base}/invoices/${inv.id}/pdf`, "_blank")}
                      className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-600 transition-all duration-150 hover:bg-slate-50 hover:shadow-sm"
                      title="Zobrazit doklad"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Náhled
                    </button>
                    {inv.status === "issued" && (
                      <button
                        onClick={() => cancelInvoice(inv.id)}
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-rose-200 px-2.5 text-[11px] font-semibold text-rose-600 transition-all duration-150 hover:bg-rose-50 hover:shadow-sm"
                        title="Stornovat doklad"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        Storno
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
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

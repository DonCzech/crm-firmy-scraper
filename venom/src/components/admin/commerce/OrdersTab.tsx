"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  api, czk, fmtDate, ErrorBanner, StatusBadge,
  ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, ORDER_NEXT,
  useCommerceTheme, usePageChrome,
  type OrderRow, type OrderDetailData, type OrderAddressData,
} from "./shared";

const STATUS_TABS: Array<{ key: string; label: string; color: string }> = [
  { key: "all", label: "Všechny", color: "bg-slate-400" },
  { key: "pending", label: "Nevyřízená", color: "bg-amber-500" },
  { key: "confirmed", label: "Potvrzená", color: "bg-blue-500" },
  { key: "processing", label: "Vyřizuje se", color: "bg-violet-500" },
  { key: "shipped", label: "Odeslaná", color: "bg-sky-500" },
  { key: "completed", label: "Vyřízená", color: "bg-emerald-500" },
  { key: "cancelled", label: "Stornovaná", color: "bg-rose-500" },
];

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  gopay: "Platba kartou online",
  bank_transfer: "Bankovní převod",
  cod: "Dobírka",
};

function paymentDotColor(status: string): string {
  return status === "paid" ? "bg-emerald-500"
    : status === "failed" ? "bg-rose-500"
    : status === "refunded" || status === "partially_refunded" ? "bg-orange-500"
    : status === "authorized" ? "bg-blue-500"
    : "bg-slate-400";
}

const PAYMENT_PILL: Record<string, string> = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  authorized: "border-blue-200 bg-blue-50 text-blue-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
  refunded: "border-orange-200 bg-orange-50 text-orange-700",
  partially_refunded: "border-orange-200 bg-orange-50 text-orange-700",
};

function PaymentPill({ status }: { status: string }) {
  const cls = PAYMENT_PILL[status] ?? "border-slate-200 bg-slate-50 text-slate-600";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${paymentDotColor(status)}`} />
      {PAYMENT_STATUS_LABEL[status] ?? status}
    </span>
  );
}

/** Iniciály pro avatar — "Karel Novák" → "KN", jinak první písmena e-mailu. */
function initials(name: string | null | undefined, email: string): string {
  const src = name?.trim() || email;
  const parts = src.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function Avatar({ name, email, accent, size = 30 }: { name: string | null | undefined; email: string; accent: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold"
      style={{
        width: size, height: size, fontSize: size * 0.36,
        color: accent,
        background: `linear-gradient(135deg, ${accent}24, ${accent}10)`,
        boxShadow: `inset 0 0 0 1px ${accent}2e`,
      }}
    >
      {initials(name, email)}
    </span>
  );
}

/** Animace hover karty a detailu — scoped keyframes, ať neladí s globálním CSS. */
const ORDERS_KEYFRAMES = `
@keyframes wcPopIn {
  0% { opacity: 0; transform: translateY(6px) scale(0.985); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.wc-pop-in { animation: wcPopIn 0.16s cubic-bezier(0.16,1,0.3,1) both; transform-origin: bottom left; }
@keyframes wcDetailIn {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}
.wc-detail-in { animation: wcDetailIn 0.32s cubic-bezier(0.16,1,0.3,1) both; }
.wc-detail-in-1 { animation: wcDetailIn 0.32s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
.wc-detail-in-2 { animation: wcDetailIn 0.32s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
@keyframes wcStepPop {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.wc-step-pop { animation: wcStepPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
`;

/** "Zásilkovna — výdejní místo + Dobírka" → "Zásilkovna" (pro sloupec v seznamu). */
function carrierShort(method: string | null): string {
  if (!method) return "—";
  return method.split(" + ")[0].split(" — ")[0].trim();
}

function customerName(order: OrderRow): string {
  return order.billing_address?.name?.trim() || order.email;
}

function addressLines(a: OrderAddressData | null | undefined): string[] {
  if (!a) return [];
  const lines: string[] = [];
  if (a.name) lines.push(a.name);
  if (a.company) lines.push(a.company);
  if (a.street) lines.push(a.street);
  const cityLine = [a.zip, a.city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  if (a.country && a.country.toUpperCase() !== "CZ") lines.push(a.country);
  if (a.ico) lines.push(`IČO: ${a.ico}`);
  if (a.dic) lines.push(`DIČ: ${a.dic}`);
  return lines;
}

function sameAddress(a: OrderAddressData | null | undefined, b: OrderAddressData | null | undefined): boolean {
  const keys: Array<keyof OrderAddressData> = ["name", "company", "street", "city", "zip", "country"];
  return keys.every((k) => (a?.[k] ?? "") === (b?.[k] ?? ""));
}

// ── Ikony (inline SVG, 14px, currentColor) ────────────────────────────────────

function Icon({ d, className, style }: { d: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}
      strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-3.5 w-3.5 shrink-0"} style={style} aria-hidden>
      <path d={d} />
    </svg>
  );
}

function ProductThumb({ url, title, size = 34 }: { url: string | null | undefined; title: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/5 bg-slate-50"
      style={{ width: size, height: size }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={title} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <Icon d={IC.box} className="h-3.5 w-3.5 text-slate-300" />
      )}
    </span>
  );
}
const IC = {
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  mail: "M4 6h16v12H4z M4 7l8 6 8-6",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.5 2.8.7a2 2 0 0 1 1.7 2Z",
  pin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  box: "M21 8 12 3 3 8v8l9 5 9-5V8Z M3 8l9 5 9-5 M12 13v8",
  truck: "M1 3h15v13H1z M16 8h4l3 3v5h-7V8Z M5.5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M18.5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  card: "M2 5h20v14H2z M2 10h20",
  hash: "M4 9h16 M4 15h16 M10 3 8 21 M16 3l-2 18",
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18 M6 6l12 12",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h6",
  printer: "M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z",
  download: "M12 3v12 M7 10l5 5 5-5 M4 21h16",
};

/** Kroky vyřízení objednávky pro stepper v detailu. */
const ORDER_STEPS: Array<{ key: string; label: string }> = [
  { key: "pending", label: "Přijata" },
  { key: "confirmed", label: "Potvrzena" },
  { key: "processing", label: "Vyřizuje se" },
  { key: "shipped", label: "Odeslána" },
  { key: "completed", label: "Vyřízena" },
];

function OrderStepper({ status, accent }: { status: string; accent: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
          <Icon d={IC.x} className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[13px] font-bold text-rose-700">Objednávka stornována</div>
          <div className="text-[11.5px] text-rose-500">Rezervované zboží bylo vráceno na sklad.</div>
        </div>
      </div>
    );
  }

  const current = ORDER_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center">
      {ORDER_STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === ORDER_STEPS.length - 1;
        return (
          <div key={step.key} className={`flex items-center ${last ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all ${active ? "wc-step-pop" : ""}`}
                style={
                  done ? { background: accent, color: "#fff" }
                  : active ? { background: accent, color: "#fff", boxShadow: `0 0 0 4px ${accent}26` }
                  : { background: "rgba(0,0,0,0.05)", color: "#94a3b8" }
                }
              >
                {done ? <Icon d={IC.check} className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className="whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: done || active ? accent : "#a8adb8" }}
              >
                {step.label}
              </span>
            </div>
            {!last && (
              <span
                className="mx-2 mb-5 h-[2px] flex-1 rounded-full"
                style={{ background: i < current ? accent : "rgba(0,0,0,0.07)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Hlavní tab — seznam s hover náhledem + detail po rozkliknutí
// ══════════════════════════════════════════════════════════════════════════════

export function OrdersTab({ base, currency }: { base: string; currency: string }) {
  const theme = useCommerceTheme();
  const [items, setItems] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const perPage = 50;

  // Detail po rozkliknutí (nahrazuje seznam)
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OrderDetailData | null>(null);

  // Celostránkový detail nepotřebuje velkou hlavičku stránky — schová ji, získá prostor
  const { setPageHeaderHidden } = usePageChrome();
  useEffect(() => {
    setPageHeaderHidden(detailId !== null);
    return () => setPageHeaderHidden(false);
  }, [detailId, setPageHeaderHidden]);

  // Hover náhled
  const [hover, setHover] = useState<{ id: number; top: number; above: boolean } | null>(null);
  const [hoverData, setHoverData] = useState<OrderDetailData | null>(null);
  const detailCache = useRef(new Map<number, OrderDetailData>());
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), perPage: String(perPage), status });
      if (search) qs.set("search", search);
      const data = await api<{ items: OrderRow[]; total: number }>(`${base}/orders?${qs}`);
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Načtení selhalo");
    } finally {
      setLoading(false);
    }
  }, [base, page, status, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const fetchDetail = useCallback(async (id: number): Promise<OrderDetailData | null> => {
    const cached = detailCache.current.get(id);
    if (cached) return cached;
    try {
      const data = await api<{ order: OrderDetailData }>(`${base}/orders/${id}`);
      detailCache.current.set(id, data.order);
      return data.order;
    } catch {
      return null;
    }
  }, [base]);

  // ── Hover náhled ────────────────────────────────────────────────────────────

  function clearTimers() {
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  }

  function onRowEnter(id: number, e: React.MouseEvent<HTMLTableRowElement>) {
    clearTimers();
    const rowRect = e.currentTarget.getBoundingClientRect();
    const shellRect = shellRef.current?.getBoundingClientRect();
    if (!shellRect) return;
    // Vždy NAD řádkem — pod řádkem se u spodních objednávek nevešel na obrazovku
    const top = rowRect.top - shellRect.top - 6;
    hoverTimer.current = setTimeout(async () => {
      setHover({ id, top, above: true });
      setHoverData(detailCache.current.get(id) ?? null);
      const d = await fetchDetail(id);
      if (d) setHoverData(d);
    }, 320);
  }

  function onRowLeave() {
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    hideTimer.current = setTimeout(() => setHover(null), 160);
  }

  // ── Detail ──────────────────────────────────────────────────────────────────

  async function openDetail(id: number) {
    clearTimers();
    setHover(null);
    setDetailId(id);
    setDetail(detailCache.current.get(id) ?? null);
    const d = await fetchDetail(id);
    if (d) setDetail(d);
    else setError("Detail se nepodařilo načíst");
  }

  function closeDetail() {
    setDetailId(null);
    setDetail(null);
    load();
  }

  async function patchOrder(id: number, body: Record<string, unknown>) {
    try {
      const data = await api<{ order: OrderDetailData }>(`${base}/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      detailCache.current.set(id, data.order);
      if (detailId === id) setDetail(data.order);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Aktualizace selhala");
    }
  }

  const pages = Math.max(1, Math.ceil(total / perPage));

  function toggleAll() {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((o) => o.id)));
  }

  function toggleOne(id: number) {
    setSelected((prev) => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
  }

  async function bulkAction(action: string) {
    if (selected.size === 0 || bulkBusy) return;
    setBulkBusy(true);
    try {
      await api(`${base}/orders/bulk`, {
        method: "POST",
        body: JSON.stringify({ action, orderIds: [...selected] }),
      });
      detailCache.current.clear();
      setSelected(new Set());
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk akce selhala");
    } finally {
      setBulkBusy(false);
    }
  }

  function exportCSV() {
    const qs = new URLSearchParams();
    if (status !== "all") qs.set("status", status);
    window.open(`${base}/orders/export?${qs}`, "_blank");
  }

  // ── Detail view ─────────────────────────────────────────────────────────────

  if (detailId !== null) {
    const idx = items.findIndex((o) => o.id === detailId);
    return (
      <div>
        <style>{ORDERS_KEYFRAMES}</style>
        <ErrorBanner message={error} />
        <OrderDetailView
          detail={detail}
          currency={currency}
          base={base}
          onBack={closeDetail}
          onStatus={(s) => patchOrder(detailId, { status: s })}
          onPayment={(s) => patchOrder(detailId, { payment_status: s })}
          onPrev={idx > 0 ? () => openDetail(items[idx - 1].id) : undefined}
          onNext={idx >= 0 && idx < items.length - 1 ? () => openDetail(items[idx + 1].id) : undefined}
        />
      </div>
    );
  }

  // ── List view ───────────────────────────────────────────────────────────────

  return (
    <div>
      <style>{ORDERS_KEYFRAMES}</style>
      {/* Status tabs */}
      <div className={`mb-4 ${theme.tabBarCls}`}>
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setStatus(t.key); setPage(1); }}
            className={`inline-flex items-center gap-1.5 ${status === t.key ? theme.tabActiveCls : theme.tabInactiveCls}`}
          >
            <span className={`h-2 w-2 rounded-full ${t.color}`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className={theme.toolbarCls}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Číslo objednávky, e-mail, jméno…"
          className={`${theme.inputCls} w-80`}
        />

        {/* FUNKCE dropdown */}
        <div className="group relative">
          <button className={`${theme.btnGhost} gap-1`}>Funkce ▾</button>
          <div className={`invisible group-hover:visible ${theme.dropdownCls}`}>
            <button onClick={exportCSV} className={theme.dropdownItemCls}>📥 Export CSV</button>
            {selected.size > 0 && (
              <>
                <hr className="my-1 border-slate-100" />
                <button onClick={() => bulkAction("confirm")} disabled={bulkBusy} className={theme.dropdownItemCls}>Potvrdit vybrané</button>
                <button onClick={() => bulkAction("ship")} disabled={bulkBusy} className={theme.dropdownItemCls}>Odeslat vybrané</button>
                <button onClick={() => bulkAction("complete")} disabled={bulkBusy} className={theme.dropdownItemCls}>Dokončit vybrané</button>
                <button onClick={() => bulkAction("cancel")} disabled={bulkBusy} className={`${theme.dropdownItemCls} !text-rose-600`}>Stornovat vybrané</button>
              </>
            )}
          </div>
        </div>

        <span className="ml-auto text-[12px] font-semibold text-slate-500">{total} objednávek</span>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-[13px]">
          <span className="font-semibold text-emerald-800">Vybráno: {selected.size}</span>
          <button onClick={() => bulkAction("confirm")} disabled={bulkBusy}
            className="rounded-md border border-emerald-200 bg-white px-3 py-1 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-50">Potvrdit</button>
          <button onClick={() => bulkAction("ship")} disabled={bulkBusy}
            className="rounded-md border border-emerald-200 bg-white px-3 py-1 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-50">Odeslat</button>
          <button onClick={() => bulkAction("complete")} disabled={bulkBusy}
            className="rounded-md border border-emerald-200 bg-white px-3 py-1 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-50">Dokončit</button>
          <button onClick={() => bulkAction("cancel")} disabled={bulkBusy}
            className="rounded-md border border-rose-200 bg-white px-3 py-1 text-[12px] font-semibold text-rose-600 hover:bg-rose-50">Stornovat</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-[12px] text-gray-400 hover:text-gray-600">✕ Zrušit výběr</button>
        </div>
      )}

      <ErrorBanner message={error} />

      <div ref={shellRef} className="relative">
        <div className={theme.tableShellCls}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className={theme.tableHeadRowCls}>
                <th className="w-8 px-3 py-2"><input type="checkbox" className={theme.checkboxAccentCls} checked={items.length > 0 && selected.size === items.length} onChange={toggleAll} /></th>
                <th className="px-3 py-2 font-semibold">Kód a datum</th>
                <th className="px-3 py-2 font-semibold">Zákazník</th>
                <th className="px-3 py-2 font-semibold">Doprava</th>
                <th className="px-3 py-2 font-semibold">Platba</th>
                <th className="px-3 py-2 font-semibold">Stav</th>
                <th className="px-3 py-2 text-right font-semibold">Cena</th>
                <th className="px-3 py-2 font-semibold">Kanál</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-400">Načítám…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-10 text-center text-gray-400">
                  Zatím žádné objednávky — po spuštění checkoutu se objeví tady.
                </td></tr>
              ) : items.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => openDetail(o.id)}
                  onMouseEnter={(e) => onRowEnter(o.id, e)}
                  onMouseLeave={onRowLeave}
                  className={`cursor-pointer ${theme.tableRowCls}`}
                >
                  <td className="w-8 px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className={theme.checkboxAccentCls} checked={selected.has(o.id)} onChange={() => toggleOne(o.id)} />
                  </td>
                  <td className="px-3 py-2">
                    <div className={`font-mono text-[12px] font-bold ${theme.linkAccentCls}`}>{o.order_number}</div>
                    <div className="text-[11px] text-slate-400">{fmtDate(o.placed_at)}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={o.billing_address?.name} email={o.email} accent={theme.accentColor} />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-800">{customerName(o)}</div>
                        {o.billing_address?.name && <div className="truncate text-[11px] text-slate-400">{o.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[12px] text-slate-500">{carrierShort(o.shipping_method)}</td>
                  <td className="px-3 py-2"><PaymentPill status={o.payment_status} /></td>
                  <td className="px-3 py-2"><StatusBadge value={o.status} map={ORDER_STATUS_LABEL} /></td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-900">{czk(o.total_cents, currency)}</td>
                  <td className="px-3 py-2 text-[12px] text-slate-500">E-shop</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hover náhled objednávky */}
        {hover && (
          <div
            onMouseEnter={clearTimers}
            onMouseLeave={() => setHover(null)}
            style={{ top: hover.top, transform: hover.above ? "translateY(-100%)" : undefined }}
            className="absolute left-10 z-40 w-[580px] max-w-[calc(100%-3rem)]"
          >
            <div className="wc-pop-in">
            <OrderHoverCard
              order={items.find((o) => o.id === hover.id) ?? null}
              detail={hoverData?.id === hover.id ? hoverData : null}
              currency={currency}
              onOpen={() => openDetail(hover.id)}
            />
            </div>
          </div>
        )}
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

// ══════════════════════════════════════════════════════════════════════════════
// Hover náhled — karta dle Shoptet mockupu (najedu-objednavku.png)
// ══════════════════════════════════════════════════════════════════════════════

function OrderHoverCard({ order, detail, currency, onOpen }: {
  order: OrderRow | null;
  detail: OrderDetailData | null;
  currency: string;
  onOpen: () => void;
}) {
  const theme = useCommerceTheme();
  if (!order) return null;
  const addr = order.billing_address;
  const addrLine = [addr?.street, [addr?.zip, addr?.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const phone = order.phone ?? addr?.phone;
  const accent = { color: theme.accentColor };

  return (
    <div className={theme.popoverShellCls}>
      {/* Zákazník */}
      <div className={`space-y-1.5 px-4 py-3 text-[12.5px] text-slate-700 ${theme.popoverTintCls}`}>
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <Icon d={IC.user} className="h-3.5 w-3.5 shrink-0" style={accent} />
          {addr?.name || order.email}
          {addr?.company && <span className="font-normal text-slate-500">({addr.company})</span>}
        </div>
        <div className="flex items-center gap-2">
          <Icon d={IC.mail} className="h-3.5 w-3.5 shrink-0" style={accent} />
          <span className="font-medium" style={accent}>{order.email}</span>
        </div>
        {phone && (
          <div className="flex items-center gap-2">
            <Icon d={IC.phone} className="h-3.5 w-3.5 shrink-0" style={accent} />
            {phone}
          </div>
        )}
        {addrLine && (
          <div className="flex items-center gap-2">
            <Icon d={IC.pin} className="h-3.5 w-3.5 shrink-0" style={accent} />
            {addrLine}
          </div>
        )}
      </div>

      {/* Souhrnný pás */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-black/5 px-4 py-2.5 text-[12px] text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Icon d={IC.box} className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          {order.item_count} ks
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${paymentDotColor(order.payment_status)}`} />
          {PAYMENT_STATUS_LABEL[order.payment_status] ?? order.payment_status}
        </span>
        {order.shipping_method && (
          <span className="inline-flex items-center gap-1.5">
            <Icon d={IC.truck} className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {order.shipping_method}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Icon d={IC.card} className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          {ORDER_STATUS_LABEL[order.status] ?? order.status}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon d={IC.hash} className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          {order.order_number}
        </span>
      </div>

      {/* Položky */}
      {!detail ? (
        <div className="px-4 py-4 text-center text-[12px] text-slate-400">Načítám položky…</div>
      ) : (
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-black/5 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
              <th className="px-4 py-1.5">Kód</th>
              <th className="px-2 py-1.5">Produkt</th>
              <th className="px-2 py-1.5 text-right">Množství</th>
              <th className="px-4 py-1.5 text-right">Cena</th>
            </tr>
          </thead>
          <tbody>
            {detail.items.map((it) => (
              <tr key={it.id} className="border-b border-black/[0.04]">
                <td className="px-4 py-1.5 font-mono text-[11px] text-slate-400">{it.sku ?? "—"}</td>
                <td className="px-2 py-1.5">
                  <span className="inline-flex items-center gap-2">
                    <ProductThumb url={it.image_url} title={it.title} size={30} />
                    <span>
                      <span className="font-medium" style={accent}>{it.title}</span>
                      {it.variant_title && <span className="text-slate-400"> · {it.variant_title}</span>}
                    </span>
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">{it.qty} ks</td>
                <td className="px-4 py-1.5 text-right tabular-nums">{czk(it.total_cents, currency)}</td>
              </tr>
            ))}
            <tr className="border-b border-black/[0.04]">
              <td className="px-4 py-1.5" />
              <td className="px-2 py-1.5 text-slate-500">{carrierShort(order.shipping_method) === "—" ? "Doprava" : carrierShort(order.shipping_method)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">1 ks</td>
              <td className="px-4 py-1.5 text-right tabular-nums">{czk(detail.shipping_cents, currency)}</td>
            </tr>
            {order.payment_method && (
              <tr className="border-b border-black/[0.04]">
                <td className="px-4 py-1.5" />
                <td className="px-2 py-1.5 text-slate-500">{PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">1 ks</td>
                <td className="px-4 py-1.5 text-right tabular-nums">{czk(0, currency)}</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Patička */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${theme.popoverFooterCls}`}>
        <button onClick={onOpen} className="text-[12px] font-semibold text-slate-500 hover:text-slate-800">
          Otevřít detail →
        </button>
        <div className="text-[12.5px] text-slate-600">
          Částka k úhradě: <span className="text-[14px] font-extrabold" style={accent}>{czk(order.total_cents, currency)}</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Detail objednávky — celostránkový, kompaktní dvousloupcový layout bez scrollu
// ══════════════════════════════════════════════════════════════════════════════

function OrderDetailView({ detail, currency, base, onBack, onStatus, onPayment, onPrev, onNext }: {
  detail: OrderDetailData | null;
  currency: string;
  base: string;
  onBack: () => void;
  onStatus: (s: string) => void;
  onPayment: (s: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const theme = useCommerceTheme();
  const [adminNote, setAdminNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    setAdminNote(detail?.admin_note ?? "");
  }, [detail?.id, detail?.admin_note]);

  if (!detail) {
    return <div className="py-16 text-center text-[13px] text-gray-400">Načítám detail objednávky…</div>;
  }

  const billing = detail.billing_address;
  const shipping = detail.shipping_address;
  const shippingSame = sameAddress(billing, shipping) || addressLines(shipping).length === 0;
  const phone = detail.phone ?? billing?.phone;
  const cancellable = (ORDER_NEXT[detail.status] ?? []).includes("cancelled");
  const accent = { color: theme.accentColor };

  async function saveNote() {
    if (!detail) return;
    setNoteSaving(true);
    setNoteSaved(false);
    try {
      await api(`${base}/orders/${detail.id}`, {
        method: "PATCH",
        body: JSON.stringify({ admin_note: adminNote }),
      });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    } catch { /* ignore */ }
    finally { setNoteSaving(false); }
  }

  const cardTitleCls = "mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400";
  const dlRowCls = "flex items-baseline justify-between gap-3 text-[12.5px]";
  const dlLabelCls = "shrink-0 text-slate-400";
  const dlValueCls = "text-right font-medium text-slate-700";

  return (
    <div className="space-y-4">
      {/* Hlavička s akcemi v jednom řádku */}
      <div className="wc-detail-in flex flex-wrap items-center gap-3">
        <button onClick={onBack} className={`${theme.btnGhost} !h-9 !px-3`} title="Zpět na objednávky">←</button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-[21px] font-extrabold leading-tight tracking-[-0.02em] text-slate-900">
              Objednávka <span style={accent}>{detail.order_number}</span>
            </h2>
            <PaymentPill status={detail.payment_status} />
          </div>
          <div className="text-[12px] text-slate-400">
            Přijato {fmtDate(detail.placed_at)} · {detail.item_count} ks zboží · E-shop
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <button disabled={!onPrev} onClick={onPrev} className={theme.pagerBtnCls} title="Předchozí objednávka">←</button>
          <button disabled={!onNext} onClick={onNext} className={theme.pagerBtnCls} title="Další objednávka">→</button>
          <span className="mx-1 h-5 w-px bg-black/10" aria-hidden />
          <span className="flex items-center">
            <button onClick={() => window.open(`${base}/orders/${detail.id}/invoice`, "_blank")} className={`${theme.btnGhost} !h-9 !rounded-r-none`}>
              <Icon d={IC.printer} className="h-3.5 w-3.5" /> Faktura
            </button>
            <button
              onClick={() => { window.location.href = `${base}/orders/${detail.id}/invoice?format=pdf`; }}
              className={`${theme.btnGhost} !h-9 !rounded-l-none !border-l-0 !px-2.5`}
              title="Stáhnout fakturu jako PDF (A4)"
            >
              <Icon d={IC.download} className="h-3.5 w-3.5" style={accent} /> <span style={accent}>PDF</span>
            </button>
          </span>
          <span className="flex items-center">
            <button onClick={() => window.open(`${base}/orders/${detail.id}/invoice?type=delivery`, "_blank")} className={`${theme.btnGhost} !h-9 !rounded-r-none`}>
              <Icon d={IC.doc} className="h-3.5 w-3.5" /> Dodací list
            </button>
            <button
              onClick={() => { window.location.href = `${base}/orders/${detail.id}/invoice?type=delivery&format=pdf`; }}
              className={`${theme.btnGhost} !h-9 !rounded-l-none !border-l-0 !px-2.5`}
              title="Stáhnout dodací list jako PDF (A4)"
            >
              <Icon d={IC.download} className="h-3.5 w-3.5" style={accent} /> <span style={accent}>PDF</span>
            </button>
          </span>
          <button
            onClick={() => window.open(`${base}/orders/${detail.id}/label`, "_blank")}
            className={`${theme.btnGhost} !h-9`}
            title="Přepravní štítek A6 s barcode a tracking číslem (modul Tisk štítků)"
          >
            <Icon d={IC.printer} className="h-3.5 w-3.5" /> Štítek
          </button>
          {cancellable && (
            <button onClick={() => onStatus("cancelled")} className={`${theme.btnDanger} !h-9`}>Stornovat</button>
          )}
        </div>
      </div>

      {/* Průběh vyřízení + částka */}
      <div className={`${theme.sectionCls} wc-detail-in !py-4 flex flex-wrap items-center gap-x-8 gap-y-4 !px-5`}>
        <div className="min-w-[320px] flex-1">
          <OrderStepper status={detail.status} accent={theme.accentColor} />
        </div>
        <div className="ml-auto border-l border-black/5 pl-6 text-right">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">Částka k úhradě</div>
          <div className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] tabular-nums" style={accent}>
            {czk(detail.total_cents, currency)}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
        {/* ── Levý sloupec ── */}
        <div className="wc-detail-in-1 min-w-0 space-y-4">
          {/* Položky */}
          <div className={theme.tableShellCls}>
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className={theme.tableHeadRowCls}>
                  <th className="px-4 py-2 font-semibold">Položka</th>
                  <th className="px-3 py-2 font-semibold">Kód</th>
                  <th className="px-3 py-2 text-right font-semibold">Mn.</th>
                  <th className="px-3 py-2 text-right font-semibold">Cena za m.j.</th>
                  <th className="px-4 py-2 text-right font-semibold">Celkem</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((it) => (
                  <tr key={it.id} className={theme.tableRowCls}>
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-2.5">
                        <ProductThumb url={it.image_url} title={it.title} size={38} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-slate-900">{it.title}</span>
                          {it.variant_title && <span className="block text-[11px] text-slate-400">{it.variant_title}</span>}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-400">{it.sku ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{it.qty} ks</td>
                    <td className="px-3 py-2 text-right tabular-nums">{czk(it.unit_price_cents, currency)}</td>
                    <td className="px-4 py-2 text-right font-semibold tabular-nums">{czk(it.total_cents, currency)}</td>
                  </tr>
                ))}
                <tr className={theme.tableRowCls}>
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-2.5 text-slate-500">
                      <span className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-black/5 bg-slate-50">
                        <Icon d={IC.truck} className="h-4 w-4 text-slate-300" />
                      </span>
                      {detail.shipping_method ?? "Doprava"}
                    </span>
                  </td>
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2 text-right tabular-nums">1 ks</td>
                  <td className="px-3 py-2 text-right tabular-nums">{czk(detail.shipping_cents, currency)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{czk(detail.shipping_cents, currency)}</td>
                </tr>
                {detail.discount_cents > 0 && (
                  <tr className={theme.tableRowCls}>
                    <td className="px-4 py-2 text-slate-500">Sleva</td>
                    <td className="px-3 py-2" colSpan={3} />
                    <td className="px-4 py-2 text-right tabular-nums text-rose-600">−{czk(detail.discount_cents, currency)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="font-semibold" style={{ background: `${theme.accentColor}0d` }}>
                  <td colSpan={4} className="px-3 py-3 text-right">
                    <span className="mr-4 text-[11px] font-normal text-slate-400">z toho DPH: {czk(detail.tax_cents, currency)}</span>
                    Částka k úhradě:
                  </td>
                  <td className="px-4 py-3 text-right text-[16px] font-extrabold tabular-nums" style={accent}>
                    {czk(detail.total_cents, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Poznámky */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`${theme.sectionCls} !p-4`}>
              <div className={cardTitleCls}>Poznámka zákazníka</div>
              {detail.customer_note ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
                  {detail.customer_note}
                </div>
              ) : (
                <div className="text-[12.5px] text-slate-400">Zákazník nepřidal poznámku.</div>
              )}
            </div>
            <div className={`${theme.sectionCls} !p-4`}>
              <div className={cardTitleCls}>Poznámka e-shopu</div>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className={`${theme.inputCls} !h-[64px] resize-none py-2 text-[12.5px]`}
                placeholder="Interní poznámka k objednávce…"
              />
              <div className="mt-2 flex items-center gap-2">
                <button onClick={saveNote} disabled={noteSaving} className={theme.ctaSmallCls}>
                  {noteSaving ? "Ukládám…" : "Uložit poznámku"}
                </button>
                {noteSaved && <span className="text-[12px] font-semibold text-emerald-600">Uloženo ✓</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Pravý sloupec ── */}
        <div className="wc-detail-in-2 space-y-4">
          {/* Zákazník + adresy */}
          <div className={`${theme.sectionCls} !p-4`}>
            <div className="mb-3 flex items-center gap-2.5">
              <Avatar name={billing?.name} email={detail.email} accent={theme.accentColor} size={38} />
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-bold text-slate-900">{billing?.name || detail.email}</div>
                {billing?.company && <div className="truncate text-[11.5px] text-slate-400">{billing.company}</div>}
              </div>
            </div>
            <div className="space-y-1 text-[12.5px] text-slate-700">
              <div className="flex items-center gap-1.5">
                <Icon d={IC.mail} className="h-3 w-3 shrink-0 text-slate-400" />
                <a href={`mailto:${detail.email}`} className="font-medium" style={accent}>{detail.email}</a>
              </div>
              {phone && (
                <div className="flex items-center gap-1.5">
                  <Icon d={IC.phone} className="h-3 w-3 shrink-0 text-slate-400" />
                  {phone}
                </div>
              )}
            </div>

            <div className="my-3 h-px bg-black/5" aria-hidden />
            <div className={cardTitleCls}>Fakturační adresa</div>
            <div className="space-y-0.5 text-[12.5px] text-slate-700">
              {addressLines(billing).length > 0
                ? addressLines(billing).map((line, i) => <div key={i}>{line}</div>)
                : <div className="text-slate-400">Nevyplněna</div>}
            </div>

            <div className="my-3 h-px bg-black/5" aria-hidden />
            <div className={cardTitleCls}>Doručovací adresa</div>
            <div className="space-y-0.5 text-[12.5px] text-slate-700">
              {shippingSame
                ? <div className="text-slate-400">Stejná jako fakturační</div>
                : addressLines(shipping).map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>

          {/* Vyřízení */}
          <div className={`${theme.sectionCls} !p-4`}>
            <div className={cardTitleCls}>Vyřízení objednávky</div>
            <div className="space-y-3">
              <div>
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  <StatusBadge value={detail.status} map={ORDER_STATUS_LABEL} />
                  {(ORDER_NEXT[detail.status] ?? []).filter((n) => n !== "cancelled").map((next) => (
                    <button key={next} onClick={() => onStatus(next)}
                      className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${theme.choiceChipCls}`}>
                      → {ORDER_STATUS_LABEL[next]}
                    </button>
                  ))}
                </div>
              </div>
              <div className={dlRowCls}>
                <span className={dlLabelCls}>Platba</span>
                <select value={detail.payment_status} onChange={(e) => onPayment(e.target.value)}
                  className={`${theme.inputCls} !h-8 !w-auto px-2 text-[12px]`}>
                  {Object.entries(PAYMENT_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {detail.payment_method && (
                <div className={dlRowCls}>
                  <span className={dlLabelCls}>Forma úhrady</span>
                  <span className={dlValueCls}>{PAYMENT_METHOD_LABEL[detail.payment_method] ?? detail.payment_method}</span>
                </div>
              )}
              {detail.shipping_method && (
                <div className={dlRowCls}>
                  <span className={dlLabelCls}>Doprava</span>
                  <span className={dlValueCls}>{detail.shipping_method}</span>
                </div>
              )}
              <div className={dlRowCls}>
                <span className={dlLabelCls}>Přijato</span>
                <span className={dlValueCls}>{fmtDate(detail.placed_at)}</span>
              </div>
              <div className={dlRowCls}>
                <span className={dlLabelCls}>Prodejní kanál</span>
                <span className={dlValueCls}>E-shop</span>
              </div>
            </div>
          </div>

          {/* Historie */}
          <div className={`${theme.sectionCls} !p-4`}>
            <div className={cardTitleCls}>Historie ({detail.events.length})</div>
            {detail.events.length === 0 ? (
              <div className="text-[12.5px] text-slate-400">Zatím žádné události.</div>
            ) : (
              <ul className="relative max-h-[240px] space-y-3 overflow-y-auto pr-1">
                <span className="absolute bottom-2 left-[3px] top-2 w-px bg-black/10" aria-hidden />
                {detail.events.map((ev) => (
                  <li key={ev.id} className="relative flex gap-3 text-[12px] text-slate-700">
                    <span
                      className="relative z-10 mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full ring-4 ring-white"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <div className="min-w-0">
                      <div className="font-medium">{ev.message ?? ev.type}</div>
                      <div className="text-[10.5px] text-slate-400">
                        {fmtDate(ev.created_at)}{ev.actor_email ? ` · ${ev.actor_email}` : ""}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

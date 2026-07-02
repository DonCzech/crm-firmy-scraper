"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Download } from "lucide-react";

const TYPES = [
  { value: "", label: "Všechny typy" },
  { value: "invoice", label: "Faktury" },
  { value: "proforma", label: "Proformy" },
  { value: "advance", label: "Zálohy" },
  { value: "credit_note", label: "Dobropisy" },
  { value: "tax_document", label: "Daňové doklady" },
];

const PAYMENTS = [
  { value: "", label: "Všechny platby" },
  { value: "bank", label: "Převodem" },
  { value: "card", label: "Kartou" },
  { value: "cash", label: "Hotově" },
  { value: "cod", label: "Dobírka" },
  { value: "other", label: "Jinak" },
];

export default function InvoiceFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [expanded, setExpanded] = useState(
    !!(sp.get("from") || sp.get("to") || sp.get("amountFrom") || sp.get("amountTo") || sp.get("payment"))
  );

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [type, setType] = useState(sp.get("type") ?? "");
  const [from, setFrom] = useState(sp.get("from") ?? "");
  const [to, setTo] = useState(sp.get("to") ?? "");
  const [amountFrom, setAmountFrom] = useState(sp.get("amountFrom") ?? "");
  const [amountTo, setAmountTo] = useState(sp.get("amountTo") ?? "");
  const [payment, setPayment] = useState(sp.get("payment") ?? "");

  function buildSearch() {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (type) p.set("type", type);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    if (amountFrom) p.set("amountFrom", amountFrom);
    if (amountTo) p.set("amountTo", amountTo);
    if (payment) p.set("payment", payment);
    const status = sp.get("status");
    if (status) p.set("status", status);
    return p.toString();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/dashboard/invoices?${buildSearch()}`);
  }

  function handleClear() {
    setQ(""); setType(""); setFrom(""); setTo("");
    setAmountFrom(""); setAmountTo(""); setPayment("");
    const status = sp.get("status");
    router.push(status ? `/dashboard/invoices?status=${status}` : "/dashboard/invoices");
  }

  const hasAdvanced = !!(from || to || amountFrom || amountTo || payment);

  return (
    <form onSubmit={handleSearch} className="card p-4 space-y-3">
      {/* Main row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input pl-9"
            placeholder="Číslo, klient, IČO, var. symbol, obj. číslo…"
          />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input w-44 hidden sm:block">
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`btn-secondary flex items-center gap-1.5 ${hasAdvanced ? "border-indigo-400 text-indigo-600" : ""}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtry</span>
          {hasAdvanced && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
        </button>
        <button type="submit" className="btn-primary px-4">Hledat</button>
        {(q || type || hasAdvanced) && (
          <button type="button" onClick={handleClear} className="btn-secondary px-3" title="Zrušit filtry">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 border-t border-slate-100">
          <div>
            <label className="label">Datum od</label>
            <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">Datum do</label>
            <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div>
            <label className="label">Způsob platby</label>
            <select className="input" value={payment} onChange={(e) => setPayment(e.target.value)}>
              {PAYMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Částka od (Kč)</label>
            <input type="number" className="input" value={amountFrom} onChange={(e) => setAmountFrom(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="label">Částka do (Kč)</label>
            <input type="number" className="input" value={amountTo} onChange={(e) => setAmountTo(e.target.value)} placeholder="∞" />
          </div>
        </div>
      )}

      {/* Export links */}
      <div className="flex gap-2 pt-1 border-t border-slate-100">
        <span className="text-xs text-slate-400 self-center">Export:</span>
        <a
          href={`/api/export/invoices?format=csv&${buildSearch()}`}
          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
        >
          <Download className="w-3 h-3" /> CSV
        </a>
        <a
          href={`/api/export/invoices?format=xlsx&${buildSearch()}`}
          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
        >
          <Download className="w-3 h-3" /> Excel
        </a>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";

interface OrderStatusResult {
  order_number: string;
  status: string;
  payment_status: string;
  total_cents: number;
  currency: string;
  shipping_method: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  items: { title: string; qty: number; total_cents: number }[];
}

const STATUS_STEPS: { key: string; label: string }[] = [
  { key: "pending", label: "Přijata" },
  { key: "confirmed", label: "Potvrzena" },
  { key: "processing", label: "Připravujeme" },
  { key: "shipped", label: "Odeslána" },
  { key: "completed", label: "Doručena" },
];

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Čeká na platbu",
  authorized: "Platba autorizována",
  paid: "Zaplaceno",
  failed: "Platba selhala",
  cancelled: "Platba zrušena",
  refunded: "Vráceno",
  partially_refunded: "Částečně vráceno",
};

function czk(cents: number, currency: string) {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: currency || "CZK", maximumFractionDigits: 0 }).format(cents / 100);
}

export function OrderStatusClient({ tenantSlug }: { tenantSlug: string }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrderStatusResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/order-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: orderNumber, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Objednávku se nepodařilo dohledat.");
        return;
      }
      setResult(data.order);
    } catch {
      setError("Nepodařilo se spojit se serverem. Zkuste to prosím znovu.");
    } finally {
      setBusy(false);
    }
  }

  const stepIndex = result ? STATUS_STEPS.findIndex((s) => s.key === result.status) : -1;
  const cancelled = result?.status === "cancelled";

  return (
    <div className="mt-8 max-w-[640px]">
      <form onSubmit={submit} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">Číslo objednávky</span>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="např. 2026-0001"
              className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-[15px] outline-none focus:border-neutral-900"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">E-mail z objednávky</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.cz"
              className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-[15px] outline-none focus:border-neutral-900"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 rounded-full bg-neutral-950 px-7 py-3 text-[14px] font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {busy ? "Hledám…" : "Zjistit stav objednávky"}
        </button>
        {error && <p className="mt-3 text-[14px] font-semibold text-red-600">{error}</p>}
      </form>

      {result && (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[19px] font-extrabold text-neutral-950">Objednávka {result.order_number}</h2>
            <span className="text-[13px] text-neutral-500">
              vytvořena {new Date(result.created_at).toLocaleDateString("cs-CZ")}
            </span>
          </div>

          {cancelled ? (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-[14px] font-semibold text-red-700">
              Objednávka byla zrušena.
            </div>
          ) : (
            <ol className="mt-5 flex items-start">
              {STATUS_STEPS.map((s, i) => {
                const done = stepIndex >= i;
                const isLast = i === STATUS_STEPS.length - 1;
                return (
                  <li key={s.key} className="flex flex-1 flex-col items-center text-center">
                    <div className="flex w-full items-center">
                      <div className={`h-0.5 flex-1 ${i === 0 ? "bg-transparent" : stepIndex >= i ? "bg-emerald-500" : "bg-neutral-200"}`} />
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                          done ? "bg-emerald-500 text-white" : "bg-neutral-200 text-neutral-500"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      <div className={`h-0.5 flex-1 ${isLast ? "bg-transparent" : stepIndex >= i + 1 ? "bg-emerald-500" : "bg-neutral-200"}`} />
                    </div>
                    <span className={`mt-2 text-[12px] font-semibold ${done ? "text-neutral-900" : "text-neutral-400"}`}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          )}

          <dl className="mt-6 grid gap-3 text-[14px] sm:grid-cols-2">
            <div className="rounded-xl bg-neutral-50 p-4">
              <dt className="text-[12px] font-bold uppercase tracking-wide text-neutral-400">Platba</dt>
              <dd className="mt-1 font-semibold text-neutral-900">{PAYMENT_LABELS[result.payment_status] ?? result.payment_status}</dd>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <dt className="text-[12px] font-bold uppercase tracking-wide text-neutral-400">Celkem</dt>
              <dd className="mt-1 font-semibold text-neutral-900">{czk(result.total_cents, result.currency)}</dd>
            </div>
          </dl>

          {result.items.length > 0 && (
            <div className="mt-5">
              <p className="text-[12px] font-bold uppercase tracking-wide text-neutral-400">Položky</p>
              <ul className="mt-2 divide-y divide-neutral-100 text-[14px]">
                {result.items.map((it, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-2">
                    <span className="text-neutral-800">
                      {it.qty}× {it.title}
                    </span>
                    <span className="font-semibold text-neutral-900">{czk(it.total_cents, result.currency)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

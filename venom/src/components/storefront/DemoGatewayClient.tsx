"use client";

import { useState } from "react";

/**
 * Demo platební brána pro moduly „PayPal“ a „Nákup na splátky“.
 * Simuluje průchod bránou: Zaplatit → paid, Zrušit → failed (server-side).
 */

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

interface Props {
  tenantSlug: string;
  provider: "paypal" | "splatky";
  shopName: string;
  orderNumber: string;
  token: string;
  totalCents: number;
  currency: string;
  email: string;
}

const INSTALLMENT_OPTIONS = [3, 6, 12, 24];

export function DemoGatewayClient({ tenantSlug, provider, shopName, orderNumber, token, totalCents, currency, email }: Props) {
  const [busy, setBusy] = useState<"pay" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState(12);

  async function submit(action: "pay" | "cancel") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/payment/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: orderNumber, token, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Platba se nezdařila");
      window.location.href = data.redirect;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Platba se nezdařila");
      setBusy(null);
    }
  }

  const isPaypal = provider === "paypal";
  const monthly = Math.ceil(totalCents / months);

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 py-10 ${isPaypal ? "bg-[#f5f7fa]" : "bg-[#f4f6f2]"}`}>
      <div className="w-full max-w-[440px]">
        {/* Hlavička brány */}
        <div className="mb-4 text-center">
          {isPaypal ? (
            <span className="text-[30px] font-extrabold italic tracking-tight">
              <span className="text-[#003087]">Pay</span><span className="text-[#0099de]">Pal</span>
            </span>
          ) : (
            <span className="text-[24px] font-extrabold tracking-tight text-[#1a5632]">
              ✓ Splátková brána
            </span>
          )}
          <p className="mt-1 text-[12.5px] text-neutral-500">Zabezpečená demo platba · sandbox</p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="flex items-baseline justify-between border-b border-neutral-100 pb-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400">Platba pro</p>
              <p className="mt-0.5 text-[16px] font-bold text-neutral-900">{shopName}</p>
              <p className="text-[12.5px] text-neutral-400">Objednávka {orderNumber}</p>
            </div>
            <p className="text-[24px] font-extrabold tabular-nums text-neutral-950">{czk(totalCents, currency)}</p>
          </div>

          {isPaypal ? (
            <div className="mt-4 rounded-xl bg-[#f5f7fa] px-4 py-3 text-[13.5px] text-neutral-600">
              Přihlášen jako <strong className="text-neutral-900">{email}</strong>
              <span className="mt-1 block text-[12px] text-neutral-400">Zůstatek PayPal · demo účet</span>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400">Počet splátek</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {INSTALLMENT_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonths(m)}
                    className={`rounded-xl border px-2 py-2.5 text-center text-[14px] font-bold transition ${
                      months === m ? "border-[#1a5632] bg-[#1a5632] text-white" : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    {m}×
                  </button>
                ))}
              </div>
              <p className="mt-3 rounded-xl bg-[#eef5ee] px-4 py-3 text-[13.5px] text-[#1a5632]">
                <strong className="text-[16px] tabular-nums">{czk(monthly, currency)}</strong> měsíčně po dobu {months} měsíců
                <span className="mt-0.5 block text-[12px] opacity-70">0% navýšení · schválení online do minuty (demo)</span>
              </p>
            </div>
          )}

          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-600">{error}</p>}

          <button
            onClick={() => submit("pay")}
            disabled={busy !== null}
            className={`mt-5 w-full rounded-full py-3.5 text-[15px] font-extrabold text-white transition disabled:opacity-60 ${
              isPaypal ? "bg-[#0070ba] hover:bg-[#003087]" : "bg-[#1a5632] hover:bg-[#134426]"
            }`}
          >
            {busy === "pay" ? "Zpracovávám…" : isPaypal ? "Zaplatit nyní" : `Potvrdit splátky ${months}×`}
          </button>
          <button
            onClick={() => submit("cancel")}
            disabled={busy !== null}
            className="mt-2.5 w-full rounded-full border border-neutral-200 py-3 text-[13.5px] font-bold text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-800 disabled:opacity-60"
          >
            {busy === "cancel" ? "Ruším…" : "Zrušit a vrátit se do obchodu"}
          </button>
        </div>

        <p className="mt-4 text-center text-[11.5px] text-neutral-400">
          Toto je demo brána Webero Commerce — žádné skutečné peníze se nepřevádějí.
        </p>
      </div>
    </div>
  );
}

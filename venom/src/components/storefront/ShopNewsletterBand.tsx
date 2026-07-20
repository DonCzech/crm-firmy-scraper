"use client";

import { useState } from "react";

/** Světlý newsletter pás — samostatná sekce stránky, vizuálně oddělená od tmavého footeru. */
export function ShopNewsletterBand({ tenantSlug }: { tenantSlug: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto max-w-[1400px] px-5">
      <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-neutral-100 p-8 sm:p-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-neutral-500">Newsletter</p>
          <h2 className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight text-neutral-950 sm:text-[32px]">
            Sleva 10 % na první nákup
          </h2>
          <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-neutral-600">
            Přihlaste se k odběru a získejte slevový kód, přednostní přístup k akcím a novinky ze sortimentu.
          </p>
        </div>
        <div>
          {status === "success" ? (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 ring-1 ring-emerald-200">
              <svg className="h-6 w-6 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-emerald-800">Děkujeme za přihlášení!</p>
                <p className="text-[13px] text-emerald-700/80">Slevový kód vám dorazí na e-mail.</p>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={submit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.cz"
                  required
                  className="h-13 min-w-0 flex-1 rounded-2xl border border-neutral-200 bg-white px-5 py-3.5 text-sm text-neutral-950 placeholder:text-neutral-400 outline-none transition-colors focus:border-neutral-950"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="shrink-0 rounded-2xl bg-neutral-950 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
                >
                  {status === "loading" ? "Odesílám…" : "Odebírat"}
                </button>
              </form>
              {status === "error" && (
                <p className="mt-2 text-[13px] text-red-600">Něco se pokazilo, zkuste to prosím znovu.</p>
              )}
              <p className="mt-3 text-[12px] text-neutral-500">
                Odesláním souhlasíte se zpracováním osobních údajů. Odhlásit se můžete kdykoliv.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { Rocket, Lock, Check, ExternalLink } from "lucide-react";

/**
 * Full-screen blocker shown when the tenant's trial has expired and no
 * subscription is active. The overlay sits at z-index 1_000_000 covering
 * every editor surface (dock, AdminConsole, canvas) so the user cannot
 * keep editing without paying. Click-through prevented by pointer-events.
 *
 * Public site uses a sibling component (PublicTrialLock) rendered server-side
 * in the route so the visitor never sees the original tenant content while
 * the bill is unpaid.
 */
export function TrialLockOverlay({
  tenantSlug, daysOver,
}: { tenantSlug: string; daysOver: number }) {
  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Zkušební doba skončila"
      className="fixed inset-0 z-[1000000] flex items-center justify-center p-4"
      style={{
        background: "rgba(2,6,23,0.78)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        fontFamily: "var(--vs-font-sans, Inter, sans-serif)",
      }}
    >
      <div
        className="relative w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-[0_36px_80px_rgba(2,6,23,0.55),0_18px_36px_rgba(2,6,23,0.30),0_0_0_1px_rgba(2,6,23,0.06)]"
        style={{ animation: "vs-lock-in 360ms cubic-bezier(0.18,0.89,0.32,1)" }}
      >
        {/* Top gradient ribbon */}
        <div
          className="px-7 pb-5 pt-7 text-white"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/20 backdrop-blur">
              <Lock className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Zkušební doba skončila
              </p>
              <h2 className="mt-0.5 text-[22px] font-semibold leading-tight tracking-tight">
                Aktivujte plán pro pokračování
              </h2>
            </div>
          </div>
        </div>

        <div className="px-7 py-6">
          <p className="text-[13.5px] leading-relaxed text-slate-700">
            Tvůj 30denní zkušební režim u tenantu <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] text-slate-900">{tenantSlug}</code> vypršel
            {daysOver > 0 ? <> (před {daysOver} {daysOver === 1 ? "dnem" : daysOver < 5 ? "dny" : "dny"})</> : ""}
            . Editor i veřejný web jsou pozastavené dokud nezaktivuješ předplatné.
            Tvůj obsah zůstává v bezpečí — po platbě naskočí všechno tam, kde to bylo.
          </p>

          {/* Plan card */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.10em] text-slate-500">Plán</p>
                <p className="text-[18px] font-semibold tracking-tight text-slate-900">Webero Profi</p>
              </div>
              <div className="text-right">
                <p className="text-[26px] font-bold leading-none text-slate-900">500 Kč</p>
                <p className="text-[10.5px] text-slate-500">/měsíc · bez DPH</p>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5">
              {[
                "Plně editovatelný web (sekce, design tokens, AI builder)",
                "Vlastní doména + SSL automaticky",
                "Neomezené stránky, blog, formuláře",
                "Stock obrázky a AI texty bez limitu",
                "Zálohy, verze, audit log",
              ].map((b) => (
                <li key={b} className="flex items-start gap-1.5 text-[12px] text-slate-700">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={2.5} />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/account/billing"
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white shadow-[0_10px_28px_rgba(99,102,241,0.45)] transition-transform hover:scale-[1.01] active:translate-y-[0.5px]"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)" }}
          >
            <Rocket className="h-4 w-4" strokeWidth={2.25} />
            Aktivovat předplatné (500 Kč/měs)
          </a>

          <div className="mt-3 flex items-center justify-between text-[10.5px]">
            <a
              href="/account/billing"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
            >
              Otevřít fakturaci
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-slate-400">Bezpečná platba kartou · Stripe</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes vs-lock-in {
        from { transform: translateY(20px) scale(0.97); opacity: 0; }
        to   { transform: translateY(0) scale(1); opacity: 1; }
      }`}</style>
    </div>
  );
}

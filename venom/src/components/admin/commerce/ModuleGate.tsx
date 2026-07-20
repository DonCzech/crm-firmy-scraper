"use client";

import { useCommerceTheme } from "./shared";

/**
 * Placeholder zobrazený místo obsahu admin tabu, když příslušný modul
 * není pro tenanta aktivní. CTA vede na tab Moduly.
 */
export function ModuleGate({
  moduleName,
  priceMonthly,
  onGoToModules,
}: {
  moduleName: string;
  priceMonthly: number;
  onGoToModules: () => void;
}) {
  const T = useCommerceTheme();

  return (
    <div className={`${T.cardCls} flex flex-col items-center px-8 py-16 text-center`}>
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <h2 className="mt-5 text-[20px] font-extrabold tracking-tight">Modul „{moduleName}“ není aktivní</h2>
      <p className="mt-2 max-w-[440px] text-[13.5px] opacity-70">
        Tato část administrace patří k placenému modulu. Aktivujte ho v sekci Moduly —
        buď jednotlivě za {priceMonthly} Kč/měs., nebo v rámci vyššího tarifu.
      </p>
      <button type="button" onClick={onGoToModules} className={`mt-6 ${T.btnPrimary}`}>
        Přejít na Moduly
      </button>
    </div>
  );
}

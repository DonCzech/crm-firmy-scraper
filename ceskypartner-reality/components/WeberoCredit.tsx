/**
 * Webero credit — Premium verze pro šablony běžící na tarifu Premium.
 * Vizitkový lockup: zlatý monogram + "Vytvořilo Webero" + PREMIUM badge.
 * Link s UTM trackingem (každá hotová stránka linkuje zpět na webero.co).
 */
const WEBERO_URL =
  "https://webero.co/?utm_source=footer&utm_medium=link&utm_campaign=created_by_webero&utm_content=premium";

export default function WeberoCredit({ locale = "cs" }: { locale?: "cs" | "en" }) {
  return (
    <a
      href={WEBERO_URL}
      target="_blank"
      rel="noopener"
      title={locale === "en" ? "Created by Webero — Premium plan" : "Vytvořilo Webero — tarif Premium"}
      className="group inline-flex items-center gap-3.5 no-underline"
    >
      {/* Monogram */}
      <span
        aria-hidden
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#EAD3A2]/25 bg-gradient-to-br from-[#EAD3A2]/[0.12] to-transparent transition-all duration-500 ease-luxe group-hover:border-[#EAD3A2]/50 group-hover:shadow-[0_0_24px_rgba(231,201,139,0.18)]"
      >
        <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="webero-gold" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EAD3A2" />
              <stop offset="1" stopColor="#A9885A" />
            </linearGradient>
          </defs>
          <path
            d="M4 7.5L9.6 22.5L15 11.5L20.4 22.5L26 7.5"
            stroke="url(#webero-gold)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>

      {/* Text lockup */}
      <span className="flex flex-col gap-[5px] leading-none">
        <span className="text-[10px] uppercase tracking-[0.18em] text-paper/35 transition-colors duration-500 group-hover:text-paper/55">
          {locale === "en" ? "Created by" : "Vytvořilo"}
        </span>
        <span className="flex items-center gap-2.5">
          <span className="text-[15px] font-semibold tracking-[0.01em] text-paper/85 transition-colors duration-500 group-hover:text-paper">
            Webero
          </span>
          <span className="inline-flex items-center rounded-[5px] bg-gradient-to-r from-[#EAD3A2] via-[#D3B27C] to-[#A9885A] px-[7px] py-[4px] text-[8.5px] font-bold uppercase leading-none tracking-[0.18em] text-[#14181A] shadow-[0_2px_10px_rgba(169,136,90,0.35)]">
            Premium
          </span>
        </span>
      </span>
    </a>
  );
}

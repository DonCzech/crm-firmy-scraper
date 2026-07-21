type LogoProps = {
  /** Kompaktní monogram ČP (mobil, favicon kontexty) */
  compact?: boolean;
  className?: string;
  locale?: "cs" | "en";
};

export default function Logo({ compact = false, className = "", locale = "cs" }: LogoProps) {
  if (compact) {
    return (
      <span
        className={`inline-flex h-10 w-10 items-center justify-center border border-current text-[15px] font-semibold tracking-[0.08em] ${className}`}
        aria-label="Český Partner"
      >
        ČP
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col leading-none ${className}`} aria-label={`Český Partner — ${locale === "en" ? "Real Estate" : "Realitní kancelář"}`}>
      <span className="text-[15px] font-semibold uppercase tracking-[0.14em] sm:text-[19px] sm:tracking-[0.18em]">
        Český&nbsp;Partner
      </span>
      <span className="mt-[5px] text-[8px] font-normal uppercase tracking-[0.28em] opacity-70 sm:mt-[7px] sm:text-[9px] sm:tracking-[0.35em]">
        {locale === "en" ? <>Real&nbsp;Estate</> : <>Realitní&nbsp;kancelář</>}
      </span>
    </span>
  );
}

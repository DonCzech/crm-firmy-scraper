// Vodoznak na fotografiích inzerátů — logo Český Partner.
// Zapíná se v admin Nastavení (klíč watermark_enabled), výchozí stav je vypnuto.

type PhotoWatermarkProps = {
  /** "photo" — galerie a lightbox; "card" — malé náhledy */
  variant?: "photo" | "card";
};

export default function PhotoWatermark({ variant = "photo" }: PhotoWatermarkProps) {
  if (variant === "card") {
    return (
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2.5 left-3 z-[5] select-none text-[8px] font-semibold uppercase leading-none tracking-[0.2em] text-white/60 drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]"
      >
        Český&nbsp;Partner
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute bottom-4 left-5 z-[5] flex select-none flex-col leading-none text-white/70 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
    >
      <span className="text-[13px] font-semibold uppercase tracking-[0.18em]">Český&nbsp;Partner</span>
      <span className="mt-[5px] text-[7px] font-normal uppercase tracking-[0.32em] text-white/50">
        Realitní&nbsp;kancelář
      </span>
    </span>
  );
}

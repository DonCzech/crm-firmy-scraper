// Štítek exkluzivního zastoupení — bílý blok s bronzovým akcentem, leží na fotografii.
export default function ExclusiveBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 bg-paper/95 px-4 py-2.5 text-[10.5px] font-semibold uppercase leading-none tracking-[0.24em] text-ink shadow-[0_2px_14px_rgba(0,0,0,0.22)] backdrop-blur-sm ${className}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 bg-bronze" />
      Exkluzivně
    </span>
  );
}

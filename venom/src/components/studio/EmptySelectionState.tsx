"use client";

import { MousePointerClick, Type, SlidersHorizontal, Sparkles } from "@/components/studio/icons";

export function EmptySelectionState() {
  const cards = [
    { Icon: MousePointerClick, title: "Klikni na sekci", text: "Vyber sekci v náhledu nebo ve vrstvách." },
    { Icon: Type,              title: "Uprav text",      text: "Klikni na nadpis nebo odstavec a piš přímo do náhledu." },
    { Icon: SlidersHorizontal, title: "Změň styl",       text: "Vyber text a v pravém panelu zvol Styl." },
  ];
  return (
    <div className="vs-empty-selection vs-enter flex h-full flex-col items-center px-5 pt-12 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)] ring-1 ring-[var(--vs-accent-ring)]">
        <Sparkles className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="text-[14px] font-semibold tracking-tight text-[var(--vs-text)]">Vyber, co chceš upravit</h3>
      <p className="mb-6 mt-1.5 max-w-[220px] text-[11.5px] leading-relaxed text-[var(--vs-text-muted)]">
        Klikni na libovolný prvek v náhledu. Tady se otevře editor.
      </p>
      <div className="w-full space-y-2">
        {cards.map(({ Icon, title, text }) => (
          <div
            key={title}
            className="vs-empty-hint vs-lift flex items-start gap-3 rounded-lg border border-[var(--vs-border)] bg-[var(--vs-surface)] p-3 text-left hover:border-[var(--vs-border-strong)]"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--vs-surface-2)] text-[var(--vs-text-muted)]">
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[12px] font-medium text-[var(--vs-text)]">{title}</div>
              <div className="text-[10.5px] leading-snug text-[var(--vs-text-muted)]">{text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { MousePointerClick, Type, SlidersHorizontal, Sparkles } from "@/components/studio/icons";

export function EmptySelectionState() {
  const cards = [
    { Icon: MousePointerClick, title: "Klikni na sekci", text: "Vyber sekci v náhledu nebo ve vrstvách." },
    { Icon: Type,              title: "Uprav text",      text: "Klikni na nadpis nebo odstavec a piš přímo do náhledu." },
    { Icon: SlidersHorizontal, title: "Změň styl",       text: "Vyber text a v pravém panelu zvol Styl." },
  ];
  return (
    <div className="vs-enter flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)] ring-1 ring-[var(--vs-accent-ring)] shadow-[0_0_24px_var(--vs-accent-ring)]">
        <Sparkles className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="text-[13.5px] font-semibold tracking-tight text-[var(--vs-text)]">Vyber, co chceš upravit</h3>
      <p className="mb-5 mt-1 text-[11.5px] leading-relaxed text-[var(--vs-text-muted)]">
        Klikni na libovolný prvek v náhledu. Tady se otevře editor.
      </p>
      <div className="w-full space-y-1.5">
        {cards.map(({ Icon, title, text }) => (
          <div
            key={title}
            className="vs-lift flex items-start gap-2.5 rounded-md border border-[var(--vs-border)] bg-[var(--vs-surface)] p-2.5 text-left shadow-[var(--vs-shadow-sm)] hover:border-[var(--vs-border-strong)]"
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

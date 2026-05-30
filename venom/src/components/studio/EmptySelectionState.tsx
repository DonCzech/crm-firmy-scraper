"use client";

import { MousePointerClick, Type, SlidersHorizontal } from "lucide-react";

export function EmptySelectionState() {
  const cards = [
    { icon: MousePointerClick, title: "Klikni na sekci", text: "Vyber sekci v náhledu nebo ve vrstvách." },
    { icon: Type, title: "Uprav text", text: "Klikni na nadpis nebo odstavec a piš přímo do náhledu." },
    { icon: SlidersHorizontal, title: "Změň styl", text: "Vyber text a v pravém panelu zvol Styl." },
  ];
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="mb-5 text-xs leading-relaxed text-[#a1a1aa]">
        Klikni na libovolný prvek pro úpravu. Hover ukáže akce.
      </p>
      <div className="w-full space-y-2">
        {cards.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-2.5 rounded-md border border-[#27272a] bg-[#1a1a1c] p-3 text-left">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#27272a] text-[#a1a1aa]">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[12px] font-medium text-white">{title}</div>
              <div className="text-[10.5px] text-[#71717a]">{text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

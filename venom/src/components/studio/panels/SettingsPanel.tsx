"use client";

import { ChevronRight } from "@/components/studio/icons";
import { useStudio } from "../StudioContext";
import type { StudioState } from "../TenantStudioView";

interface SettingsItem {
  label: string;
  view: string;
  hasChevron?: boolean;
}

const OBECNE: SettingsItem[] = [
  { label: "Identita",               view: "identita" },
  { label: "Web",                    view: "web" },
  { label: "Vlastní doména",         view: "domain",    hasChevron: true },
  { label: "SEO",                    view: "seo" },
  { label: "Cookie lišta",           view: "cookies" },
  { label: "Uživatelské přístupy",   view: "access",    hasChevron: true },
  { label: "Jazyky",                 view: "languages" },
  { label: "E-maily",                view: "emails",    hasChevron: true },
  { label: "Fakturace a platby",     view: "billing",   hasChevron: true },
];

const POKROCILE: SettingsItem[] = [
  { label: "Integrace a API",   view: "api" },
  { label: "Záznam aktivity",   view: "activity" },
  { label: "CSS třídy",         view: "css" },
  { label: "HTTP Hlavičky",     view: "headers" },
  { label: "Přesměrování",      view: "redirects" },
];

export function SettingsPanel({ state: _state }: { state: StudioState }) {
  const studio = useStudio();
  return (
    <div className="vs-enter flex-1 overflow-y-auto vs-scroll">
      <Group label="OBECNÉ" items={OBECNE} onOpen={(v) => studio.setSettingsView(v)} />
      <Group label="POKROČILÉ" items={POKROCILE} onOpen={(v) => studio.setSettingsView(v)} />
      <div className="h-4" />
    </div>
  );
}

function Group({ label, items, onOpen }: { label: string; items: SettingsItem[]; onOpen: (v: string) => void }) {
  return (
    <div className="pt-4 pb-1">
      <div className="px-4 pb-1.5 text-[10px] font-bold tracking-[0.10em] text-[var(--vs-text-dim)] uppercase">
        {label}
      </div>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onOpen(item.view)}
          className="flex w-full items-center justify-between px-4 py-[7px] text-[13px] text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors duration-100"
        >
          {item.label}
          {item.hasChevron && (
            <ChevronRight className="h-3.5 w-3.5 text-[var(--vs-text-dim)] shrink-0" strokeWidth={2} />
          )}
        </button>
      ))}
    </div>
  );
}

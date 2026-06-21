"use client";

import { Layers, Plus, FileText, Image as ImageIcon, User, Settings } from "lucide-react";
import { useStudio, type StudioLeftPanel } from "./StudioContext";
import { Tooltip, IconButton } from "./ui";

const ITEMS: Array<{
  id: Exclude<StudioLeftPanel, null>;
  label: string;
  hotkey: string;
  tourId: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}> = [
  { id: "layers",   label: "Vrstvy",         hotkey: "L", tourId: "rail-layers",   Icon: Layers },
  { id: "add",      label: "Přidat sekci",   hotkey: "A", tourId: "rail-add",      Icon: Plus },
  { id: "pages",    label: "Stránky",        hotkey: "P", tourId: "rail-pages",    Icon: FileText },
  { id: "assets",   label: "Knihovna",       hotkey: "I", tourId: "rail-assets",   Icon: ImageIcon },
  { id: "brand",    label: "Identita firmy", hotkey: "B", tourId: "rail-brand",    Icon: User },
  { id: "settings", label: "Nastavení",      hotkey: "",  tourId: "rail-settings", Icon: Settings },
];

export function StudioLeftRail() {
  const studio = useStudio();
  return (
    <aside
      data-tour-id="rail"
      className="flex w-[52px] flex-col items-center border-r border-[var(--vs-border)] bg-[var(--vs-bg-soft)] py-2"
    >
      {ITEMS.map((item) => {
        const active = studio.leftPanel === item.id;
        const Icon = item.Icon;
        return (
          <Tooltip
            key={item.id}
            side="right"
            label={
              <span className="flex items-center gap-2">
                {item.label}
                {item.hotkey && (
                  <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-1 text-[9.5px] font-mono">
                    {item.hotkey}
                  </kbd>
                )}
              </span>
            }
          >
            <div data-tour-id={item.tourId} className="my-0.5 relative">
              <IconButton
                size="md"
                active={active}
                label={item.label}
                onClick={() => studio.setLeftPanel(active ? null : item.id)}
              >
                {active && (
                  <span className="pointer-events-none absolute left-0 top-1/2 h-5 w-[2px] -translate-x-2 -translate-y-1/2 rounded-r bg-[var(--vs-accent-hi)] shadow-[0_0_8px_var(--vs-accent-ring)]" />
                )}
                <Icon className="h-[17px] w-[17px]" strokeWidth={active ? 2 : 1.6} />
              </IconButton>
            </div>
          </Tooltip>
        );
      })}
    </aside>
  );
}

"use client";

import { Layers, Plus, FileText, Image as ImageIcon, User, Settings } from "lucide-react";
import clsx from "clsx";
import { useStudio, type StudioLeftPanel } from "./StudioContext";

const ITEMS: Array<{ id: Exclude<StudioLeftPanel, null>; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = [
  { id: "layers", label: "Vrstvy", icon: Layers },
  { id: "add", label: "Přidat sekci", icon: Plus },
  { id: "pages", label: "Stránky", icon: FileText },
  { id: "assets", label: "Knihovna", icon: ImageIcon },
  { id: "brand", label: "Identita firmy", icon: User },
  { id: "settings", label: "Nastavení", icon: Settings },
];

export function StudioLeftRail() {
  const studio = useStudio();
  return (
    <div className="flex w-16 flex-col items-center border-r border-[#27272a] bg-[#0f0f10] py-2">
      {ITEMS.map((item) => {
        const active = studio.leftPanel === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            title={item.label}
            onClick={() => studio.setLeftPanel(active ? null : item.id)}
            className={clsx(
              "relative my-0.5 flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-150",
              active
                ? "bg-[#27272a] text-white"
                : "text-[#a1a1aa] hover:bg-[#1f1f22] hover:text-white"
            )}
          >
            {active && <span className="absolute left-0 top-1.5 h-7 w-0.5 -translate-x-2 rounded-r bg-blue-500" />}
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}

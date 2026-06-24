"use client";

import { Feather, Settings2, AlignJustify, LayoutGrid, Search, Bell, Images, Layers, PlusSquare, Briefcase } from "lucide-react";
import { useStudio, type StudioLeftPanel } from "./StudioContext";
import { Tooltip } from "./ui";
import clsx from "clsx";

function PagesIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4H6a2 2 0 00-2 2v13a2 2 0 002 2h12a2 2 0 002-2v-2" />
      <rect x="8" y="2" width="12" height="16" rx="2" />
      <line x1="11" y1="7" x2="17" y2="7" />
      <line x1="11" y1="11" x2="17" y2="11" />
      <line x1="11" y1="15" x2="15" y2="15" />
    </svg>
  );
}

type IconProps = { size: number; strokeWidth: number };

export const RAIL_ITEMS: Array<{
  id: Exclude<StudioLeftPanel, null>;
  label: string;
  tourId: string;
  Icon: (p: IconProps) => React.ReactElement;
}> = [
  { id: "add",      label: "Přidat sekci", tourId: "rail-add",      Icon: ({ size, strokeWidth }) => <PlusSquare size={size} strokeWidth={strokeWidth} /> },
  { id: "layers",   label: "Vrstvy",       tourId: "rail-layers",   Icon: ({ size, strokeWidth }) => <Layers size={size} strokeWidth={strokeWidth} /> },
  { id: "pages",    label: "Stránky",      tourId: "rail-pages",    Icon: ({ size }) => <PagesIcon size={size} /> },
  { id: "design",   label: "Design",       tourId: "rail-design",   Icon: ({ size, strokeWidth }) => <Feather size={size} strokeWidth={strokeWidth} /> },
  { id: "brand",    label: "Identita",     tourId: "rail-brand",    Icon: ({ size, strokeWidth }) => <Briefcase size={size} strokeWidth={strokeWidth} /> },
  { id: "assets",   label: "Soubory",      tourId: "rail-assets",   Icon: ({ size, strokeWidth }) => <Images size={size} strokeWidth={strokeWidth} /> },
  { id: "settings", label: "Nastavení",    tourId: "rail-settings", Icon: ({ size, strokeWidth }) => <Settings2 size={size} strokeWidth={strokeWidth} /> },
  { id: "modules",  label: "Moduly",       tourId: "rail-modules",  Icon: ({ size, strokeWidth }) => <AlignJustify size={size} strokeWidth={strokeWidth} /> },
  { id: "articles", label: "Články",       tourId: "rail-articles", Icon: ({ size, strokeWidth }) => <LayoutGrid size={size} strokeWidth={strokeWidth} /> },
];

export function StudioLeftRail() {
  const studio = useStudio();

  return (
    <aside
      data-tour-id="rail"
      className="flex w-[55px] shrink-0 flex-col bg-[var(--vs-bg-soft)]"
      style={{ boxShadow: "inset -1px 0 0 rgba(255,255,255,0.055)" }}
    >
      {/* Icons only — labels are shown in the panel area */}
      <nav className="flex flex-col items-center py-2 w-full gap-0.5">
        {RAIL_ITEMS.map((item) => {
          const active = studio.leftPanel === item.id;
          const sw = active ? 1.8 : 1.5;

          return (
            <div
              key={item.id}
              data-tour-id={item.tourId}
              className="relative w-full flex justify-center px-[3.5px] py-0.5"
            >
              {active && (
                <span className="pointer-events-none absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#3b82f6]" />
              )}
              <Tooltip side="right" label={item.label}>
                <button
                  type="button"
                  aria-label={item.label}
                  onClick={() => studio.setLeftPanel(active ? null : item.id)}
                  className={clsx(
                    "flex h-11 w-11 items-center justify-center rounded-xl transition-[background,color] duration-100",
                    active
                      ? "bg-[rgba(59,130,246,0.14)] text-[#60a5fa]"
                      : "text-[#6b7280] hover:bg-[var(--vs-surface-2)] hover:text-[#9ca3af]"
                  )}
                >
                  <item.Icon size={20} strokeWidth={sw} />
                </button>
              </Tooltip>
            </div>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Bottom utilities */}
      <div className="flex flex-col items-center gap-2 pb-4">
        <Tooltip side="right" label="Hledat">
          <button type="button" aria-label="Hledat" className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6b7280] hover:bg-[var(--vs-surface-2)] hover:text-[#9ca3af] transition-colors duration-100">
            <Search size={20} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip side="right" label="Notifikace">
          <button type="button" aria-label="Notifikace" className="flex h-10 w-10 items-center justify-center rounded-xl text-[#6b7280] hover:bg-[var(--vs-surface-2)] hover:text-[#9ca3af] transition-colors duration-100">
            <Bell size={20} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip side="right" label="Profil">
          <button type="button" aria-label="Profil" className="flex h-9 w-9 items-center justify-center rounded-full text-white text-[12px] font-bold shrink-0 hover:opacity-85 transition-opacity" style={{ background: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)" }}>
            KA
          </button>
        </Tooltip>
        <Tooltip side="right" label="Webero Studio">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-[13px] font-black tracking-tight shrink-0 select-none" style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)" }}>
            S.
          </div>
        </Tooltip>
      </div>
    </aside>
  );
}

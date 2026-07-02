"use client";

import { useEffect, useRef, useState } from "react";
import {
  Feather, Settings2, AlignJustify, LayoutGrid, Search, Bell, Images, Briefcase, PanelLeft,
  CreditCard, Users, HelpCircle, Keyboard, LogOut, CheckSquare,
} from "lucide-react";
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

// Moduly (CRM) jsou zatím jen UI skořápka bez CRUD — skryto z railu, dokud nebude reálná implementace
export const MODULES_ENABLED = false;

const ALL_RAIL_ITEMS: Array<{
  id: Exclude<StudioLeftPanel, null>;
  label: string;
  tourId: string;
  Icon: (p: IconProps) => React.ReactElement;
}> = [
  { id: "pages",    label: "Stránky",      tourId: "rail-pages",    Icon: ({ size }) => <PagesIcon size={size} /> },
  { id: "design",   label: "Design",       tourId: "rail-design",   Icon: ({ size, strokeWidth }) => <Feather size={size} strokeWidth={strokeWidth} /> },
  { id: "brand",    label: "Identita",     tourId: "rail-brand",    Icon: ({ size, strokeWidth }) => <Briefcase size={size} strokeWidth={strokeWidth} /> },
  { id: "assets",   label: "Soubory",      tourId: "rail-assets",   Icon: ({ size, strokeWidth }) => <Images size={size} strokeWidth={strokeWidth} /> },
  { id: "settings", label: "Nastavení",    tourId: "rail-settings", Icon: ({ size, strokeWidth }) => <Settings2 size={size} strokeWidth={strokeWidth} /> },
  { id: "modules",  label: "Moduly",       tourId: "rail-modules",  Icon: ({ size, strokeWidth }) => <AlignJustify size={size} strokeWidth={strokeWidth} /> },
  { id: "articles", label: "Články",       tourId: "rail-articles", Icon: ({ size, strokeWidth }) => <LayoutGrid size={size} strokeWidth={strokeWidth} /> },
];

export const RAIL_ITEMS = ALL_RAIL_ITEMS.filter((item) => MODULES_ENABLED || item.id !== "modules");

function AccountDropdown({ onClose }: { onClose: () => void }) {
  const studio = useStudio();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const items = [
    {
      Icon: CreditCard,
      label: "Plán a předplatné",
      action: () => {
        studio.setLeftPanel("settings");
        studio.setSettingsView("billing");
        onClose();
      },
    },
    {
      Icon: Users,
      label: "Spravovat tým",
      action: () => {
        studio.setLeftPanel("settings");
        studio.setSettingsView("access");
        onClose();
      },
    },
    {
      Icon: HelpCircle,
      label: "Nápověda a podpora",
      action: () => {
        studio.setHelpPanelOpen(true);
        onClose();
      },
    },
    {
      Icon: Keyboard,
      label: "Zkratky",
      shortcut: "⇧?",
      action: () => {
        studio.setShortcutsOpen(true);
        onClose();
      },
    },
  ];

  return (
    <div
      ref={ref}
      className="vs-glass vs-pop absolute left-[59px] bottom-0 z-[200] w-[220px] rounded-xl shadow-[var(--vs-shadow-xl)] ring-1 ring-[var(--vs-border-strong)] overflow-hidden"
    >
      {/* User header */}
      <div className="flex items-center gap-2.5 px-3 py-3 border-b border-[var(--vs-border)]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-[11px] font-bold shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_2px_8px_rgba(20,184,166,0.4)]" style={{ background: "var(--vs-grad-brand)" }}>
          TB
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--vs-text)] truncate">Tomas Bartak</p>
          <p className="text-[11px] text-[var(--vs-text-muted)]">admin</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        {items.map(({ Icon, label, shortcut, action }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-[var(--vs-surface-2)] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 text-[var(--vs-text-muted)] shrink-0" strokeWidth={1.5} />
              <span className="text-[13px] text-[var(--vs-text-soft)]">{label}</span>
            </div>
            {shortcut && (
              <kbd className="rounded bg-[var(--vs-surface-2)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--vs-text-muted)]">{shortcut}</kbd>
            )}
          </button>
        ))}
      </div>

      {/* Sign out */}
      <div className="border-t border-[var(--vs-border)] py-1">
        <button
          type="button"
          onClick={onClose}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[var(--vs-danger-bg)] transition-colors"
        >
          <LogOut className="h-4 w-4 text-[var(--vs-danger)] shrink-0" strokeWidth={1.5} />
          <span className="text-[13px] text-[var(--vs-danger)]">Odhlásit se</span>
        </button>
      </div>
    </div>
  );
}

export function StudioLeftRail() {
  const studio = useStudio();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <aside
      data-tour-id="rail"
      className="flex w-[55px] shrink-0 flex-col bg-[var(--vs-bg-soft)] relative"
      style={{ boxShadow: "inset -1px 0 0 rgba(255,255,255,0.055)" }}
    >
      {/* Sidebar toggle */}
      <div className="flex justify-center pt-2 pb-2 w-full">
        <Tooltip side="right" label={studio.sidebarOpen ? "Skrýt panel" : "Zobrazit panel"}>
          <button
            type="button"
            aria-label={studio.sidebarOpen ? "Skrýt panel" : "Zobrazit panel"}
            onClick={studio.toggleSidebar}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-[background,color] duration-100 ${studio.sidebarOpen ? "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-soft)]" : "bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)]"}`}
          >
            <PanelLeft size={18} strokeWidth={1.6} />
          </button>
        </Tooltip>
      </div>
      <div className="mx-3 mb-2 h-px bg-[rgba(255,255,255,0.07)]" />

      {/* Nav icons */}
      <nav className="flex flex-col items-center py-1 w-full gap-0.5">
        {RAIL_ITEMS.map((item) => {
          const isAssets = item.id === "assets";
          const active = isAssets ? studio.assetsOpen : studio.leftPanel === item.id;
          const sw = active ? 1.8 : 1.5;

          return (
            <div
              key={item.id}
              data-tour-id={item.tourId}
              className="relative w-full flex justify-center px-[3.5px] py-0.5"
            >
              {active && (
                <span className="pointer-events-none absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--vs-accent)] shadow-[0_0_10px_var(--vs-accent-ring)]" />
              )}
              <Tooltip side="right" label={item.label}>
                <button
                  type="button"
                  aria-label={item.label}
                  onClick={() => {
                    if (isAssets) {
                      studio.setAssetsOpen(!studio.assetsOpen);
                    } else {
                      studio.setLeftPanel(active ? null : item.id);
                    }
                  }}
                  className={clsx(
                    "flex h-11 w-11 items-center justify-center rounded-xl transition-[background,color,transform] duration-100 active:scale-95",
                    active
                      ? "bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)] shadow-[inset_0_0_0_1px_rgba(212,212,216,0.22)]"
                      : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-soft)]"
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
      <div className="flex flex-col items-center gap-2 pb-4 relative">
        <Tooltip side="right" label="Hledat (⌘K)">
          <button
            type="button"
            aria-label="Hledat"
            onClick={() => studio.setCommandPaletteOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-soft)] transition-colors duration-100"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip side="right" label="Nastavení webu">
          <button
            type="button"
            aria-label="Nastavení webu"
            onClick={() => studio.setChecklistOpen(!studio.checklistOpen)}
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-100",
              studio.checklistOpen
                ? "bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)]"
                : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-soft)]"
            )}
          >
            <CheckSquare size={20} strokeWidth={1.5} />
          </button>
        </Tooltip>
        <Tooltip side="right" label="Upozornění">
          <button
            type="button"
            aria-label="Upozornění"
            onClick={() => studio.setNotificationsOpen(!studio.notificationsOpen)}
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-100",
              studio.notificationsOpen
                ? "bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)]"
                : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-soft)]"
            )}
          >
            <Bell size={20} strokeWidth={1.5} />
          </button>
        </Tooltip>

        {/* Profile button + dropdown */}
        <div className="relative">
          <Tooltip side="right" label="Profil">
            <button
              type="button"
              aria-label="Profil"
              onClick={() => setAccountOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white text-[12px] font-bold shrink-0 hover:opacity-85 transition-opacity shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_2px_8px_rgba(20,184,166,0.35)]"
              style={{ background: "var(--vs-grad-brand)" }}
            >
              TB
            </button>
          </Tooltip>
          {accountOpen && <AccountDropdown onClose={() => setAccountOpen(false)} />}
        </div>

      </div>
    </aside>
  );
}

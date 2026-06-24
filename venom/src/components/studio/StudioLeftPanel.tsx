"use client";

import { useStudio } from "./StudioContext";
import { RAIL_ITEMS } from "./StudioLeftRail";
import { LayersPanel } from "./panels/LayersPanel";
import { AddSectionPanel } from "./panels/AddSectionPanel";
import { PagesPanel } from "./panels/PagesPanel";
import { AssetsPanel } from "./panels/AssetsPanel";
import { BrandPanel } from "./panels/BrandPanel";
import { SettingsPanel } from "./panels/SettingsPanel";
import { DesignPanel } from "./panels/DesignPanel";
import { ModulesPanel } from "./panels/ModulesPanel";
import { ArticlesPanel } from "./panels/ArticlesPanel";
import type { StudioState } from "./TenantStudioView";

const TITLES: Record<string, string> = {
  add:      "Přidat sekci",
  layers:   "Vrstvy",
  pages:    "Stránky",
  design:   "Design",
  brand:    "Identita firmy",
  assets:   "Soubory",
  settings: "Nastavení",
  modules:  "Moduly",
  articles: "Články",
};

export function StudioLeftPanel({ state }: { state: StudioState }) {
  const studio = useStudio();
  const which = studio.leftPanel;

  /* ── Overview (default, no panel selected) — text labels only, no icons ── */
  if (!which) {
    return (
      <div className="flex h-full flex-col overflow-y-auto vs-scroll">
        <nav className="flex flex-col py-2 w-full gap-0.5">
          {RAIL_ITEMS.map((item) => (
            <div key={item.id} className="py-0.5 w-full px-[3.5px]">
              <button
                type="button"
                onClick={() => studio.setLeftPanel(item.id)}
                className="flex items-center h-11 w-full px-3 text-[14px] font-medium text-[#9ca3af] hover:text-[#d1d5db] hover:bg-[var(--vs-surface-2)] rounded-xl transition-colors duration-100 text-left"
              >
                {item.label}
              </button>
            </div>
          ))}
        </nav>
      </div>
    );
  }

  /* ── Specific panel ─────────────────────────────────────────────────── */
  return (
    <div className="flex h-full flex-col">
      {/* Panel title — skip for "pages" (has own search header) */}
      {which !== "pages" && (
        <div className="flex h-11 shrink-0 items-center px-4 border-b border-[var(--vs-border)]">
          <span className="text-[16px] font-bold text-[var(--vs-text)] tracking-tight leading-none">
            {TITLES[which] ?? which}
          </span>
        </div>
      )}

      {/* Panel content */}
      <div className="flex-1 min-h-0">
        {which === "layers"   && <LayersPanel   state={state} />}
        {which === "add"      && <AddSectionPanel state={state} />}
        {which === "pages"    && <PagesPanel    state={state} />}
        {which === "assets"   && <AssetsPanel   state={state} />}
        {which === "brand"    && <BrandPanel    state={state} />}
        {which === "settings" && <SettingsPanel state={state} />}
        {which === "design"   && <DesignPanel   state={state} />}
        {which === "modules"  && <ModulesPanel  state={state} />}
        {which === "articles" && <ArticlesPanel state={state} />}
      </div>
    </div>
  );
}

"use client";

import { useStudio } from "./StudioContext";
import { LayersPanel } from "./panels/LayersPanel";
import { AddSectionPanel } from "./panels/AddSectionPanel";
import { PagesPanel } from "./panels/PagesPanel";
import { AssetsPanel } from "./panels/AssetsPanel";
import { BrandPanel } from "./panels/BrandPanel";
import { SettingsPanel } from "./panels/SettingsPanel";
import type { StudioState } from "./TenantStudioView";

const TITLES: Record<string, string> = {
  layers: "Vrstvy",
  add: "Přidat sekci",
  pages: "Stránky",
  assets: "Knihovna",
  brand: "Identita firmy",
  settings: "Nastavení",
};

export function StudioLeftPanel({ state }: { state: StudioState }) {
  const studio = useStudio();
  const which = studio.leftPanel;
  if (!which) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 items-center justify-between border-b border-[#27272a] px-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#a1a1aa]">
          {TITLES[which]}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {which === "layers" && <LayersPanel state={state} />}
        {which === "add" && <AddSectionPanel state={state} />}
        {which === "pages" && <PagesPanel state={state} />}
        {which === "assets" && <AssetsPanel state={state} />}
        {which === "brand" && <BrandPanel state={state} />}
        {which === "settings" && <SettingsPanel state={state} />}
      </div>
    </div>
  );
}

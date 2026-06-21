"use client";

import { useStudio } from "./StudioContext";
import { LayersPanel } from "./panels/LayersPanel";
import { AddSectionPanel } from "./panels/AddSectionPanel";
import { PagesPanel } from "./panels/PagesPanel";
import { AssetsPanel } from "./panels/AssetsPanel";
import { BrandPanel } from "./panels/BrandPanel";
import { SettingsPanel } from "./panels/SettingsPanel";
import { Panel } from "./ui";
import type { StudioState } from "./TenantStudioView";

const TITLES: Record<string, string> = {
  layers:   "Vrstvy stránky",
  add:      "Přidat sekci",
  pages:    "Stránky",
  assets:   "Knihovna obrázků",
  brand:    "Identita firmy",
  settings: "Nastavení",
};

export function StudioLeftPanel({ state }: { state: StudioState }) {
  const studio = useStudio();
  const which = studio.leftPanel;
  if (!which) return null;

  return (
    <Panel title={TITLES[which]} className="h-full">
      <div className="vs-enter h-full">
        {which === "layers"   && <LayersPanel   state={state} />}
        {which === "add"      && <AddSectionPanel state={state} />}
        {which === "pages"    && <PagesPanel    state={state} />}
        {which === "assets"   && <AssetsPanel   state={state} />}
        {which === "brand"    && <BrandPanel    state={state} />}
        {which === "settings" && <SettingsPanel state={state} />}
      </div>
    </Panel>
  );
}

"use client";

import { useState } from "react";
import { BorderField, BreakpointTabs, ColorField, PadField, SelectField, ShadowField, SliderField, SubGroup, TextField, ToggleField, type Bp } from "./controls";
import { useDesignTokens } from "./DesignTokensContext";

/**
 * Concrete sub-panels for the Studio Design section.
 *
 * Each panel is the body of the floating popup that opens to the right of the
 * left rail when a leaf in the Design menu is clicked. Tokens are persisted
 * via the design-tokens API and mirrored into every section so the editor
 * canvas + public render share one source of truth.
 *
 * Naming convention for token keys: `<area>.<group>.<prop>[.<bp?>]`
 *   - header.bg, header.padding.h.desktop, mobileMenu.gap
 *   - page.bg, section.gap
 *   - typography.fontFamily, typography.size, h1.size
 *   - footer.bg, footer.text
 */

const FONT_OPTIONS = [
  { value: "Roboto", label: "Roboto" },
  { value: "Inter", label: "Inter" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Poppins", label: "Poppins" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Onest", label: "Onest" },
  { value: "Figtree", label: "Figtree" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond" },
];

const WEIGHT_OPTIONS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extrabold" },
];

const ALIGN_OPTIONS = [
  { value: "left", label: "Vlevo" },
  { value: "center", label: "Na střed" },
  { value: "right", label: "Vpravo" },
];

/* ── Hlavička ────────────────────────────────────────────────────────────── */

export function HlavickaObecne() {
  const [bp, setBp] = useState<Bp>("desktop");
  return (
    <>
      <SubGroup label="Výchozí styl hlavičky" right={<BreakpointTabs value={bp} onChange={setBp} />}>
        <ColorField label="Pozadí" tokenKey={`header.bg.${bp}`} />
        <PadField label="Vnitřní odsazení" hKey={`header.padding.h.${bp}`} vKey={`header.padding.v.${bp}`} defaultH={24} defaultV={16} />
      </SubGroup>
      <SubGroup label="Mobilní menu: otevřené" right={<BreakpointTabs value={bp} onChange={setBp} />}>
        <ColorField label="Pozadí mobilního menu" tokenKey="mobileMenu.bg" defaultValue="#000000" />
        <PadField label="Vnitřní odsazení" hKey="mobileMenu.padding.h" vKey="mobileMenu.padding.v" defaultH={30} defaultV={50} />
        <SliderField label="Mezera mezi regiony" tokenKey="mobileMenu.gap" min={0} max={200} />
        <SliderField label="Rozmazání pozadí" tokenKey="mobileMenu.blur" min={0} max={40} />
      </SubGroup>
      <SubGroup label="Typ hlavičky: tlačítko">
        <ColorField label="Pozadí aktivního menu" tokenKey="header.activeBg" />
      </SubGroup>
    </>
  );
}

export function HlavickaHlavniNavigace() {
  return (
    <>
      <SubGroup label="Hlavní navigace">
        <SelectField label="Písmo" tokenKey="nav.fontFamily" options={FONT_OPTIONS} defaultValue="Roboto" />
        <SelectField label="Tloušťka" tokenKey="nav.fontWeight" options={WEIGHT_OPTIONS} defaultValue="500" />
        <SliderField label="Velikost textu" tokenKey="nav.size" min={10} max={32} defaultValue={14} />
        <ColorField label="Barva textu" tokenKey="nav.color" defaultValue="#111111" />
        <ColorField label="Barva při najetí" tokenKey="nav.hoverColor" />
        <ColorField label="Barva aktivní položky" tokenKey="nav.activeColor" defaultValue="#0ea5a3" />
      </SubGroup>
      <SubGroup label="Odstup položek">
        <SliderField label="Mezera mezi položkami" tokenKey="nav.itemGap" min={0} max={64} defaultValue={24} />
      </SubGroup>
    </>
  );
}

export function HlavickaSekundarniNavigace() {
  return (
    <SubGroup label="Sekundární navigace">
      <SelectField label="Písmo" tokenKey="navSecondary.fontFamily" options={FONT_OPTIONS} defaultValue="Roboto" />
      <SliderField label="Velikost textu" tokenKey="navSecondary.size" min={10} max={28} defaultValue={13} />
      <ColorField label="Barva textu" tokenKey="navSecondary.color" />
    </SubGroup>
  );
}

export function HlavickaKonverzniTlacitko() {
  return (
    <>
      <SubGroup label="Konverzní tlačítko">
        <TextField label="Text" tokenKey="ctaButton.text" defaultValue="Kontakt" />
        <ColorField label="Pozadí" tokenKey="ctaButton.bg" defaultValue="#2563eb" />
        <ColorField label="Barva textu" tokenKey="ctaButton.color" defaultValue="#ffffff" />
        <SliderField label="Zaoblení" tokenKey="ctaButton.radius" min={0} max={40} defaultValue={8} />
        <PadField label="Vnitřní odsazení" hKey="ctaButton.padding.h" vKey="ctaButton.padding.v" defaultH={16} defaultV={10} />
      </SubGroup>
      <SubGroup label="Hover">
        <ColorField label="Pozadí při najetí" tokenKey="ctaButton.hoverBg" />
        <ColorField label="Text při najetí" tokenKey="ctaButton.hoverColor" />
      </SubGroup>
    </>
  );
}

export function HlavickaSubmenu() {
  return (
    <SubGroup label="Submenu">
      <ColorField label="Pozadí" tokenKey="submenu.bg" defaultValue="#ffffff" />
      <ColorField label="Barva textu" tokenKey="submenu.color" defaultValue="#111111" />
      <SliderField label="Zaoblení" tokenKey="submenu.radius" min={0} max={20} defaultValue={6} />
      <SliderField label="Stín" tokenKey="submenu.shadow" min={0} max={40} defaultValue={8} />
    </SubGroup>
  );
}

export function HlavickaLogo() {
  return (
    <>
      <SubGroup label="Logo">
        <SliderField label="Výška loga" tokenKey="logo.height" min={16} max={120} defaultValue={32} />
        <SelectField label="Zarovnání" tokenKey="logo.align" options={ALIGN_OPTIONS} defaultValue="left" />
      </SubGroup>
      <SubGroup label="Textové logo">
        <SelectField label="Písmo" tokenKey="logo.fontFamily" options={FONT_OPTIONS} defaultValue="Inter" />
        <SelectField label="Tloušťka" tokenKey="logo.fontWeight" options={WEIGHT_OPTIONS} defaultValue="700" />
        <ColorField label="Barva" tokenKey="logo.color" />
      </SubGroup>
    </>
  );
}

export function HlavickaTlacitkoMenu() {
  return (
    <SubGroup label="Tlačítko menu (hamburger)">
      <ColorField label="Barva ikony" tokenKey="hamburger.color" defaultValue="#111111" />
      <ColorField label="Pozadí" tokenKey="hamburger.bg" />
      <SliderField label="Velikost" tokenKey="hamburger.size" min={16} max={48} defaultValue={24} />
    </SubGroup>
  );
}

export function HlavickaJazyk() {
  return (
    <SubGroup label="Jazykový přepínač">
      <ColorField label="Barva textu" tokenKey="lang.color" />
      <ColorField label="Barva aktivního" tokenKey="lang.activeColor" />
      <SliderField label="Velikost" tokenKey="lang.size" min={10} max={20} defaultValue={12} />
    </SubGroup>
  );
}

/* ── Stránka ─────────────────────────────────────────────────────────────── */

export function StrankaObecne() {
  return (
    <>
      <ColorField label="Pozadí" tokenKey="colorBackground" defaultValue="#ffffff" />
      <SubGroup label="Efekty">
        <ToggleField label="Animovat obsah při skrolování" tokenKey="page.animateOnScroll" />
      </SubGroup>
    </>
  );
}

export function StrankaSekce() {
  const [bp, setBp] = useState<Bp>("desktop");
  return (
    <>
      <SubGroup label="Sekce" right={<BreakpointTabs value={bp} onChange={setBp} />}>
        <PadField label="Vnitřní odsazení sekce" hKey={`section.padding.h.${bp}`} vKey={`section.padding.v.${bp}`} defaultH={24} defaultV={64} />
        <SliderField label="Mezera mezi sekcemi" tokenKey={`section.gap.${bp}`} min={0} max={200} defaultValue={0} />
        <SliderField label="Max. šířka obsahu" tokenKey="section.maxWidth" min={640} max={1600} step={10} unit="px" defaultValue={1200} />
      </SubGroup>
      <SubGroup label="Pozadí">
        <ColorField label="Výchozí pozadí sekce" tokenKey="section.bg" />
      </SubGroup>
    </>
  );
}

export function StrankaBloky() {
  const [bp, setBp] = useState<Bp>("desktop");
  return (
    <SubGroup label="Bloky" right={<BreakpointTabs value={bp} onChange={setBp} />}>
      <PadField label="Vnitřní odsazení bloku" hKey={`block.padding.h.${bp}`} vKey={`block.padding.v.${bp}`} defaultH={16} defaultV={16} />
      <SliderField label="Mezera mezi bloky" tokenKey={`block.gap.${bp}`} min={0} max={120} defaultValue={16} />
      <SliderField label="Zaoblení" tokenKey="block.radius" min={0} max={40} defaultValue={8} />
    </SubGroup>
  );
}

/* ── Typografie ──────────────────────────────────────────────────────────── */

export function TypografieObecne() {
  const [bp, setBp] = useState<Bp>("desktop");
  return (
    <>
      <SubGroup label="Výchozí styl" right={<BreakpointTabs value={bp} onChange={setBp} />}>
        <SelectField label="Písmo" tokenKey="fontBody" options={FONT_OPTIONS} defaultValue="Roboto" />
        <SelectField label="Tloušťka" tokenKey="typography.weight" options={WEIGHT_OPTIONS} defaultValue="300" />
        <ToggleField label="Kurzíva" tokenKey="typography.italic" />
        <SliderField label="Velikost textu" tokenKey={`typography.size.${bp}`} min={10} max={32} defaultValue={18} />
        <SliderField label="Řádkování" tokenKey="typography.lineHeight" min={1} max={3} step={0.05} unit="" defaultValue={1.6} />
        <ColorField label="Barva textu" tokenKey="colorText" defaultValue="#111111" />
        <ColorField label="Inverzní barva textu" tokenKey="typography.inverseColor" />
      </SubGroup>
      <SubGroup label="Odrážkový seznam">
        <ColorField label="Barva odrážky" tokenKey="bullet.color" defaultValue="#111111" />
        <ColorField label="Barva inverzní odrážky" tokenKey="bullet.inverseColor" />
      </SubGroup>
      <SubGroup label="Odkazy">
        <ColorField label="Barva odkazu" tokenKey="link.color" defaultValue="#0ea5a3" />
        <ColorField label="Barva odkazu při najetí" tokenKey="link.hoverColor" defaultValue="#0ea5a3" />
        <ToggleField label="Podtrhnout odkazy" tokenKey="link.underline" defaultValue />
        <ToggleField label="Zobrazit externí odkazy s ikonkou" tokenKey="link.externalIcon" defaultValue />
      </SubGroup>
    </>
  );
}

function makeHeadingPanel(level: 1 | 2 | 3 | 4, defaults: { size: number; weight: string; lineHeight: number }) {
  return function HeadingPanel() {
    const [bp, setBp] = useState<Bp>("desktop");
    const prefix = `h${level}`;
    return (
      <>
        <SubGroup label={`Nadpis ${level}`} right={<BreakpointTabs value={bp} onChange={setBp} />}>
          <SelectField label="Písmo" tokenKey={`${prefix}.fontFamily`} options={FONT_OPTIONS} defaultValue="Roboto" />
          <SelectField label="Tloušťka" tokenKey={`${prefix}.weight`} options={WEIGHT_OPTIONS} defaultValue={defaults.weight} />
          <ToggleField label="Kurzíva" tokenKey={`${prefix}.italic`} />
          <SliderField label="Velikost" tokenKey={`${prefix}.size.${bp}`} min={12} max={120} defaultValue={defaults.size} />
          <SliderField label="Řádkování" tokenKey={`${prefix}.lineHeight`} min={0.8} max={2.5} step={0.05} unit="" defaultValue={defaults.lineHeight} />
          <SliderField label="Mezera pod" tokenKey={`${prefix}.marginBottom`} min={0} max={80} defaultValue={16} />
          <ColorField label="Barva" tokenKey={`${prefix}.color`} defaultValue="#111111" />
          <ColorField label="Inverzní barva" tokenKey={`${prefix}.inverseColor`} />
        </SubGroup>
      </>
    );
  };
}

export const TypografieNadpisy = function TypografieNadpisy() {
  return (
    <SubGroup label="Nadpisy (společné)">
      <SelectField label="Písmo (všechny)" tokenKey="fontHeading" options={FONT_OPTIONS} defaultValue="Roboto" />
      <ColorField label="Výchozí barva" tokenKey="heading.color" defaultValue="#111111" />
      <ColorField label="Inverzní barva" tokenKey="heading.inverseColor" />
    </SubGroup>
  );
};
export const TypografieNadpis1 = makeHeadingPanel(1, { size: 56, weight: "700", lineHeight: 1.1 });
export const TypografieNadpis2 = makeHeadingPanel(2, { size: 40, weight: "700", lineHeight: 1.15 });
export const TypografieNadpis3 = makeHeadingPanel(3, { size: 28, weight: "600", lineHeight: 1.2 });
export const TypografieNadpis4 = makeHeadingPanel(4, { size: 20, weight: "600", lineHeight: 1.3 });

/* ── Textové styly (3c) — živý přehled globálních stylů ─────────────────── */

/** Přehled pojmenovaných textových stylů s náhledem z aktuálních tokenů.
 *  Prvky se na styl navazují v textovém toolbaru (dropdown „Styl"). */
export function TypografieStyly() {
  const { get } = useDesignTokens();
  const heading = String(get("fontHeading", "Roboto"));
  const body = String(get("fontBody", "Roboto"));

  const rows = [
    { key: "h1",   label: "Nadpis 1", defaults: { size: 56, weight: "700", lh: 1.1 } },
    { key: "h2",   label: "Nadpis 2", defaults: { size: 40, weight: "700", lh: 1.15 } },
    { key: "h3",   label: "Nadpis 3", defaults: { size: 28, weight: "600", lh: 1.2 } },
    { key: "h4",   label: "Nadpis 4", defaults: { size: 20, weight: "600", lh: 1.3 } },
  ] as const;
  // Náhled je zmenšený, ať se velké nadpisy vejdou do panelu
  const PREVIEW_SCALE = 0.5;
  // Podklad náhledu = skutečné pozadí webu (tmavé šablony mají světlý text)
  const previewBg = String(get("colorBackground", "#ffffff"));
  const isDarkBg = (() => {
    const m = /^#?([0-9a-f]{6})$/i.exec(previewBg.trim());
    if (!m) return false;
    const n = parseInt(m[1], 16);
    const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    return lum < 128;
  })();
  const fallbackText = isDarkBg ? "#f5f5f5" : "#111111";
  const fallbackBody = isDarkBg ? "#d5d5d5" : "#333333";

  return (
    <>
      <SubGroup label="Textové styly">
        <div className="rounded-lg px-3.5 py-2 space-y-0.5 ring-1 ring-[var(--vs-border-strong)]" style={{ background: previewBg }}>
          {rows.map((r) => {
            const size = Number(get(`${r.key}.size.desktop`, get(`${r.key}.size`, r.defaults.size)));
            const weight = String(get(`${r.key}.weight`, r.defaults.weight));
            const color = String(get(`${r.key}.color`, get("heading.color", fallbackText)));
            const ff = String(get(`${r.key}.fontFamily`, heading));
            const lh = Number(get(`${r.key}.lineHeight`, r.defaults.lh));
            return (
              <div key={r.key} className="flex items-baseline justify-between gap-3 border-b border-[rgba(128,128,128,0.2)] py-2 last:border-b-0">
                <span
                  className="truncate"
                  style={{ fontSize: Math.max(13, size * PREVIEW_SCALE), fontWeight: Number(weight), color, fontFamily: ff, lineHeight: lh }}
                >
                  {r.label}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-[#999]">{size}px · {weight}</span>
              </div>
            );
          })}
          {(() => {
            const size = Number(get("typography.size.desktop", get("typography.size", 16)));
            const weight = String(get("typography.weight", "400"));
            const color = String(get("colorText", fallbackBody));
            const lh = Number(get("typography.lineHeight", 1.6));
            return (
              <div className="flex items-baseline justify-between gap-3 py-2">
                <span className="truncate" style={{ fontSize: Math.max(12, size * 0.85), fontWeight: Number(weight), color, fontFamily: body, lineHeight: lh }}>
                  Odstavec — běžný text webu
                </span>
                <span className="shrink-0 font-mono text-[10px] text-[#999]">{size}px · {weight}</span>
              </div>
            );
          })()}
        </div>
        <p className="mt-2 text-[10.5px] leading-snug text-[var(--vs-text-muted)]">
          Styly upravíš v sekcích Nadpis 1–4 a Obecné. Libovolný text na webu
          navážeš na styl v textovém toolbaru (rozbalovací pole „Styl") — změna
          stylu se pak propíše všude najednou.
        </p>
      </SubGroup>
    </>
  );
}

/* ── Patička ─────────────────────────────────────────────────────────────── */

export function Paticka() {
  const [bp, setBp] = useState<Bp>("desktop");
  return (
    <>
      <SubGroup label="Patička" right={<BreakpointTabs value={bp} onChange={setBp} />}>
        <ColorField label="Pozadí" tokenKey="footer.bg" defaultValue="#0b0f14" />
        <ColorField label="Barva textu" tokenKey="footer.color" defaultValue="#f4f4f7" />
        <ColorField label="Barva nadpisu" tokenKey="footer.headingColor" />
        <PadField label="Vnitřní odsazení" hKey={`footer.padding.h.${bp}`} vKey={`footer.padding.v.${bp}`} defaultH={24} defaultV={48} />
        <SliderField label="Mezera mezi sloupci" tokenKey="footer.colGap" min={0} max={120} defaultValue={32} />
      </SubGroup>
      <SubGroup label="Odkazy v patičce">
        <ColorField label="Barva odkazu" tokenKey="footer.linkColor" />
        <ColorField label="Barva odkazu při najetí" tokenKey="footer.linkHoverColor" />
      </SubGroup>
    </>
  );
}

/* ── Layout ──────────────────────────────────────────────────────────────── */

/**
 * Shared body for all three Boxy styles (Výchozí / Primární / Sekundární).
 * Each variant writes under its own prefix (`card.default.*`, `card.primary.*`,
 * `card.secondary.*`) so they coexist and can be reset independently.
 */
function BoxStylePanel({ prefix, defaults }: { prefix: string; defaults: { padH: number; padV: number; bg?: string; titleColor?: string; textColor?: string } }) {
  const [bp, setBp] = useState<Bp>("desktop");
  return (
    <>
      <SubGroup label="Barvy">
        <ColorField label="Barva nadpisu" tokenKey={`${prefix}.titleColor`} defaultValue={defaults.titleColor ?? "#111111"} />
        <ColorField label="Barva textu"   tokenKey={`${prefix}.textColor`}  defaultValue={defaults.textColor ?? "#374151"} />
        <ColorField label="Pozadí"        tokenKey={`${prefix}.bg`}         defaultValue={defaults.bg ?? ""} />
      </SubGroup>
      <SubGroup label="Vnitřní odsazení" right={<BreakpointTabs value={bp} onChange={setBp} />}>
        <PadField label="Vnitřní odsazení" hKey={`${prefix}.padding.h.${bp}`} vKey={`${prefix}.padding.v.${bp}`} defaultH={defaults.padH} defaultV={defaults.padV} />
      </SubGroup>
      <BorderField colorKey={`${prefix}.border.color`} sizeKey={`${prefix}.border.size`} radiusKey={`${prefix}.border.radius`} />
      <ShadowField colorKey={`${prefix}.shadow.color`} blurKey={`${prefix}.shadow.blur`} xKey={`${prefix}.shadow.x`} yKey={`${prefix}.shadow.y`} />
    </>
  );
}

export const BoxyVychozi   = () => <BoxStylePanel prefix="card.default"   defaults={{ padH: 24, padV: 24 }} />;
export const BoxyPrimarni  = () => <BoxStylePanel prefix="card.primary"   defaults={{ padH: 24, padV: 24, bg: "#f5f5f5" }} />;
export const BoxySekundarni= () => <BoxStylePanel prefix="card.secondary" defaults={{ padH: 24, padV: 24, bg: "#fafafa" }} />;

export function LayoutLayout() {
  return (
    <SubGroup label="Rozestup položek">
      <PadField label="Odsazení položek" hKey="layout.gap.h" vKey="layout.gap.v" defaultH={10} defaultV={10} />
    </SubGroup>
  );
}

export function LayoutObsahovySlider() {
  const [bp, setBp] = useState<Bp>("desktop");
  return (
    <SubGroup label="Vnitřní odsazení" right={<BreakpointTabs value={bp} onChange={setBp} />}>
      <PadField label="Vnitřní odsazení" hKey={`slider.padding.h.${bp}`} vKey={`slider.padding.v.${bp}`} defaultH={50} defaultV={30} />
    </SubGroup>
  );
}

/**
 * Harmonika styles (Klasický / Zobrazit více). Tokens are prefixed so the two
 * coexist; on the public render they target generic accordion DOM patterns
 * (`details`, `[class*="accordion"]`, `[class*="faq"]`).
 */
function HarmonikaStylePanel({ prefix, defaults }: { prefix: string; defaults: { titleSize: number; iconSize: number } }) {
  return (
    <>
      <SubGroup label="Titulek položky">
        <SelectField label="Písmo"      tokenKey={`${prefix}.title.fontFamily`} options={FONT_OPTIONS}   defaultValue="Inter" />
        <SelectField label="Tloušťka"   tokenKey={`${prefix}.title.weight`}     options={WEIGHT_OPTIONS} defaultValue="400" />
        <ToggleField label="Kurzíva"    tokenKey={`${prefix}.title.italic`} />
        <SliderField label="Velikost titulku" tokenKey={`${prefix}.title.size`} min={10} max={48} defaultValue={defaults.titleSize} />
        <SliderField label="Proložení znaků" tokenKey={`${prefix}.title.tracking`} min={-2} max={10} step={0.1} unit="px" defaultValue={0} />
        <ColorField  label="Barva titulku" tokenKey={`${prefix}.title.color`} defaultValue="#111111" />
        <SliderField label="Velikost ikonky" tokenKey={`${prefix}.icon.size`} min={10} max={48} defaultValue={defaults.iconSize} />
      </SubGroup>
      <SubGroup label="Styl položky">
        <ColorField label="Barva textu" tokenKey={`${prefix}.textColor`} defaultValue="#374151" />
        <ColorField label="Pozadí"      tokenKey={`${prefix}.bg`} />
        <PadField label="Vnitřní odsazení" hKey={`${prefix}.padding.h`} vKey={`${prefix}.padding.v`} defaultH={16} defaultV={16} />
        <BorderField colorKey={`${prefix}.border.color`} sizeKey={`${prefix}.border.size`} radiusKey={`${prefix}.border.radius`} />
        <ShadowField colorKey={`${prefix}.shadow.color`} blurKey={`${prefix}.shadow.blur`} xKey={`${prefix}.shadow.x`} yKey={`${prefix}.shadow.y`} />
        <SliderField label="Odsazení položky" tokenKey={`${prefix}.gap`} min={0} max={48} defaultValue={10} />
      </SubGroup>
    </>
  );
}

export const HarmonikaKlasicky    = () => <HarmonikaStylePanel prefix="accordion.classic" defaults={{ titleSize: 16, iconSize: 20 }} />;
export const HarmonikaZobrazitVic = () => <HarmonikaStylePanel prefix="accordion.more"    defaults={{ titleSize: 16, iconSize: 20 }} />;

export function LayoutZalozky() {
  const [bp, setBp] = useState<Bp>("desktop");
  return (
    <>
      <SubGroup label="Písmo">
        <SelectField label="Písmo"    tokenKey="tabs.fontFamily" options={FONT_OPTIONS}   defaultValue="Inter" />
        <SelectField label="Tloušťka" tokenKey="tabs.weight"     options={WEIGHT_OPTIONS} defaultValue="500" />
        <ToggleField label="Kurzíva"  tokenKey="tabs.italic" />
      </SubGroup>
      <SubGroup label="Nadpis záložky" right={<BreakpointTabs value={bp} onChange={setBp} />}>
        <SliderField label="Velikost textu"    tokenKey={`tabs.size.${bp}`} min={10} max={48} defaultValue={25} />
        <SliderField label="Proložení znaků"   tokenKey="tabs.tracking"     min={-2} max={10} step={0.1} unit="px" defaultValue={0} />
        <ColorField  label="Barva textu"       tokenKey="tabs.color"        defaultValue="#111111" />
        <ColorField  label="Pozadí"            tokenKey="tabs.bg" />
        <BorderField colorKey="tabs.border.color" sizeKey="tabs.border.size" radiusKey="tabs.border.radius" />
        <SelectField label="Varianta ohraničení" tokenKey="tabs.borderVariant" options={[
          { value: "default", label: "Výchozí" },
          { value: "underline", label: "Podtržení" },
          { value: "pill", label: "Pilulky" },
          { value: "boxed", label: "Boxy" },
        ]} defaultValue="default" />
        <PadField label="Vnitřní odsazení" hKey={`tabs.padding.h.${bp}`} vKey={`tabs.padding.v.${bp}`} defaultH={14} defaultV={9} />
        <SliderField label="Odsazení položky" tokenKey="tabs.gap" min={0} max={48} defaultValue={10} />
      </SubGroup>
      <SubGroup label="Styl aktivní záložky">
        <ColorField label="Barva textu"  tokenKey="tabs.active.color" defaultValue="#111111" />
        <ColorField label="Pozadí"       tokenKey="tabs.active.bg" />
        <ColorField label="Barva okraje" tokenKey="tabs.active.borderColor" defaultValue="#2563eb" />
      </SubGroup>
    </>
  );
}

/* ── Obsah / Tlačítka ────────────────────────────────────────────────────── */

export function TlacitkaObecne() {
  return (
    <>
      <SubGroup label="Písmo">
        <SelectField label="Písmo" tokenKey="btn.fontFamily" options={FONT_OPTIONS} defaultValue="Roboto" />
        <SliderField label="Velikost textu"        tokenKey="btn.size.medium" min={8}  max={32} defaultValue={15} />
        <SliderField label="Velikost textu (malá)" tokenKey="btn.size.small"  min={8}  max={24} defaultValue={12} />
        <SliderField label="Velikost textu (velká)"tokenKey="btn.size.large"  min={10} max={48} defaultValue={18} />
        <ToggleField label="Verzálky" tokenKey="btn.uppercase" defaultValue />
        <SliderField label="Proložení znaků" tokenKey="btn.tracking" min={-2} max={10} step={0.05} unit="em" defaultValue={0} />
        <PadField label="Vnitřní odsazení" hKey="btn.padding.h" vKey="btn.padding.v" defaultH={1.6} defaultV={0.6} />
      </SubGroup>
      <SubGroup label="Ikona">
        <SliderField label="Velikost"        tokenKey="btn.icon.size.medium" min={6}  max={32} defaultValue={10} />
        <SliderField label="Velikost (malá)" tokenKey="btn.icon.size.small"  min={6}  max={24} defaultValue={8} />
        <SliderField label="Velikost (velká)"tokenKey="btn.icon.size.large"  min={6}  max={40} defaultValue={12} />
        <SliderField label="Mezera" tokenKey="btn.icon.gap" min={0} max={3} step={0.05} unit="em" defaultValue={0.4} />
      </SubGroup>
    </>
  );
}

/** Shared body for the three button styles (Výchozí / Primární / Inverzní). */
function ButtonStylePanel({ prefix, defaults }: { prefix: string; defaults: { weight: string; color: string; bg: string } }) {
  return (
    <>
      <SubGroup label="Výchozí styl">
        <SelectField label="Tloušťka" tokenKey={`${prefix}.weight`} options={WEIGHT_OPTIONS} defaultValue={defaults.weight} />
        <ToggleField label="Kurzíva"  tokenKey={`${prefix}.italic`} />
        <ColorField  label="Barva textu" tokenKey={`${prefix}.color`} defaultValue={defaults.color} />
        <ColorField  label="Pozadí"      tokenKey={`${prefix}.bg`}    defaultValue={defaults.bg} />
        <BorderField colorKey={`${prefix}.border.color`} sizeKey={`${prefix}.border.size`} radiusKey={`${prefix}.border.radius`} />
      </SubGroup>
      <SubGroup label="Styl při najetí">
        <ColorField label="Barva textu"  tokenKey={`${prefix}.hover.color`} />
        <ColorField label="Pozadí"       tokenKey={`${prefix}.hover.bg`} />
        <ColorField label="Barva okraje" tokenKey={`${prefix}.hover.borderColor`} />
      </SubGroup>
    </>
  );
}

export const TlacitkaVychozi  = () => <ButtonStylePanel prefix="btn.default" defaults={{ weight: "400", color: "#111111", bg: "#ffffff" }} />;
export const TlacitkaPrimarni = () => <ButtonStylePanel prefix="btn.primary" defaults={{ weight: "500", color: "#ffffff", bg: "#2563eb" }} />;
export const TlacitkaInverzni = () => <ButtonStylePanel prefix="btn.inverse" defaults={{ weight: "500", color: "#111111", bg: "#ffffff" }} />;

/* ── Obsah / Obrázky ─────────────────────────────────────────────────────── */

export function ObrazkyObecne() {
  return (
    <>
      <SubGroup label="Styl obrázku">
        <SliderField label="Zaoblené rohy" tokenKey="image.radius" min={0} max={64} defaultValue={0} />
      </SubGroup>
      <SubGroup label="Nastavení pro odkazy">
        <ColorField label="Barva filtru"           tokenKey="image.filter.color" />
        <ColorField label="Barva filtru na najetí" tokenKey="image.filter.hoverColor" />
        <ToggleField label="Zapnout efekt zoom na odkaz" tokenKey="image.zoom" />
        <ShadowField label="Stín"          colorKey="image.shadow.color"      blurKey="image.shadow.blur"      xKey="image.shadow.x"      yKey="image.shadow.y" />
        <ShadowField label="Stín na najetí" colorKey="image.hoverShadow.color" blurKey="image.hoverShadow.blur" xKey="image.hoverShadow.x" yKey="image.hoverShadow.y" />
      </SubGroup>
      <SubGroup label="Popisek pod obrázkem">
        <ColorField label="Barva textu" tokenKey="image.caption.color" defaultValue="#111111" />
      </SubGroup>
      <SubGroup label="Popisek uvnitř obrázku (galerie a slider)">
        <ColorField label="Barva textu" tokenKey="image.captionInside.color" />
        <ColorField label="Pozadí"      tokenKey="image.captionInside.bg" />
      </SubGroup>
    </>
  );
}

export function ObrazkyPlakat() {
  return (
    <SubGroup label="Plakát">
      <SelectField label="Písmo titulku" tokenKey="poster.fontFamily" options={FONT_OPTIONS} />
      <SliderField label="Velikost titulku" tokenKey="poster.title.size" min={12} max={80} defaultValue={32} />
      <ColorField  label="Barva titulku"    tokenKey="poster.title.color" defaultValue="#ffffff" />
      <ColorField  label="Pozadí překrytí"  tokenKey="poster.overlay.bg" defaultValue="rgba(0,0,0,0.35)" />
      <PadField label="Vnitřní odsazení" hKey="poster.padding.h" vKey="poster.padding.v" defaultH={24} defaultV={24} />
    </SubGroup>
  );
}

export function ObrazkyKarta() {
  return (
    <SubGroup label="Karta s obrázkem">
      <ColorField label="Pozadí karty" tokenKey="imgCard.bg" defaultValue="#ffffff" />
      <ColorField label="Barva textu"  tokenKey="imgCard.color" />
      <PadField   label="Vnitřní odsazení" hKey="imgCard.padding.h" vKey="imgCard.padding.v" defaultH={20} defaultV={20} />
      <BorderField colorKey="imgCard.border.color" sizeKey="imgCard.border.size" radiusKey="imgCard.border.radius" />
      <ShadowField colorKey="imgCard.shadow.color" blurKey="imgCard.shadow.blur" xKey="imgCard.shadow.x" yKey="imgCard.shadow.y" />
    </SubGroup>
  );
}

export function ObrazkyKolaz() {
  return (
    <SubGroup label="Koláž">
      <SliderField label="Mezera mezi obrázky" tokenKey="collage.gap" min={0} max={48} defaultValue={8} />
      <SliderField label="Zaoblení"            tokenKey="collage.radius" min={0} max={40} defaultValue={0} />
    </SubGroup>
  );
}

export function ObrazkyPrekryti() {
  return (
    <SubGroup label="Překrytí (overlay)">
      <ColorField label="Barva překrytí" tokenKey="overlay.color" defaultValue="rgba(0,0,0,0.35)" />
      <SliderField label="Průhlednost" tokenKey="overlay.opacity" min={0} max={1} step={0.05} unit="" defaultValue={0.35} />
    </SubGroup>
  );
}

export function ObrazkyIkonky() {
  return (
    <SubGroup label="Ikonky">
      <ColorField  label="Barva"            tokenKey="icon.color" />
      <ColorField  label="Barva při najetí" tokenKey="icon.hoverColor" />
      <SliderField label="Velikost"         tokenKey="icon.size" min={12} max={80} defaultValue={24} />
    </SubGroup>
  );
}

/* ── Obsah / Slider ──────────────────────────────────────────────────────── */

export function SliderOdrazky() {
  return (
    <SubGroup label="Navigační odrážky slideru">
      <ColorField  label="Barva tečky"        tokenKey="dots.color" defaultValue="#cccccc" />
      <ColorField  label="Barva aktivní tečky" tokenKey="dots.activeColor" defaultValue="#2563eb" />
      <SliderField label="Velikost"           tokenKey="dots.size" min={4} max={20} defaultValue={8} />
      <SliderField label="Mezera"             tokenKey="dots.gap"  min={0} max={32} defaultValue={8} />
    </SubGroup>
  );
}

export function SliderSipky() {
  return (
    <SubGroup label="Navigační šipky slideru">
      <ColorField  label="Barva šipky"    tokenKey="arrows.color" defaultValue="#111111" />
      <ColorField  label="Barva při najetí" tokenKey="arrows.hoverColor" />
      <ColorField  label="Pozadí"         tokenKey="arrows.bg" />
      <SliderField label="Velikost"       tokenKey="arrows.size" min={16} max={64} defaultValue={32} />
      <SliderField label="Zaoblení"       tokenKey="arrows.radius" min={0} max={32} defaultValue={0} />
    </SubGroup>
  );
}

/* ── Obsah / Formuláře ───────────────────────────────────────────────────── */

function FormStylePanel({ prefix, defaults }: { prefix: string; defaults: { fieldBg: string; fieldColor: string; labelColor: string } }) {
  return (
    <>
      <SubGroup label="Styl políčka">
        <SliderField label="Velikost popisku"   tokenKey={`${prefix}.label.size`}        min={10} max={32} defaultValue={18} />
        <SliderField label="Proložení znaků"    tokenKey={`${prefix}.label.tracking`}    min={-2} max={10} step={0.1} unit="px" defaultValue={0} />
        <SliderField label="Velikost hodnoty"   tokenKey={`${prefix}.value.size`}        min={10} max={32} defaultValue={16} />
        <SliderField label="Velikost vysvětlivky" tokenKey={`${prefix}.hint.size`}       min={8}  max={24} defaultValue={11} />
        <SliderField label="Proložení znaků"    tokenKey={`${prefix}.value.tracking`}    min={-2} max={10} step={0.1} unit="px" defaultValue={0} />
        <ColorField  label="Barva názvu pole"   tokenKey={`${prefix}.label.color`}    defaultValue={defaults.labelColor} />
        <ColorField  label="Barva hodnoty"      tokenKey={`${prefix}.value.color`}    defaultValue={defaults.fieldColor} />
        <ColorField  label="Barva popisku"      tokenKey={`${prefix}.hint.color`} />
        <ColorField  label="Pozadí políčka"     tokenKey={`${prefix}.field.bg`}    defaultValue={defaults.fieldBg} />
        <ColorField  label="Zástupná barva"     tokenKey={`${prefix}.placeholder.color`} />
        <BorderField colorKey={`${prefix}.border.color`} sizeKey={`${prefix}.border.size`} radiusKey={`${prefix}.border.radius`} />
        <PadField label="Rozestup položek" hKey={`${prefix}.gap.h`} vKey={`${prefix}.gap.v`} defaultH={12} defaultV={8} />
      </SubGroup>
      <SubGroup label="Styl aktivního políčka">
        <ColorField label="Barva textu"  tokenKey={`${prefix}.active.color`} />
        <ColorField label="Pozadí"       tokenKey={`${prefix}.active.bg`} />
        <ColorField label="Barva okraje" tokenKey={`${prefix}.active.borderColor`} defaultValue="#2563eb" />
      </SubGroup>
    </>
  );
}

export const FormulareVychozi = () => <FormStylePanel prefix="form.default" defaults={{ fieldBg: "#ffffff", fieldColor: "#111111", labelColor: "#111111" }} />;
export const FormulareInverzni= () => <FormStylePanel prefix="form.inverse" defaults={{ fieldBg: "transparent", fieldColor: "#ffffff", labelColor: "#ffffff" }} />;
export const FormulareSPozadim= () => <FormStylePanel prefix="form.filled"  defaults={{ fieldBg: "#f5f5f5", fieldColor: "#111111", labelColor: "#111111" }} />;

/* ── Obsah / Výpisy ──────────────────────────────────────────────────────── */

export function VypisyObecne() {
  const [bp, setBp] = useState<Bp>("desktop");
  return (
    <>
      <SubGroup label="Styl položky" right={<BreakpointTabs value={bp} onChange={setBp} hide={["tablet"]} />}>
        <SliderField label="Velikost titulku" tokenKey={`listing.title.size.${bp}`} min={12} max={48} defaultValue={25} />
        <SliderField label="Proložení znaků"  tokenKey="listing.title.tracking"      min={-2} max={10} step={0.1} unit="px" defaultValue={0} />
        <SliderField label="Velikost textu"   tokenKey={`listing.text.size.${bp}`}  min={10} max={32} defaultValue={16} />
        <ColorField  label="Barva titulku"        tokenKey="listing.title.color"      defaultValue="#111111" />
        <ColorField  label="Barva titulku po najetí" tokenKey="listing.title.hoverColor" />
        <ColorField  label="Barva textu"          tokenKey="listing.text.color"       defaultValue="#374151" />
        <BorderField colorKey="listing.border.color" sizeKey="listing.border.size" radiusKey="listing.border.radius" />
      </SubGroup>
      <SubGroup label="Zvýrazněná položka">
        <ColorField label="Barva titulku" tokenKey="listing.featured.titleColor" />
        <ColorField label="Barva textu"   tokenKey="listing.featured.textColor" />
        <ColorField label="Pozadí"        tokenKey="listing.featured.bg" />
      </SubGroup>
    </>
  );
}

export function VypisyKarta() {
  return (
    <SubGroup label="Karta výpisu">
      <ColorField label="Pozadí karty" tokenKey="listing.card.bg" defaultValue="#ffffff" />
      <ColorField label="Barva textu"  tokenKey="listing.card.color" />
      <PadField   label="Vnitřní odsazení" hKey="listing.card.padding.h" vKey="listing.card.padding.v" defaultH={20} defaultV={20} />
      <BorderField colorKey="listing.card.border.color" sizeKey="listing.card.border.size" radiusKey="listing.card.border.radius" />
      <ShadowField colorKey="listing.card.shadow.color" blurKey="listing.card.shadow.blur" xKey="listing.card.shadow.x" yKey="listing.card.shadow.y" />
    </SubGroup>
  );
}

export function VypisyObrazekPozadi() {
  return (
    <SubGroup label="Obrázek na pozadí">
      <ColorField  label="Barva překrytí" tokenKey="listing.bgImage.overlay" defaultValue="rgba(0,0,0,0.45)" />
      <SliderField label="Průhlednost"    tokenKey="listing.bgImage.opacity" min={0} max={1} step={0.05} unit="" defaultValue={0.45} />
      <ColorField  label="Barva titulku"  tokenKey="listing.bgImage.titleColor" defaultValue="#ffffff" />
      <ColorField  label="Barva textu"    tokenKey="listing.bgImage.textColor"  defaultValue="#f5f5f5" />
    </SubGroup>
  );
}

export function VypisyTabulka() {
  return (
    <SubGroup label="Tabulka">
      <ColorField  label="Pozadí hlavičky" tokenKey="table.head.bg" defaultValue="#f5f5f5" />
      <ColorField  label="Barva textu hlavičky" tokenKey="table.head.color" defaultValue="#111111" />
      <ColorField  label="Pozadí řádku"   tokenKey="table.row.bg" />
      <ColorField  label="Barva textu"    tokenKey="table.row.color" defaultValue="#374151" />
      <ColorField  label="Barva okraje"   tokenKey="table.border.color" defaultValue="#e5e7eb" />
      <SliderField label="Tloušťka okraje"tokenKey="table.border.size" min={0} max={6} defaultValue={1} />
      <PadField label="Vnitřní odsazení buňky" hKey="table.cell.padding.h" vKey="table.cell.padding.v" defaultH={12} defaultV={10} />
    </SubGroup>
  );
}

export function VypisySocSite() {
  return (
    <SubGroup label="Sociální sítě (ve výpisu)">
      <ColorField  label="Barva ikony"      tokenKey="listing.social.color" />
      <ColorField  label="Barva při najetí" tokenKey="listing.social.hoverColor" />
      <SliderField label="Velikost"         tokenKey="listing.social.size" min={12} max={48} defaultValue={20} />
      <SliderField label="Mezera"           tokenKey="listing.social.gap"  min={0}  max={32} defaultValue={8} />
    </SubGroup>
  );
}

export function VypisyMeta() {
  return (
    <SubGroup label="Meta záznamů">
      <ColorField  label="Barva"        tokenKey="listing.meta.color" defaultValue="#6b7280" />
      <SliderField label="Velikost"     tokenKey="listing.meta.size"  min={8} max={20} defaultValue={12} />
      <ToggleField label="Verzálky"     tokenKey="listing.meta.uppercase" />
      <SliderField label="Proložení znaků" tokenKey="listing.meta.tracking" min={0} max={10} step={0.1} unit="px" defaultValue={0} />
    </SubGroup>
  );
}

/* ── Obsah / Citace ──────────────────────────────────────────────────────── */

export function ObsahCitace() {
  return (
    <SubGroup label="Citace">
      <SelectField label="Písmo" tokenKey="quote.fontFamily" options={FONT_OPTIONS} />
      <SliderField label="Velikost textu" tokenKey="quote.size" min={12} max={48} defaultValue={20} />
      <ColorField  label="Barva textu"   tokenKey="quote.color" />
      <ColorField  label="Barva čáry"    tokenKey="quote.borderColor" defaultValue="#2563eb" />
      <ToggleField label="Kurzíva"       tokenKey="quote.italic" defaultValue />
    </SubGroup>
  );
}

/* ── Obsah / Ikonky soc. sítí ────────────────────────────────────────────── */

export function ObsahSocSite() {
  return (
    <SubGroup label="Ikonky sociálních sítí">
      <ColorField  label="Barva"            tokenKey="social.color" />
      <ColorField  label="Barva při najetí" tokenKey="social.hoverColor" />
      <SliderField label="Velikost"         tokenKey="social.size" min={16} max={48} defaultValue={24} />
      <SliderField label="Mezera mezi ikonkami" tokenKey="social.gap" min={0} max={40} defaultValue={12} />
    </SubGroup>
  );
}

/* ── Obsah / Dělící čára ─────────────────────────────────────────────────── */

export function ObsahDelici() {
  return (
    <SubGroup label="Dělící čára">
      <ColorField  label="Barva"      tokenKey="divider.color" defaultValue="#e5e7eb" />
      <SliderField label="Tloušťka"   tokenKey="divider.thickness" min={1} max={10} defaultValue={1} />
      <SliderField label="Mezera nad" tokenKey="divider.marginTop" min={0} max={80} defaultValue={16} />
      <SliderField label="Mezera pod" tokenKey="divider.marginBottom" min={0} max={80} defaultValue={16} />
    </SubGroup>
  );
}


/* ── Ostatní / Cookie lišta ─────────────────────────────────────────────── */

export function CookieObecne() {
  return (
    <>
      <SubGroup label="Styl lišty">
        <SelectField label="Typ lišty" tokenKey="cookie.type" options={[
          { value: "bottom-fixed", label: "Fixní lišta dole" },
          { value: "top-fixed",    label: "Fixní lišta nahoře" },
          { value: "dialog",       label: "Dialog" },
          { value: "inline",       label: "Inline (uvnitř obsahu)" },
        ]} defaultValue="bottom-fixed" />
        <ColorField  label="Pozadí"               tokenKey="cookie.bg" defaultValue="#ffffff" />
        <SliderField label="Maximální šířka obsahu" tokenKey="cookie.maxWidth"   min={320} max={1600} step={4} unit="px" defaultValue={1284} />
        <SliderField label="Vnější odsazení"      tokenKey="cookie.margin"     min={0} max={80} defaultValue={0} />
        <SliderField label="Zaoblení"             tokenKey="cookie.radius"     min={0} max={40} defaultValue={0} />
        <ShadowField label="Stín" colorKey="cookie.shadow.color" blurKey="cookie.shadow.blur" xKey="cookie.shadow.x" yKey="cookie.shadow.y" />
      </SubGroup>
      <SubGroup label="Styl obsahu">
        <SliderField label="Styl nadpisu"   tokenKey="cookie.title.size" min={10} max={32} defaultValue={16} />
        <SliderField label="Velikost textu" tokenKey="cookie.text.size"  min={10} max={28} defaultValue={16} />
        <ColorField  label="Barva textu"    tokenKey="cookie.color" defaultValue="#111111" />
        <PadField label="Vnitřní odsazení" hKey="cookie.padding.h" vKey="cookie.padding.v" defaultH={16} defaultV={16} />
      </SubGroup>
      <SubGroup label="Typ: Dialog">
        <ColorField label="Překrytí pozadí" tokenKey="cookie.dialog.overlay" defaultValue="rgba(0,0,0,0.5)" />
      </SubGroup>
    </>
  );
}

/** Reused for all 3 cookie buttons (potvrdit/odmítnout/nastavení). */
function CookieButtonPanel({ prefix, defaults }: { prefix: string; defaults: { color: string; bg: string; bc: string } }) {
  return (
    <>
      <SubGroup label="Výchozí styl">
        <SelectField label="Tloušťka" tokenKey={`${prefix}.weight`} options={WEIGHT_OPTIONS} defaultValue="400" />
        <ToggleField label="Kurzíva"  tokenKey={`${prefix}.italic`} />
        <ColorField  label="Barva textu" tokenKey={`${prefix}.color`} defaultValue={defaults.color} />
        <ColorField  label="Pozadí"      tokenKey={`${prefix}.bg`}    defaultValue={defaults.bg} />
        <BorderField colorKey={`${prefix}.border.color`} sizeKey={`${prefix}.border.size`} radiusKey={`${prefix}.border.radius`} />
      </SubGroup>
      <SubGroup label="Styl při najetí">
        <ColorField label="Barva textu"  tokenKey={`${prefix}.hover.color`} />
        <ColorField label="Pozadí"       tokenKey={`${prefix}.hover.bg`} />
        <ColorField label="Barva okraje" tokenKey={`${prefix}.hover.borderColor`} />
      </SubGroup>
    </>
  );
}

export const CookieTlPotvrdit   = () => <CookieButtonPanel prefix="cookie.btnAccept"   defaults={{ color: "#ffffff", bg: "#c8a96e", bc: "#c8a96e" }} />;
export const CookieTlOdmitnout  = () => <CookieButtonPanel prefix="cookie.btnReject"   defaults={{ color: "#111111", bg: "transparent", bc: "#111111" }} />;
export const CookieTlNastaveni  = () => <CookieButtonPanel prefix="cookie.btnSettings" defaults={{ color: "#111111", bg: "transparent", bc: "#111111" }} />;

/* ── Ostatní / Vyhledávání ──────────────────────────────────────────────── */

export function VyhledavaciPanel() {
  return (
    <>
      <SubGroup label="Styl wrapperu">
        <ColorField  label="Pozadí"           tokenKey="search.wrapper.bg" />
        <ColorField  label="Překrytí pozadí"  tokenKey="search.wrapper.overlay" />
        <PadField    label="Vnitřní odsazení" hKey="search.wrapper.padding.h" vKey="search.wrapper.padding.v" defaultH={24} defaultV={24} />
        <SliderField label="Maximální šířka obsahu" tokenKey="search.wrapper.maxWidth" min={320} max={1600} step={4} unit="px" defaultValue={535} />
      </SubGroup>
      <SubGroup label="Vyhledávací pole">
        <ColorField  label="Barva textu" tokenKey="search.field.color" defaultValue="#111111" />
        <ColorField  label="Pozadí"      tokenKey="search.field.bg" />
        <BorderField colorKey="search.field.border.color" sizeKey="search.field.border.size" radiusKey="search.field.border.radius" />
      </SubGroup>
      <SubGroup label="Odesílací tlačítko">
        <ToggleField label="Skrýt štítek"  tokenKey="search.submit.hideLabel" />
        <ColorField  label="Barva textu"   tokenKey="search.submit.color" />
        <ColorField  label="Pozadí"        tokenKey="search.submit.bg" defaultValue="#111111" />
        <BorderField colorKey="search.submit.border.color" sizeKey="search.submit.border.size" radiusKey="search.submit.border.radius" />
      </SubGroup>
    </>
  );
}

export function VyhledavaniTlOtevreni() {
  const [bp, setBp] = useState<Bp>("desktop");
  return (
    <SubGroup label="Nastavení odkazu" right={<BreakpointTabs value={bp} onChange={setBp} hide={["tablet"]} />}>
      <SliderField label="Velikost textu" tokenKey={`search.trigger.size.${bp}`} min={10} max={32} defaultValue={16} />
      <ToggleField label="Skrýt štítek"   tokenKey="search.trigger.hideLabel" />
      <ColorField  label="Barva textu"    tokenKey="search.trigger.color" />
      <ColorField  label="Barva při najetí myší" tokenKey="search.trigger.hoverColor" />
    </SubGroup>
  );
}

/* ── Ostatní / Video ────────────────────────────────────────────────────── */

export function OstatniVideo() {
  return (
    <SubGroup label="Tlačítko přehrát">
      <ColorField  label="Barva textu" tokenKey="video.playBtn.color" />
      <ColorField  label="Pozadí"      tokenKey="video.playBtn.bg" defaultValue="rgba(0,0,0,0.6)" />
      <SliderField label="Velikost"    tokenKey="video.playBtn.size" min={24} max={120} defaultValue={50} />
    </SubGroup>
  );
}

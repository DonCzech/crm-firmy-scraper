"use client";

import type { ComponentType } from "react";
import * as P from "./panels";

export interface DesignLeaf {
  id: string;
  label: string;
  panel: ComponentType;
  /**
   * Token-key prefixes / exact keys this panel manages. Keys ending in "."
   * match every token starting with that prefix; bare keys are exact matches.
   * Used by the popup's Reset button to clear only the panel's own values
   * (reverting them to template defaults).
   */
  prefixes: string[];
}
export interface DesignNode {
  id: string;
  label: string;
  children?: DesignLeaf[];
  panel?: ComponentType;
  prefixes?: string[];
}
export interface DesignGroup {
  label: string;
  items: DesignNode[];
}

/**
 * The Design menu tree, mirroring the PDFs in
 * `prace/webero-studio/design/*`. Top-level groups (Obecné/Layout/Obsah/Ostatní)
 * become uppercase section labels. Branch nodes expand inline; leaf nodes
 * open the floating popup with the linked panel component.
 */
export const DESIGN_TREE: DesignGroup[] = [
  {
    label: "OBECNÉ",
    items: [
      { id: "vzhled.mood", label: "Vzhled šablony — mood presety", panel: P.MoodPresetyPanel, prefixes: ["colorPrimary", "colorSecondary", "colorAccent", "colorBackground", "colorSurface", "colorText", "colorTextMuted", "colorBorder"] },
      {
        id: "hlavicka", label: "Hlavička", children: [
          { id: "hlavicka.obecne",   label: "Obecné",                     panel: P.HlavickaObecne,             prefixes: ["header.", "mobileMenu."] },
          { id: "hlavicka.nav",      label: "Hlavní navigace",            panel: P.HlavickaHlavniNavigace,     prefixes: ["nav."] },
          { id: "hlavicka.nav2",     label: "Sekundární navigace",        panel: P.HlavickaSekundarniNavigace, prefixes: ["navSecondary."] },
          { id: "hlavicka.cta",      label: "Konverzní tlačítko",         panel: P.HlavickaKonverzniTlacitko,  prefixes: ["ctaButton."] },
          { id: "hlavicka.submenu",  label: "Submenu",                    panel: P.HlavickaSubmenu,            prefixes: ["submenu."] },
          { id: "hlavicka.logo",     label: "Logo",                       panel: P.HlavickaLogo,               prefixes: ["logo."] },
          { id: "hlavicka.menubtn",  label: "Tlačítko pro otevření menu", panel: P.HlavickaTlacitkoMenu,       prefixes: ["hamburger."] },
          { id: "hlavicka.lang",     label: "Jazykový přepínač",          panel: P.HlavickaJazyk,              prefixes: ["lang."] },
        ],
      },
      {
        id: "stranka", label: "Stránka", children: [
          { id: "stranka.obecne", label: "Obecné", panel: P.StrankaObecne, prefixes: ["colorBackground", "page."] },
          { id: "stranka.sekce",  label: "Sekce",  panel: P.StrankaSekce,  prefixes: ["section."] },
          { id: "stranka.bloky",  label: "Bloky",  panel: P.StrankaBloky,  prefixes: ["block."] },
        ],
      },
      {
        id: "typografie", label: "Typografie", children: [
          { id: "typografie.styly",   label: "Textové styly", panel: P.TypografieStyly, prefixes: [] },
          { id: "typografie.obecne",  label: "Obecné",   panel: P.TypografieObecne,  prefixes: ["fontBody", "typography.", "colorText", "bullet.", "link."] },
          { id: "typografie.nadpisy", label: "Nadpisy",  panel: P.TypografieNadpisy, prefixes: ["fontHeading", "heading."] },
          { id: "typografie.h1",      label: "Nadpis 1", panel: P.TypografieNadpis1, prefixes: ["h1."] },
          { id: "typografie.h2",      label: "Nadpis 2", panel: P.TypografieNadpis2, prefixes: ["h2."] },
          { id: "typografie.h3",      label: "Nadpis 3", panel: P.TypografieNadpis3, prefixes: ["h3."] },
          { id: "typografie.h4",      label: "Nadpis 4", panel: P.TypografieNadpis4, prefixes: ["h4."] },
        ],
      },
      { id: "paticka", label: "Patička", panel: P.Paticka, prefixes: ["footer."] },
    ],
  },
  {
    label: "LAYOUT",
    items: [
      {
        id: "layout.boxy", label: "Boxy", children: [
          { id: "layout.boxy.default",   label: "Výchozí styl",   panel: P.BoxyVychozi,    prefixes: ["card.default."]   },
          { id: "layout.boxy.primary",   label: "Primární styl",  panel: P.BoxyPrimarni,   prefixes: ["card.primary."]   },
          { id: "layout.boxy.secondary", label: "Sekundární styl",panel: P.BoxySekundarni, prefixes: ["card.secondary."] },
        ],
      },
      { id: "layout.layout", label: "Layout",          panel: P.LayoutLayout,         prefixes: ["layout."] },
      { id: "layout.slider", label: "Obsahový slider", panel: P.LayoutObsahovySlider, prefixes: ["slider."] },
      {
        id: "layout.harmonika", label: "Harmonika", children: [
          { id: "layout.harmonika.classic", label: "Klasický",      panel: P.HarmonikaKlasicky,    prefixes: ["accordion.classic."] },
          { id: "layout.harmonika.more",    label: "Zobrazit více", panel: P.HarmonikaZobrazitVic, prefixes: ["accordion.more."]    },
        ],
      },
      { id: "layout.zalozky", label: "Záložky", panel: P.LayoutZalozky, prefixes: ["tabs."] },
    ],
  },
  {
    label: "OBSAH",
    items: [
      {
        id: "obsah.tlacitka", label: "Tlačítka", children: [
          { id: "obsah.tlacitka.obecne",   label: "Obecné",        panel: P.TlacitkaObecne,   prefixes: ["btn.fontFamily", "btn.size.", "btn.uppercase", "btn.tracking", "btn.padding.", "btn.icon."] },
          { id: "obsah.tlacitka.default",  label: "Výchozí styl",  panel: P.TlacitkaVychozi,  prefixes: ["btn.default."] },
          { id: "obsah.tlacitka.primary",  label: "Primární styl", panel: P.TlacitkaPrimarni, prefixes: ["btn.primary."] },
          { id: "obsah.tlacitka.inverse",  label: "Inverzní styl", panel: P.TlacitkaInverzni, prefixes: ["btn.inverse."] },
        ],
      },
      {
        id: "obsah.obrazky", label: "Obrázky", children: [
          { id: "obsah.obrazky.obecne",   label: "Obecné",   panel: P.ObrazkyObecne,   prefixes: ["image."] },
          { id: "obsah.obrazky.plakat",   label: "Plakát",   panel: P.ObrazkyPlakat,   prefixes: ["poster."] },
          { id: "obsah.obrazky.karta",    label: "Karta",    panel: P.ObrazkyKarta,    prefixes: ["imgCard."] },
          { id: "obsah.obrazky.kolaz",    label: "Koláž",    panel: P.ObrazkyKolaz,    prefixes: ["collage."] },
          { id: "obsah.obrazky.prekryti", label: "Překrytí", panel: P.ObrazkyPrekryti, prefixes: ["overlay."] },
          { id: "obsah.obrazky.ikonky",   label: "Ikonky",   panel: P.ObrazkyIkonky,   prefixes: ["icon."] },
        ],
      },
      {
        id: "obsah.slider", label: "Slider", children: [
          { id: "obsah.slider.odrazky", label: "Navigační odrážky slideru", panel: P.SliderOdrazky, prefixes: ["dots."] },
          { id: "obsah.slider.sipky",   label: "Navigační šipky slideru",   panel: P.SliderSipky,   prefixes: ["arrows."] },
        ],
      },
      {
        id: "obsah.formulare", label: "Formuláře", children: [
          { id: "obsah.formulare.default", label: "Výchozí styly",    panel: P.FormulareVychozi,  prefixes: ["form.default."] },
          { id: "obsah.formulare.inverse", label: "Inverzní styly",   panel: P.FormulareInverzni, prefixes: ["form.inverse."] },
          { id: "obsah.formulare.filled",  label: "Styl s pozadím",   panel: P.FormulareSPozadim, prefixes: ["form.filled."] },
        ],
      },
      {
        id: "obsah.vypisy", label: "Výpisy", children: [
          { id: "obsah.vypisy.obecne", label: "Obecné",            panel: P.VypisyObecne,          prefixes: ["listing.title.", "listing.text.", "listing.border.", "listing.featured."] },
          { id: "obsah.vypisy.karta",  label: "Karta",             panel: P.VypisyKarta,           prefixes: ["listing.card."] },
          { id: "obsah.vypisy.bgImg",  label: "Obrázek na pozadí", panel: P.VypisyObrazekPozadi,   prefixes: ["listing.bgImage."] },
          { id: "obsah.vypisy.tabulka",label: "Tabulka",           panel: P.VypisyTabulka,         prefixes: ["table."] },
          { id: "obsah.vypisy.soc",    label: "Sociální sítě",     panel: P.VypisySocSite,         prefixes: ["listing.social."] },
          { id: "obsah.vypisy.meta",   label: "Meta",              panel: P.VypisyMeta,            prefixes: ["listing.meta."] },
        ],
      },
      { id: "obsah.citace",  label: "Citace",                 panel: P.ObsahCitace,  prefixes: ["quote."] },
      { id: "obsah.soc",     label: "Ikonky sociálních sítí", panel: P.ObsahSocSite, prefixes: ["social."] },
      { id: "obsah.delici",  label: "Dělící čára",            panel: P.ObsahDelici,  prefixes: ["divider."] },
    ],
  },
  {
    label: "OSTATNÍ",
    items: [
      {
        id: "ostatni.cookie", label: "Cookie lišta", children: [
          { id: "ostatni.cookie.obecne",     label: "Obecné",            panel: P.CookieObecne,       prefixes: ["cookie.type", "cookie.bg", "cookie.maxWidth", "cookie.margin", "cookie.radius", "cookie.shadow.", "cookie.title.", "cookie.text.", "cookie.color", "cookie.padding.", "cookie.dialog."] },
          { id: "ostatni.cookie.potvrdit",   label: "Tlačítko potvrdit",  panel: P.CookieTlPotvrdit,   prefixes: ["cookie.btnAccept."] },
          { id: "ostatni.cookie.odmitnout",  label: "Tlačítko odmítnout", panel: P.CookieTlOdmitnout,  prefixes: ["cookie.btnReject."] },
          { id: "ostatni.cookie.nastaveni",  label: "Tlačítko nastavení", panel: P.CookieTlNastaveni,  prefixes: ["cookie.btnSettings."] },
        ],
      },
      {
        id: "ostatni.search", label: "Vyhledávání", children: [
          { id: "ostatni.search.panel",    label: "Vyhledávací panel",            panel: P.VyhledavaciPanel,    prefixes: ["search.wrapper.", "search.field.", "search.submit."] },
          { id: "ostatni.search.trigger",  label: "Tlačítko pro otevření vyhledávání", panel: P.VyhledavaniTlOtevreni, prefixes: ["search.trigger."] },
        ],
      },
      { id: "ostatni.video", label: "Video", panel: P.OstatniVideo, prefixes: ["video."] },
    ],
  },
];

/** Find a leaf/node by id, walking the tree. */
export function findById(id: string): { label: string; panel?: ComponentType; prefixes?: string[] } | null {
  for (const g of DESIGN_TREE) {
    for (const node of g.items) {
      if (node.id === id) return { label: node.label, panel: node.panel, prefixes: node.prefixes };
      if (node.children) {
        const leaf = node.children.find(l => l.id === id);
        if (leaf) return { label: leaf.label, panel: leaf.panel, prefixes: leaf.prefixes };
      }
    }
  }
  return null;
}

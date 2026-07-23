"use client";

/**
 * Registr per-šablonových designů rezervačního widgetu.
 * Klíč = `variant` (slug šablony nastavený v template.json). Chybějící klíč →
 * `DEFAULT_DESIGN` (adaptivní, dědí motiv šablony).
 *
 * VÝKON: designy se načítají přes `next/dynamic`, takže se do stránky stáhne
 * POUZE ten jeden použitý — ne všech 34. Statické importy by do každého tenant
 * webu přibalily 34 komponent včetně jejich CSS řetězců (stovky kB navíc).
 * `ssr: true` zachovává serverový render → obsah je v HTML pro SEO a nevzniká
 * layout shift.
 */

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DesignProps } from "./common";

type D = ComponentType<DesignProps>;
const d = (loader: () => Promise<{ default: D }>) => dynamic(loader, { ssr: true }) as D;

export const DEFAULT_DESIGN: D = d(() =>
  import("./designs/DefaultDesign").then((m) => ({ default: m.DefaultDesign }))
);

/**
 * KONSOLIDACE (prototyp): 4 tvarové presety místo jednoho designu na šablonu.
 * Barvy/fonty se dědí z motivu šablony, preset řídí jen tvar a typografii.
 * Layout vychází z barber-01 „Luxe" (sticky sloupec + živý souhrn).
 */
export const DESIGN_REGISTRY: Record<string, D> = {
  sharp: d(() => import("./designs/AdaptiveDesign").then((m) => ({ default: m.SharpDesign }))),
  soft: d(() => import("./designs/AdaptiveDesign").then((m) => ({ default: m.SoftDesign }))),
  clinical: d(() => import("./designs/AdaptiveDesign").then((m) => ({ default: m.ClinicalDesign }))),
  editorial: d(() => import("./designs/AdaptiveDesign").then((m) => ({ default: m.EditorialDesign }))),

  "barber-01": d(() => import("./designs/BarberLuxe").then((m) => ({ default: m.BarberLuxe }))),
  "barber-02": d(() => import("./designs/BarberTicket").then((m) => ({ default: m.BarberTicket }))),
  "barber-03": d(() => import("./designs/BarberChrome").then((m) => ({ default: m.BarberChrome }))),
  "barber-04": d(() => import("./designs/BarberPoster").then((m) => ({ default: m.BarberPoster }))),
  "peak-cut": d(() => import("./designs/PeakCutStack").then((m) => ({ default: m.PeakCutStack }))),
  "hair-01": d(() => import("./designs/HairSalon").then((m) => ({ default: m.HairSalon }))),
  "hair-02": d(() => import("./designs/HairEditorial").then((m) => ({ default: m.HairEditorial }))),
  "hair-03": d(() => import("./designs/HairRail").then((m) => ({ default: m.HairRail }))),
  "hair-04": d(() => import("./designs/HairTimeline").then((m) => ({ default: m.HairTimeline }))),
  "beauty-01": d(() => import("./designs/BeautyGlow").then((m) => ({ default: m.BeautyGlow }))),
  "beauty-02": d(() => import("./designs/BeautySera").then((m) => ({ default: m.BeautySera }))),
  "nails-01": d(() => import("./designs/NailsSwatch").then((m) => ({ default: m.NailsSwatch }))),
  "nails-02": d(() => import("./designs/NailsBubble").then((m) => ({ default: m.NailsBubble }))),
  "nails-03": d(() => import("./designs/NailsStudio").then((m) => ({ default: m.NailsStudio }))),
  "tattoo-01": d(() => import("./designs/TattooFlash").then((m) => ({ default: m.TattooFlash }))),
  "tattoo-02": d(() => import("./designs/TattooStencil").then((m) => ({ default: m.TattooStencil }))),
  "tattoo-03": d(() => import("./designs/TattooGallery").then((m) => ({ default: m.TattooGallery }))),
  "fitness-01": d(() => import("./designs/FitnessArena").then((m) => ({ default: m.FitnessArena }))),
  "fitness-02": d(() => import("./designs/FitnessGrid").then((m) => ({ default: m.FitnessGrid }))),
  "fyzio-01": d(() => import("./designs/FyzioCare").then((m) => ({ default: m.FyzioCare }))),
  "fyzio-02": d(() => import("./designs/FyzioChart").then((m) => ({ default: m.FyzioChart }))),
  "harmonie-01": d(() => import("./designs/WellnessZen").then((m) => ({ default: m.WellnessZen }))),
  "massage-01": d(() => import("./designs/MassageRitual").then((m) => ({ default: m.MassageRitual }))),
  "tawan-01": d(() => import("./designs/TawanGold").then((m) => ({ default: m.TawanGold }))),
  "thaimasaze-02": d(() => import("./designs/ThaiLotus").then((m) => ({ default: m.ThaiLotus }))),
  "dental-01": d(() => import("./designs/DentalClean").then((m) => ({ default: m.DentalClean }))),
  "clinic-02": d(() => import("./designs/ClinicPortal").then((m) => ({ default: m.ClinicPortal }))),
  "clinic-03": d(() => import("./designs/ClinicChevron").then((m) => ({ default: m.ClinicChevron }))),
  "ortho-01": d(() => import("./designs/OrthoRuler").then((m) => ({ default: m.OrthoRuler }))),
  "ortho-02": d(() => import("./designs/OrthoDialog").then((m) => ({ default: m.OrthoDialog }))),
  "grooming-01": d(() => import("./designs/GroomingPaws").then((m) => ({ default: m.GroomingPaws }))),
  "vet-01": d(() => import("./designs/VetTopbar").then((m) => ({ default: m.VetTopbar }))),
  "autoservis-01": d(() => import("./designs/AutoProtocol").then((m) => ({ default: m.AutoProtocol }))),
  "autoservis-02": d(() => import("./designs/AutoBay").then((m) => ({ default: m.AutoBay }))),
  "autoservis-03": d(() => import("./designs/AutoStatus").then((m) => ({ default: m.AutoStatus }))),
};

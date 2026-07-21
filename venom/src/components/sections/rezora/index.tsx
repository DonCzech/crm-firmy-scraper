"use client";

/**
 * RezoraWidget dispatcher.
 *
 * Podle `content.mode` rozhodne mezi dvěma rodinami:
 *  • slotové režimy (`service`, `meeting`) → `useRezoraBooking` + per-šablonový
 *    design z registru (bespoke nebo adaptivní preset). Rezervují konkrétní termín.
 *  • poptávkové režimy (`inquiry`, `course`, `table`, `stay`) → `InquiryDesign`
 *    s adaptivním presetem. Posílají nezávaznou poptávku (bez kalendáře dostupnosti).
 *
 * Každá rodina je samostatná komponenta, aby se hooky volaly bezpodmínečně
 * (žádné podmíněné volání hooku v jednom těle).
 */

import { useRezoraBooking, INQUIRY_MODES, type WidgetMode } from "./core";
import type { DesignProps } from "./common";
import { DEFAULT_DESIGN, DESIGN_REGISTRY } from "./registry";
import { InquiryDesign } from "./designs/InquiryDesign";
import type { RezPreset } from "./designs/AdaptiveDesign";

interface Props {
  content: Record<string, unknown>;
  variant?: string;
  isAdmin?: boolean;
  sectionId: number;
  tenantSlug?: string;
}

const PRESETS: ReadonlySet<string> = new Set(["sharp", "soft", "clinical", "editorial"]);

export function RezoraWidget({ content, variant, isAdmin = false, sectionId }: Props) {
  const mode = (content.mode as WidgetMode) || "service";

  if (INQUIRY_MODES.has(mode)) {
    // Tvar poptávkového designu bere z `content.design`, fallbackem z varianty
    // (když je to jeden ze 4 presetů), jinak „soft".
    const preset: RezPreset =
      (PRESETS.has(String(content.design)) ? (content.design as RezPreset) : undefined) ??
      (variant && PRESETS.has(variant) ? (variant as RezPreset) : undefined) ??
      "soft";
    return (
      <InquiryDesign
        content={content}
        mode={mode}
        preset={preset}
        isAdmin={isAdmin}
        sectionId={sectionId}
      />
    );
  }

  return <SlotWidget content={content} variant={variant} isAdmin={isAdmin} sectionId={sectionId} />;
}

function SlotWidget({ content, variant, isAdmin, sectionId }: Omit<Props, "tenantSlug">) {
  const b = useRezoraBooking(content, isAdmin);
  const mode = (content.mode as WidgetMode) || "service";
  const Design: React.ComponentType<DesignProps> =
    (variant && DESIGN_REGISTRY[variant]) || DEFAULT_DESIGN;
  return <Design b={b} sectionId={sectionId} mode={mode} />;
}

"use client";

/**
 * RezoraWidget dispatcher — vybere per-šablonový design podle `variant`
 * (nastaveno v template.json jako slug šablony, např. "barber-01").
 * Booking logika je sdílená přes `useRezoraBooking`; každý design je pouze
 * prezentační vrstva → 33 unikátních vzhledů, jedna ověřená logika.
 */

import { useRezoraBooking } from "./core";
import type { DesignProps } from "./common";
import { DEFAULT_DESIGN, DESIGN_REGISTRY } from "./registry";

interface Props {
  content: Record<string, unknown>;
  variant?: string;
  isAdmin?: boolean;
  sectionId: number;
  tenantSlug?: string;
}

export function RezoraWidget({ content, variant, isAdmin = false, sectionId }: Props) {
  const b = useRezoraBooking(content, isAdmin);
  const Design: React.ComponentType<DesignProps> =
    (variant && DESIGN_REGISTRY[variant]) || DEFAULT_DESIGN;
  return <Design b={b} sectionId={sectionId} />;
}

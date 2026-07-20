/**
 * AI Designér — ceník.
 *
 * Ekonomický model: uživatel kupuje kredity (GoPay), každý AI požadavek stojí
 * FIXNÍ počet kreditů podle režimu. Marže je garantovaná tím, že každý režim
 * má tvrdý strop `maxTokens` (a ořezaný kontext) — nejhorší možná cena volání
 * Claude Opus 4.8 je tedy známá dopředu a vždy nižší než cena režimu.
 *
 * Přečerpání není možné: kredity se rezervují ATOMICKY před voláním AI
 * (UPDATE ... WHERE balance >= cena). Bez úspěšné rezervace se AI nevolá.
 */

export interface CreditPack {
  id: string;
  label: string;
  credits: number;
  priceCzk: number;
  /** cena v haléřích pro GoPay */
  amountCents: number;
  badge?: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "mini", label: "Mini", credits: 100, priceCzk: 99, amountCents: 9900 },
  { id: "standard", label: "Standard", credits: 500, priceCzk: 449, amountCents: 44900, badge: "Nejoblíbenější" },
  { id: "pro", label: "Pro", credits: 1200, priceCzk: 990, amountCents: 99000, badge: "Nejvýhodnější" },
];

export function getCreditPack(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}

export type AiDesignMode = "quick" | "standard" | "complex";

export interface ModePricing {
  id: AiDesignMode;
  label: string;
  credits: number;
  /** tvrdý strop výstupních tokenů — garantuje maximální cenu volání */
  maxTokens: number;
  /** maximální délka kontextu ve znacích (ořez před odesláním) */
  maxContextChars: number;
  effort: "medium" | "high";
  hint: string;
}

export const MODE_PRICING: Record<AiDesignMode, ModePricing> = {
  quick: {
    id: "quick",
    label: "Rychlá úprava",
    credits: 5,
    maxTokens: 4096,
    maxContextChars: 30_000,
    effort: "medium",
    hint: "Barvy, fonty, drobné úpravy vzhledu",
  },
  standard: {
    id: "standard",
    label: "Standardní",
    credits: 12,
    maxTokens: 8192,
    maxContextChars: 80_000,
    effort: "high",
    hint: "Restyle sekce, nové prvky, úpravy layoutu",
  },
  complex: {
    id: "complex",
    label: "Komplexní",
    credits: 30,
    maxTokens: 32768,
    maxContextChars: 160_000,
    effort: "high",
    hint: "Redesign více sekcí, výraznější proměna webu",
  },
};

/** Kredity zdarma pro každý nový tenant — ať si funkci vyzkouší. */
export const WELCOME_CREDITS = 20;

/**
 * Extra bonus pro tenanty založené přes AI Builder („Postavit cokoliv").
 * S WELCOME_CREDITS dohromady 60 kr. — první komplexní build (30 kr.)
 * projde zdarma a zbyde na několik iterací (standard 12 / quick 5).
 */
export const BUILDER_WELCOME_BONUS = 40;

export const AI_DESIGNER_MODEL = "claude-opus-4-8";

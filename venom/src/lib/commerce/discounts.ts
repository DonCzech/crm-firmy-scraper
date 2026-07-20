/**
 * Automatické košíkové slevy řízené aktivními moduly (addons.ts).
 * Čistá funkce — volá se z placeOrder i ze serverové pokladny pro zobrazení.
 */

export interface DiscountableItem {
  title: string;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number;
}

export interface DiscountLine {
  /** slug modulu, který slevu vygeneroval */
  source: string;
  label: string;
  amount_cents: number;
}

export interface CartDiscountResult {
  lines: DiscountLine[];
  total_cents: number;
  /** popis dárku (modul darky-k-objednavce), null když nárok nevznikl */
  gift: string | null;
}

/** Dárek k objednávce nad tuto částku (modul darky-k-objednavce) */
export const GIFT_THRESHOLD_CENTS = 200000;
export const GIFT_LABEL = "Dárek zdarma: prémiová dárková taška";

export function computeCartDiscounts(
  active: Set<string>,
  items: DiscountableItem[],
  subtotalCents: number
): CartDiscountResult {
  const lines: DiscountLine[] = [];

  if (active.has("mnozstevni-slevy")) {
    for (const it of items) {
      const pct = it.qty >= 5 ? 10 : it.qty >= 3 ? 5 : 0;
      if (pct > 0) {
        lines.push({
          source: "mnozstevni-slevy",
          label: `Množstevní sleva ${pct} % (${it.qty}× ${it.title})`,
          amount_cents: Math.round((it.line_total_cents * pct) / 100),
        });
      }
    }
  }

  if (active.has("slevy-xny")) {
    for (const it of items) {
      const freeUnits = Math.floor(it.qty / 3);
      if (freeUnits > 0) {
        lines.push({
          source: "slevy-xny",
          label: `Akce 3 za cenu 2 (${it.title}: ${freeUnits}× zdarma)`,
          amount_cents: freeUnits * it.unit_price_cents,
        });
      }
    }
  }

  if (active.has("objemove-slevy")) {
    const pct = subtotalCents >= 1000000 ? 5 : subtotalCents >= 500000 ? 3 : 0;
    if (pct > 0) {
      lines.push({
        source: "objemove-slevy",
        label: `Objemová sleva ${pct} % z celé objednávky`,
        amount_cents: Math.round((subtotalCents * pct) / 100),
      });
    }
  }

  let total = lines.reduce((s, l) => s + l.amount_cents, 0);
  // Sleva nikdy nesmí překročit hodnotu zboží
  if (total > subtotalCents) {
    const ratio = subtotalCents / total;
    for (const l of lines) l.amount_cents = Math.floor(l.amount_cents * ratio);
    total = lines.reduce((s, l) => s + l.amount_cents, 0);
  }

  const gift =
    active.has("darky-k-objednavce") && subtotalCents - total >= GIFT_THRESHOLD_CENTS
      ? GIFT_LABEL
      : null;

  return { lines, total_cents: total, gift };
}

import { query } from "@/lib/db";

/**
 * Modul „Cizí měny“ — reálné kurzy z denního kurzovního lístku ČNB.
 * Kurzy se cachují v paměti (6 h) a zapisují do commerce_fx_rates pro audit.
 * Konverze je zobrazovací — objednávky se účtují v měně obchodu (CZK).
 */

export const DISPLAY_CURRENCIES = ["CZK", "EUR", "USD", "PLN", "GBP"] as const;
export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];

export interface FxRate {
  currency: string;
  /** Kolik CZK stojí 1 jednotka měny (přepočteno z množství ČNB). */
  rate_czk: number;
  valid_date: string;
}

let cache: { rates: Map<string, FxRate>; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const CNB_URL =
  "https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt";

async function ensureFxTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_fx_rates (
      id SERIAL PRIMARY KEY,
      currency TEXT NOT NULL,
      rate_czk NUMERIC(12,6) NOT NULL,
      valid_date DATE NOT NULL,
      fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (currency, valid_date)
    );
  `);
}

/** Stáhne a naparsuje denní kurzovní lístek ČNB. Vrací mapu měna → kurz CZK. */
async function fetchCnbRates(): Promise<Map<string, FxRate>> {
  const res = await fetch(CNB_URL, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`ČNB kurzovní lístek: HTTP ${res.status}`);
  const text = await res.text();

  // Formát: "10.07.2026 #133\nzemě|měna|množství|kód|kurz\nAustrálie|dolar|1|AUD|14,538\n…"
  const lines = text.trim().split("\n");
  const dateMatch = lines[0]?.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  const validDate = dateMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : new Date().toISOString().slice(0, 10);

  const rates = new Map<string, FxRate>();
  rates.set("CZK", { currency: "CZK", rate_czk: 1, valid_date: validDate });

  for (const line of lines.slice(2)) {
    const parts = line.split("|");
    if (parts.length < 5) continue;
    const amount = parseInt(parts[2], 10);
    const code = parts[3].trim();
    const rate = parseFloat(parts[4].replace(",", "."));
    if (!amount || !code || !Number.isFinite(rate)) continue;
    rates.set(code, { currency: code, rate_czk: rate / amount, valid_date: validDate });
  }
  return rates;
}

/** Kurzy ČNB s paměťovou cache; při výpadku ČNB spadne na poslední uložené kurzy z DB. */
export async function getFxRates(): Promise<Map<string, FxRate>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.rates;

  await ensureFxTable();
  try {
    const rates = await fetchCnbRates();
    cache = { rates, fetchedAt: Date.now() };
    for (const r of rates.values()) {
      if (r.currency === "CZK") continue;
      await query(
        `INSERT INTO commerce_fx_rates (currency, rate_czk, valid_date)
         VALUES ($1, $2, $3) ON CONFLICT (currency, valid_date) DO UPDATE SET rate_czk = EXCLUDED.rate_czk, fetched_at = now()`,
        [r.currency, r.rate_czk, r.valid_date]
      );
    }
    return rates;
  } catch (e) {
    // Fallback: poslední známé kurzy z DB
    const rows = await query<{ currency: string; rate_czk: string; valid_date: string }>(
      `SELECT DISTINCT ON (currency) currency, rate_czk, valid_date
       FROM commerce_fx_rates ORDER BY currency, valid_date DESC`
    );
    const rates = new Map<string, FxRate>();
    rates.set("CZK", { currency: "CZK", rate_czk: 1, valid_date: new Date().toISOString().slice(0, 10) });
    for (const r of rows) rates.set(r.currency, { currency: r.currency, rate_czk: parseFloat(r.rate_czk), valid_date: r.valid_date });
    if (rates.size === 1) throw e;
    return rates;
  }
}

export interface DisplayFx {
  currency: DisplayCurrency;
  /** CZK za 1 jednotku zobrazované měny (1 pro CZK). */
  rate_czk: number;
}

/** Zvalidovaná zobrazovací měna z cookie hodnoty. */
export function parseDisplayCurrency(value: string | undefined | null): DisplayCurrency {
  return DISPLAY_CURRENCIES.includes((value ?? "") as DisplayCurrency) ? (value as DisplayCurrency) : "CZK";
}

/** Připraví zobrazovací FX (kurz) pro zvolenou měnu; CZK = identita bez fetchů. */
export async function getDisplayFx(currency: DisplayCurrency): Promise<DisplayFx> {
  if (currency === "CZK") return { currency: "CZK", rate_czk: 1 };
  const rates = await getFxRates();
  const r = rates.get(currency);
  if (!r) return { currency: "CZK", rate_czk: 1 };
  return { currency, rate_czk: r.rate_czk };
}

/** Převede CZK centy na centy zobrazované měny. */
export function convertCents(czkCents: number, fx: DisplayFx): number {
  if (fx.currency === "CZK" || fx.rate_czk === 1) return czkCents;
  return Math.round(czkCents / fx.rate_czk);
}

export const FX_COOKIE_PREFIX = "webero_currency_";

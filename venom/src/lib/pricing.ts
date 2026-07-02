/** Webero subscription pricing. Single monthly plan, 499 CZK. */
export const PLAN_AMOUNT_CENTS = 49900; // 499 CZK in haléře
export const PLAN_CURRENCY = "CZK";
export const PLAN_CURRENCY_CODE = 203;
export const PLAN_LABEL = "Webero Basic";
export const PLAN_DESCRIPTION = "Webero - předplatné 499 Kč/měsíc";

export function recurrenceDateTo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 5);
  return d.toISOString().slice(0, 10);
}

export function makeOrderId(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `WBO${Date.now().toString(36).toUpperCase()}${rand}`;
}

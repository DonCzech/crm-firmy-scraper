import QRCode from "qrcode";

/**
 * Webero Commerce — QR Platba (SPD, Short Payment Descriptor).
 * Český standard pro platební QR kódy — banka po naskenování předvyplní příkaz.
 */

/** Převod českého čísla účtu ("19-123456789/0100" i "123456789/0100") na IBAN. */
export function czAccountToIban(account: string): string | null {
  const m = account.replace(/\s+/g, "").match(/^(?:(\d{1,6})-)?(\d{2,10})\/(\d{4})$/);
  if (!m) return null;
  const [, prefix = "", number, bank] = m;
  const bban = bank + prefix.padStart(6, "0") + number.padStart(10, "0");
  // Kontrolní číslice: mod 97-10 nad "BBAN + CZ00" (C=12, Z=35)
  const numeric = `${bban}123500`;
  let rem = 0;
  for (const ch of numeric) rem = (rem * 10 + Number(ch)) % 97;
  const check = String(98 - rem).padStart(2, "0");
  return `CZ${check}${bban}`;
}

/** Bez diakritiky — SPD MSG pole je bezpečnější v ASCII. */
function ascii(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\x20-\x7E]/g, "");
}

export interface SpdInput {
  account: string;          // české číslo účtu s kódem banky
  amountCents: number;
  currency?: string;
  vs?: string;
  message?: string;
}

/** Sestaví SPD řetězec, nebo null pokud účet nejde převést na IBAN. */
export function buildSpdString(input: SpdInput): string | null {
  const iban = czAccountToIban(input.account);
  if (!iban) return null;
  const parts = [
    "SPD*1.0",
    `ACC:${iban}`,
    `AM:${(input.amountCents / 100).toFixed(2)}`,
    `CC:${input.currency ?? "CZK"}`,
  ];
  if (input.vs) parts.push(`X-VS:${input.vs.replace(/\D/g, "").slice(0, 10)}`);
  if (input.message) parts.push(`MSG:${ascii(input.message).slice(0, 60)}`);
  return parts.join("*");
}

/** PNG data-URL pro <img> (potvrzení objednávky). */
export async function qrPaymentDataUrl(input: SpdInput): Promise<string | null> {
  const spd = buildSpdString(input);
  if (!spd) return null;
  return QRCode.toDataURL(spd, { errorCorrectionLevel: "M", margin: 1, width: 220 });
}

/** QR platba pro fakturu/zálohovku — null pro dodací list/dobropis nebo bez účtu. */
export async function invoiceQrSvg(inv: {
  invoice_type: string;
  supplier_bank_account: string | null;
  total_cents: number;
  currency: string;
  variable_symbol: string | null;
  invoice_number: string;
}): Promise<string | null> {
  if (!["invoice", "proforma"].includes(inv.invoice_type) || !inv.supplier_bank_account) return null;
  return qrPaymentSvg({
    account: inv.supplier_bank_account,
    amountCents: inv.total_cents,
    currency: inv.currency,
    vs: inv.variable_symbol ?? undefined,
    message: `Faktura ${inv.invoice_number}`,
  });
}

/** Inline SVG (faktura HTML/PDF — ostré v tisku). */
export async function qrPaymentSvg(input: SpdInput): Promise<string | null> {
  const spd = buildSpdString(input);
  if (!spd) return null;
  return QRCode.toString(spd, { type: "svg", errorCorrectionLevel: "M", margin: 0 });
}

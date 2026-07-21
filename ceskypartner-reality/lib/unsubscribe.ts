import { createHmac } from "crypto";
import { SITE_URL } from "./seo";

// Tokenizované odhlašovací odkazy do e-mailů (GDPR) — HMAC podpis,
// takže odkaz nejde uhodnout ani zfalšovat pro cizí záznam.

export type UnsubscribeType = "pes" | "newsletter";

function secret(): string {
  return process.env.NEXTAUTH_SECRET || "dev-secret";
}

export function unsubscribeToken(type: UnsubscribeType, id: string): string {
  return createHmac("sha256", secret()).update(`${type}:${id}`).digest("hex").slice(0, 32);
}

export function verifyUnsubscribeToken(type: UnsubscribeType, id: string, token: string): boolean {
  return Boolean(token) && unsubscribeToken(type, id) === token;
}

export function unsubscribeUrl(type: UnsubscribeType, id: string): string {
  return `${SITE_URL}/odhlasit?typ=${type}&id=${encodeURIComponent(id)}&t=${unsubscribeToken(type, id)}`;
}

/** Patička e-mailu s odhlašovacím odkazem */
export function unsubscribeFooterHtml(type: UnsubscribeType, id: string): string {
  const label = type === "pes" ? "Zrušit hlídacího psa" : "Odhlásit se z odběru";
  return `<p style="font-size:11px;color:#9b968d;margin-top:20px;">Nechcete už tyto e-maily dostávat? <a href="${unsubscribeUrl(type, id)}" style="color:#8A6D43;">${label}</a>.</p>`;
}

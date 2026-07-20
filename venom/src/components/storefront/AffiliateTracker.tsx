"use client";

import { useEffect } from "react";

/**
 * Modul „Provizní systém" — když návštěvník přijde s ?aff=KOD,
 * uloží se ref. kód do cookie (30 dní). Konverze se zapíše při objednávce.
 */
export function AffiliateTracker({ tenantSlug }: { tenantSlug: string }) {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("aff");
    if (!code || !/^[A-Za-z0-9_-]{2,24}$/.test(code)) return;
    const maxAge = 30 * 24 * 60 * 60;
    document.cookie = `webero_aff_${tenantSlug}=${encodeURIComponent(code.toUpperCase())}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }, [tenantSlug]);
  return null;
}

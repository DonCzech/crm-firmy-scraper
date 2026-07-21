import type { NextRequest } from "next/server";

// Ochrana veřejných formulářů: honeypot + rate limit na IP.
// In-memory — na jedné instanci stačí; při škálování nahradit Redisem.

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minut
const MAX_HITS = 8; // max požadavků z jedné IP za okno

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Vrátí chybovou hlášku, pokud požadavek vypadá jako spam; jinak null.
 * `body.website` je honeypot — skryté pole, které lidé nevyplní.
 */
export function checkSpam(req: NextRequest, body: Record<string, unknown>): string | null {
  // Honeypot — boti vyplňují všechna pole
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return "Neplatný požadavek.";
  }

  const ip = clientIp(req);
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    return "Příliš mnoho požadavků. Zkuste to prosím později.";
  }
  recent.push(now);
  hits.set(ip, recent);

  // Úklid staré paměti, ať mapa neroste donekonečna
  if (hits.size > 5000) {
    hits.forEach((times, key) => {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    });
  }
  return null;
}

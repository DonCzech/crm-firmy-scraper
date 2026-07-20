import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function requestIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

export function checkRateLimit(
  request: NextRequest,
  scope: string,
  limit: number,
  windowMs: number,
  discriminator = "",
): { ok: true } | { ok: false; response: Response } {
  const now = Date.now();
  const key = `${scope}:${requestIp(request)}:${discriminator.toLowerCase()}`;
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    opportunisticPrune(now);
    return { ok: true };
  }
  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return {
      ok: false,
      response: Response.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      ),
    };
  }
  current.count += 1;
  return { ok: true };
}

function opportunisticPrune(now: number): void {
  if (buckets.size < 10_000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

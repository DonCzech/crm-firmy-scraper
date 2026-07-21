import { createHash, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export function requestIp(req: NextRequest) {
  return (
    req.headers.get("x-vercel-forwarded-for") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function secureEqual(left: string, right: string) {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

export function hasValidCronSecret(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 24) return false;
  const auth = req.headers.get("authorization") ?? "";
  return secureEqual(auth, `Bearer ${secret}`);
}

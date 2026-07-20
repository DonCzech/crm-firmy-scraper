import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken, type AdminPayload } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/demo-auth";

export async function getPlatformAdmin(): Promise<AdminPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

export function getPlatformAdminFromRequest(request: NextRequest): AdminPayload | null {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

export function requirePlatformAdmin(
  request: NextRequest,
  options: { mutation?: boolean } = {},
): { ok: true; admin: AdminPayload } | { ok: false; response: Response } {
  const admin = getPlatformAdminFromRequest(request);
  if (!admin) {
    return { ok: false, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (options.mutation && !assertSameOrigin(request)) {
    return { ok: false, response: Response.json({ error: "Invalid request origin" }, { status: 403 }) };
  }
  return { ok: true, admin };
}

export function requireInternalToken(request: NextRequest): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  const supplied = request.headers.get("x-internal-token");
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

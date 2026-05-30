import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { getTenantBySlug, type Tenant } from "@/lib/db";

export interface TenantAuthResult {
  ok: boolean;
  tenant?: Tenant;
}

function safeTokenEqual(a: string | undefined, b: string | null): boolean {
  if (!a || !b) return false;
  try {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export async function requireTenantAdmin(tenantSlug: string): Promise<TenantAuthResult> {
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { ok: false };
  if (!tenant.access_token) return { ok: false, tenant };

  const cookieStore = await cookies();
  const token = cookieStore.get(`venom_access_${tenantSlug}`)?.value;
  return { ok: safeTokenEqual(token, tenant.access_token), tenant };
}

export function assertSameOrigin(request: NextRequest): boolean {
  const expectedOrigins = new Set([request.nextUrl.origin]);
  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  if (host) {
    expectedOrigins.add(`${protocol}://${host}`);

    const devLocalhost = host.replace(/^127\.0\.0\.1(?=:|$)/, "localhost");
    const devLoopback = host.replace(/^localhost(?=:|$)/, "127.0.0.1");
    if (process.env.NODE_ENV !== "production") {
      expectedOrigins.add(`${protocol}://${devLocalhost}`);
      expectedOrigins.add(`${protocol}://${devLoopback}`);
    }
  }

  const origin = request.headers.get("origin");
  if (origin) return expectedOrigins.has(origin);

  const referer = request.headers.get("referer");
  if (!referer) return true;

  try {
    return expectedOrigins.has(new URL(referer).origin);
  } catch {
    return false;
  }
}

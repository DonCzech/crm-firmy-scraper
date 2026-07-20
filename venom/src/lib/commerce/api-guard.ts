import type { NextRequest } from "next/server";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import type { Tenant } from "@/lib/db";
import { getShopByTenantId } from "./shop";
import type { Shop } from "./types";

export interface CommerceGuardOk {
  ok: true;
  tenant: Tenant;
  shop: Shop;
}

export interface CommerceGuardFail {
  ok: false;
  response: Response;
}

/**
 * Shared guard for all /api/demo/[tenantSlug]/commerce/* routes:
 * same-origin check → tenant admin cookie auth → shop existence.
 * A tenant without a shop row gets 404 (commerce not activated).
 */
export async function requireCommerceAdmin(
  req: NextRequest,
  tenantSlug: string
): Promise<CommerceGuardOk | CommerceGuardFail> {
  if (!assertSameOrigin(req)) {
    return { ok: false, response: Response.json({ error: "Invalid origin" }, { status: 403 }) };
  }
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) {
    return { ok: false, response: Response.json({ error: "Tenant not found" }, { status: 404 }) };
  }
  if (!ok) {
    return { ok: false, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) {
    return {
      ok: false,
      response: Response.json({ error: "Tento web nemá aktivovaný e-shop" }, { status: 404 }),
    };
  }
  return { ok: true, tenant, shop };
}

export function jsonError(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export async function parseJsonBody(req: NextRequest): Promise<unknown | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

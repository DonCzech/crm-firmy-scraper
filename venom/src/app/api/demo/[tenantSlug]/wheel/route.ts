import { NextRequest } from "next/server";
import { getTenantBySlug, saveWheelLead, getWheelLeads } from "@/lib/db";
import { requireTenantAdmin } from "@/lib/demo-auth";

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

// ── Public: capture a wheel-of-fortune lead ──────────────────────────────────
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, segmentLabel, coupon, isWin } = (body ?? {}) as Record<string, unknown>;
  if (!email || !segmentLabel) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") {
    return Response.json({ error: "Tenant nenalezen." }, { status: 404 });
  }

  try {
    await saveWheelLead(
      tenant.id,
      String(email).toLowerCase().trim(),
      String(segmentLabel),
      String(coupon || ""),
      Boolean(isWin)
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[wheel] POST error", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// ── Admin: list leads (LiveEditor wheel tab) ─────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const auth = await requireTenantAdmin(tenantSlug);
  if (!auth.ok || !auth.tenant) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leads = await getWheelLeads(auth.tenant.id);
    return Response.json({ leads });
  } catch (err) {
    console.error("[wheel] GET error", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

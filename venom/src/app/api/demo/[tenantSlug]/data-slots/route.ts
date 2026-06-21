import { NextRequest } from "next/server";
import { z } from "zod";
import { auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import {
  getAllSlots,
  upsertSlotsBatch,
  deleteSlot,
  isValidSlotKey,
  SLOT_REGISTRY,
} from "@/lib/data-slots";

/**
 * F1 — Per-tenant data slots (brand, contact, hours, social, company, seo).
 *
 * GET    list all slots + registry of available keys
 * PUT    upsert one or more slot values (batch transaction)
 * DELETE one slot (?key=...)
 */
interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

const PutBodySchema = z.object({
  slots: z
    .array(z.object({ key: z.string(), value: z.unknown() }))
    .min(1)
    .max(50),
});

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const slots = await getAllSlots(tenant.id);
  return Response.json({ slots, registry: SLOT_REGISTRY });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PutBodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  for (const e of parsed.data.slots) {
    if (!isValidSlotKey(e.key)) {
      return Response.json({ error: `Unknown slot key: ${e.key}` }, { status: 400 });
    }
  }

  const slots = parsed.data.slots.map((s) => ({ key: s.key, value: s.value }));
  await upsertSlotsBatch(tenant.id, slots);
  await auditLog("data_slots_updated", {
    tenantId: tenant.id,
    targetType: "tenant",
    targetId: String(tenant.id),
    extra: { keys: parsed.data.slots.map((s) => s.key) },
  });

  return Response.json({ ok: true, updated: parsed.data.slots.length });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const key = new URL(req.url).searchParams.get("key");
  if (!key) return Response.json({ error: "Missing ?key" }, { status: 400 });
  if (!isValidSlotKey(key)) return Response.json({ error: `Unknown slot key: ${key}` }, { status: 400 });

  await deleteSlot(tenant.id, key);
  await auditLog("data_slot_deleted", {
    tenantId: tenant.id,
    targetType: "tenant",
    targetId: String(tenant.id),
    extra: { key },
  });
  return Response.json({ ok: true });
}

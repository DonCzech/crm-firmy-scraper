import { NextRequest } from "next/server";
import { z } from "zod";
import { query, queryOne, auditLog, type Section } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { computeOverridesForSubmit } from "@/lib/section-resolver";
import { revalidatePath } from "next/cache";
import { sanitizeRichContent } from "@/lib/sanitize-content";

const BodySchema = z.object({
  settings: z.record(z.unknown()).optional(),
  is_visible: z.boolean().optional(),
  // section_variant: used by the "Změnit rozložení" action — swaps the visual
  // variant of an existing section without recreating it (preserves id,
  // content_overrides, layout settings). We deliberately don't expose
  // section_type swaps from this endpoint; mixing variant pools across types
  // produces nonsense.
  section_variant: z.string().min(1).max(80).optional(),
}).refine(
  (v) => v.settings !== undefined || v.is_visible !== undefined || v.section_variant !== undefined,
  { message: "Nothing to update — provide settings, is_visible or section_variant" }
);

interface RouteParams {
  params: Promise<{ tenantSlug: string; sectionId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug, sectionId } = await params;
  const sid = parseInt(sectionId, 10);
  if (isNaN(sid)) return Response.json({ error: "Invalid section ID" }, { status: 400 });

  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  // Security: section must belong to this tenant — filter by tenant_id in WHERE
  // Also fetch content_source + structural metadata for v2 sparse-override routing.
  const sectionRow = await queryOne<Section & { content_source: string | null; content_overrides: Record<string, unknown>; updated_at: string }>(
    "SELECT * FROM sections WHERE id = $1 AND tenant_id = $2",
    [sid, tenant.id]
  );
  if (!sectionRow) return Response.json({ error: "Section not found" }, { status: 404 });

  // Optimistic concurrency (LIVE_EDITOR_STANDARD): klient posílá If-Match = updated_at
  // epoch ms z posledního čtení/zápisu. Nesouhlas ⇒ 412 a klient nabídne reload/přepsat.
  const ifMatch = req.headers.get("if-match");
  if (ifMatch) {
    const currentRev = String(new Date(sectionRow.updated_at).getTime());
    if (ifMatch !== currentRev) {
      return Response.json(
        { error: "Sekce byla mezitím změněna jinde.", conflict: true, revision: currentRev },
        { status: 412 }
      );
    }
  }

  const updates: string[] = ["updated_at = now()"];
  const values: unknown[] = [];

  if (parsed.data.settings !== undefined) {
    const safeSettings = sanitizeRichContent(parsed.data.settings);
    // F1: For v2 sections, the studio submits fully-merged content. We compute the
    // sparse diff vs (template_default + slots) and store ONLY the diff in
    // content_overrides. settings.content stays empty so template propagation works.
    if (sectionRow.content_source === "v2") {
      const incoming = (safeSettings as { content?: Record<string, unknown> }).content ?? {};
      const overrides = await computeOverridesForSubmit(
        { ...sectionRow, content_source: (sectionRow.content_source ?? "legacy") as "v2" | "legacy" },
        tenant,
        incoming
      );
      // Preserve non-content settings keys (e.g. anchorId, designTokens) but strip content
      const settingsWithoutContent = { ...(safeSettings as Record<string, unknown>) };
      delete settingsWithoutContent.content;
      updates.push(`settings = $${values.length + 1}`);
      values.push(JSON.stringify(settingsWithoutContent));
      updates.push(`content_overrides = $${values.length + 1}::jsonb`);
      values.push(JSON.stringify(overrides));
    } else {
      updates.push(`settings = $${values.length + 1}`);
      values.push(JSON.stringify(safeSettings));
    }
  }
  if (parsed.data.is_visible !== undefined) {
    updates.push(`is_visible = $${values.length + 1}`);
    values.push(parsed.data.is_visible);
  }
  if (parsed.data.section_variant !== undefined) {
    updates.push(`section_variant = $${values.length + 1}`);
    values.push(parsed.data.section_variant);
  }

  values.push(sid, tenant.id); // WHERE id = $N AND tenant_id = $N+1
  const updatedRows = await query<{ updated_at: string }>(
    `UPDATE sections SET ${updates.join(", ")} WHERE id = $${values.length - 1} AND tenant_id = $${values.length} RETURNING updated_at`,
    values
  );

  await auditLog("section_updated", { tenantId: tenant.id, targetType: "section", targetId: String(sid) });
  revalidatePath(`/demo/${tenantSlug}`);
  revalidatePath(`/demo/${tenantSlug}`, "layout");
  const newRev = updatedRows[0] ? String(new Date(updatedRows[0].updated_at).getTime()) : null;
  return Response.json({ ok: true, revision: newRev });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug, sectionId } = await params;
  const sid = parseInt(sectionId, 10);
  if (isNaN(sid)) return Response.json({ error: "Invalid section ID" }, { status: 400 });

  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Security: filter by tenant_id to prevent cross-tenant deletes.
  const res = await query<{ id: number }>(
    "DELETE FROM sections WHERE id = $1 AND tenant_id = $2 RETURNING id",
    [sid, tenant.id]
  );
  if (!res.length) return Response.json({ error: "Section not found" }, { status: 404 });

  await auditLog("section_deleted", { tenantId: tenant.id, targetType: "section", targetId: String(sid) });
  revalidatePath(`/demo/${tenantSlug}`);
  return Response.json({ ok: true });
}

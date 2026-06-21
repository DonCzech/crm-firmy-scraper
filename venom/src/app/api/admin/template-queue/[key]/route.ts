import { NextRequest } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { query, queryOne, auditLog } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface RouteParams { params: Promise<{ key: string }> }

async function requireAdmin() {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return { ok: false, email: undefined as string | undefined };
  const payload = verifyToken(token) as { email?: string } | null;
  if (!payload) return { ok: false, email: undefined as string | undefined };
  return { ok: true, email: payload.email };
}

const PatchBodySchema = z.object({
  review_status: z.enum(["pending", "reviewed", "approved", "blocked"]).optional(),
  review_notes: z.string().max(4000).nullable().optional(),
  assigned_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  review_checklist: z.record(z.unknown()).optional(),
});

/**
 * PATCH /api/admin/template-queue/:key
 *
 * Updates review state. Setting status='approved' also revalidates the public
 * catalog routes (/sablony + /) so the new card appears immediately.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { ok, email } = await requireAdmin();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;
  const body = await req.json().catch(() => null);
  const parsed = PatchBodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const tplRow = await queryOne<{ id: number; review_status: string }>(
    "SELECT id, review_status FROM templates WHERE key = $1",
    [key]
  );
  if (!tplRow) return Response.json({ error: "Template not found" }, { status: 404 });

  const updates: string[] = ["updated_at = now()"];
  const values: unknown[] = [];

  for (const [k, v] of Object.entries(parsed.data)) {
    if (v === undefined) continue;
    if (k === "review_checklist") {
      values.push(JSON.stringify(v));
      updates.push(`review_checklist = $${values.length}::jsonb`);
    } else {
      values.push(v);
      updates.push(`${k} = $${values.length}`);
    }
  }

  // Auto-stamp reviewed_at + reviewer when status flips
  if (parsed.data.review_status && parsed.data.review_status !== tplRow.review_status) {
    values.push(email ?? null);
    updates.push(`reviewer_email = $${values.length}`);
    updates.push(`reviewed_at = now()`);
  }

  values.push(tplRow.id);
  await query(
    `UPDATE templates SET ${updates.join(", ")} WHERE id = $${values.length}`,
    values
  );

  await auditLog("template_queue_updated", {
    actorEmail: email,
    targetType: "template",
    targetId: key,
    extra: parsed.data as Record<string, unknown>,
  });

  // Approved → publish to homepage + /sablony catalog
  if (parsed.data.review_status === "approved") {
    revalidatePath("/");
    revalidatePath("/sablony");
  }

  return Response.json({ ok: true });
}

/**
 * POST /api/admin/template-queue/:key/publish
 *
 * Convenience endpoint: marks approved + revalidates catalog routes. Used by
 * the "Publikovat na homepage" button in admin queue UI.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { ok, email } = await requireAdmin();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { key } = await params;

  const tplRow = await queryOne<{ id: number }>(
    "SELECT id FROM templates WHERE key = $1",
    [key]
  );
  if (!tplRow) return Response.json({ error: "Template not found" }, { status: 404 });

  await query(
    `UPDATE templates
        SET review_status = 'approved',
            reviewer_email = $1,
            reviewed_at = now(),
            updated_at = now()
      WHERE id = $2`,
    [email ?? null, tplRow.id]
  );

  await auditLog("template_published_to_catalog", {
    actorEmail: email,
    targetType: "template",
    targetId: key,
  });

  revalidatePath("/");
  revalidatePath("/sablony");

  return Response.json({ ok: true, key, status: "approved" });
}

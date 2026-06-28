import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { existsSync } from "fs";
import path from "path";
import { query, auditLog } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { captureTemplateScreenshot } from "../[key]/route";

async function requireAdmin() {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return { ok: false, email: undefined as string | undefined };
  const payload = verifyToken(token) as { email?: string } | null;
  if (!payload) return { ok: false, email: undefined as string | undefined };
  return { ok: true, email: payload.email };
}

/**
 * POST /api/admin/template-queue/backfill-screenshots
 *
 * Body: { mode?: "missing" | "all", limit?: number }
 *  - mode=missing (default): only re-shoot templates without preview.png
 *  - mode=all: re-shoot every approved template
 *
 * Serial execution — one browser at a time to avoid resource exhaustion.
 */
export async function POST(req: NextRequest) {
  const { ok, email } = await requireAdmin();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { mode?: string; limit?: number };
  const mode = body.mode === "all" ? "all" : "missing";
  const limit = Math.max(1, Math.min(body.limit ?? 200, 200));

  const rows = await query<{ id: number; key: string; slug: string | null }>(
    `SELECT t.id, t.key,
            (SELECT tn.slug FROM tenants tn
               JOIN sections s ON s.tenant_id = tn.id AND s.content_source = 'v2'
              WHERE tn.template_id = t.id ORDER BY tn.id LIMIT 1) AS slug
       FROM templates t
      WHERE t.review_status = 'approved' AND t.status = 'active'
      ORDER BY t.reviewed_at DESC NULLS LAST`
  );

  const targets = rows
    .filter((r) => r.slug)
    .filter((r) => {
      if (mode === "all") return true;
      const preview = path.join(process.cwd(), "public", "templates", r.key, "preview.png");
      return !existsSync(preview);
    })
    .slice(0, limit);

  const results: Array<{ key: string; preview: boolean; errors: string[] }> = [];
  for (const r of targets) {
    if (!r.slug) continue;
    const res = await captureTemplateScreenshot(r.key, r.slug);
    results.push({ key: r.key, preview: res.preview, errors: res.errors });
    revalidatePath(`/ukazka-sablon/${r.key}`);
  }

  revalidatePath("/");
  revalidatePath("/sablony");
  revalidatePath("/ukazka-sablon");

  await auditLog("template_screenshots_backfilled", {
    actorEmail: email,
    targetType: "template",
    extra: { mode, count: results.length, success: results.filter((r) => r.preview).length },
  });

  return Response.json({
    ok: true,
    mode,
    processed: results.length,
    success: results.filter((r) => r.preview).length,
    failed: results.filter((r) => !r.preview).map((r) => ({ key: r.key, errors: r.errors })),
    results,
  });
}

/**
 * GET — list approved templates and whether they have preview.png.
 * Used by admin UI to show backfill progress before/after.
 */
export async function GET() {
  const { ok } = await requireAdmin();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query<{ key: string }>(
    `SELECT key FROM templates
      WHERE review_status = 'approved' AND status = 'active'
      ORDER BY key`
  );

  const status = rows.map((r) => ({
    key: r.key,
    hasPreview: existsSync(path.join(process.cwd(), "public", "templates", r.key, "preview.png")),
  }));

  return Response.json({
    total: status.length,
    withPreview: status.filter((s) => s.hasPreview).length,
    missing: status.filter((s) => !s.hasPreview).map((s) => s.key),
  });
}

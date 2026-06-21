import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { query, queryOne, withTransaction, auditLog } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";
import { invalidateTemplateCache } from "@/lib/section-resolver";
import { loadTemplate } from "@/lib/templates/loader";

/**
 * F1 — Publish new template version from disk (src/templates/<key>/).
 *
 * Flow:
 *   1. Load template from disk via loadTemplate(key)
 *   2. Compute checksum of {default_sections, design_tokens, demo_content}
 *   3. If checksum unchanged → no-op (idempotent)
 *   4. Insert template_versions row with new version
 *   5. Bump templates.current_version → ALL v2 tenants on this template see update on next render
 *   6. Invalidate in-process template cache (other server instances get fresh from DB on TTL expiry)
 *
 * Admin auth required.
 */
interface RouteParams {
  params: Promise<{ key: string }>;
}

const BodySchema = z.object({
  newVersion: z.string().regex(/^\d+\.\d+\.\d+$/, "Use semver X.Y.Z"),
  changelog: z.string().max(1000).optional(),
});

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

async function requireAdmin(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return Boolean(verifyToken(token));
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  // 1. Load template from disk
  let tpl;
  try {
    tpl = await loadTemplate(key);
  } catch (err) {
    return Response.json({ error: `Template ${key} not found on disk: ${String(err)}` }, { status: 404 });
  }

  const checksum = sha256(JSON.stringify({
    sections: tpl.defaultSections,
    tokens: tpl.designTokens,
    demo: tpl.demoContent,
  }));

  // 2. Look up template_id (must exist — seedTemplates() runs at boot)
  const tplRow = await queryOne<{ id: number; current_version: string }>(
    "SELECT id, current_version FROM templates WHERE key = $1",
    [key]
  );
  if (!tplRow) {
    return Response.json({ error: `Template ${key} not seeded in DB — restart server first` }, { status: 404 });
  }

  // 3. Skip if same checksum as currently published version
  const existing = await queryOne<{ checksum: string | null }>(
    "SELECT checksum FROM template_versions WHERE template_id = $1 AND version = $2",
    [tplRow.id, tplRow.current_version]
  );
  if (existing?.checksum === checksum) {
    return Response.json({
      ok: true,
      noop: true,
      reason: "checksum unchanged",
      currentVersion: tplRow.current_version,
    });
  }

  // 4 + 5. Insert new version row, bump current_version
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO template_versions (template_id, version, default_sections, default_design_tokens, default_demo_content, checksum, migration_notes, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (template_id, version) DO UPDATE SET
         default_sections = EXCLUDED.default_sections,
         default_design_tokens = EXCLUDED.default_design_tokens,
         default_demo_content = EXCLUDED.default_demo_content,
         checksum = EXCLUDED.checksum,
         migration_notes = EXCLUDED.migration_notes,
         published_at = EXCLUDED.published_at`,
      [
        tplRow.id,
        parsed.data.newVersion,
        JSON.stringify(tpl.defaultSections),
        JSON.stringify(tpl.designTokens),
        JSON.stringify(tpl.demoContent),
        checksum,
        parsed.data.changelog ?? null,
      ]
    );

    await client.query(
      "UPDATE templates SET current_version = $1, updated_at = now() WHERE id = $2",
      [parsed.data.newVersion, tplRow.id]
    );

    // Bump all v2 tenants on this template to the new version
    await client.query(
      "UPDATE tenants SET template_version = $1, updated_at = now() WHERE template_id = $2",
      [parsed.data.newVersion, tplRow.id]
    );
  });

  // 6. Invalidate in-process cache
  invalidateTemplateCache(key);

  // Count affected tenants for the response
  const countRow = await queryOne<{ c: string }>(
    `SELECT COUNT(*)::text AS c
       FROM tenants t
       JOIN sections s ON s.tenant_id = t.id
      WHERE t.template_id = $1 AND s.content_source = 'v2'`,
    [tplRow.id]
  );
  const affectedTenants = parseInt(countRow?.c ?? "0", 10);

  await auditLog("template_published", {
    targetType: "template",
    targetId: key,
    extra: {
      previousVersion: tplRow.current_version,
      newVersion: parsed.data.newVersion,
      checksum,
      affectedTenants,
      changelog: parsed.data.changelog,
    },
  });

  return Response.json({
    ok: true,
    templateKey: key,
    previousVersion: tplRow.current_version,
    newVersion: parsed.data.newVersion,
    checksum,
    affectedTenants,
  });
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { key } = await params;
  const versions = await query<{ version: string; checksum: string | null; published_at: string; migration_notes: string | null }>(
    `SELECT tv.version, tv.checksum, tv.published_at, tv.migration_notes
       FROM template_versions tv
       JOIN templates t ON t.id = tv.template_id
      WHERE t.key = $1
      ORDER BY tv.published_at DESC NULLS LAST`,
    [key]
  );
  return Response.json({ templateKey: key, versions });
}

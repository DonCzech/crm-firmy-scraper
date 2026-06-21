import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { existsSync } from "fs";
import { createHash } from "crypto";
import { query, queryOne, withTransaction, auditLog } from "@/lib/db";
import { loadTemplate } from "@/lib/templates/loader";
import { invalidateTemplateCache } from "@/lib/section-resolver";

/**
 * Vercel Cron — auto-seed disk templates into template_versions.
 *
 * Schedule: hourly (15 * * * *).
 *
 * For each `src/templates/<key>/` on disk:
 *   1. loadTemplate(key) → resolved manifest + theme + content
 *   2. compute sha256 checksum
 *   3. If template_versions row for current_version has SAME checksum → skip
 *   4. Otherwise upsert + bump templates.current_version + invalidate cache
 *
 * Result: new template files (or updates to existing ones) appear in DB
 * within an hour without manual `node scripts/seed-all-templates.mjs`.
 *
 * Auth: x-cron-secret header must match CRON_SECRET env var.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== (process.env.CRON_SECRET ?? "")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templatesRoot = path.join(process.cwd(), "src", "templates");
  if (!existsSync(templatesRoot)) {
    return Response.json({ scanned: 0, message: "templates dir missing" });
  }

  const entries = await fs.readdir(templatesRoot, { withFileTypes: true });
  const keys = entries.filter((d) => d.isDirectory()).map((d) => d.name);

  let inserted = 0, updated = 0, skipped = 0, failed = 0;
  const failures: Array<{ key: string; error: string }> = [];

  for (const key of keys) {
    try {
      const tpl = await loadTemplate(key);
      const checksum = sha256(JSON.stringify({
        sections: tpl.defaultSections,
        tokens: tpl.designTokens,
        demo: tpl.demoContent,
      }));

      const tplRow = await queryOne<{ id: number; current_version: string }>(
        "SELECT id, current_version FROM templates WHERE key = $1",
        [key]
      );

      if (tplRow) {
        const existing = await queryOne<{ checksum: string | null }>(
          "SELECT checksum FROM template_versions WHERE template_id = $1 AND version = $2",
          [tplRow.id, tplRow.current_version]
        );
        if (existing?.checksum === checksum) {
          skipped++;
          continue;
        }
      }

      await withTransaction(async (client) => {
        const tplRes = await client.query<{ id: number; inserted: boolean }>(
          `INSERT INTO templates (key, name, industry, current_version, status)
           VALUES ($1, $2, $3, $4, 'active')
           ON CONFLICT (key) DO UPDATE SET
             name = EXCLUDED.name,
             industry = EXCLUDED.industry,
             current_version = EXCLUDED.current_version,
             updated_at = now()
           RETURNING id, xmax = 0 AS inserted`,
          [tpl.key, tpl.name, tpl.industry, tpl.version]
        );
        const templateId = tplRes.rows[0].id;

        await client.query(
          `INSERT INTO template_versions (template_id, version, default_sections, default_design_tokens, default_demo_content, checksum, published_at)
           VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6, now())
           ON CONFLICT (template_id, version) DO UPDATE SET
             default_sections = EXCLUDED.default_sections,
             default_design_tokens = EXCLUDED.default_design_tokens,
             default_demo_content = EXCLUDED.default_demo_content,
             checksum = EXCLUDED.checksum,
             published_at = now()`,
          [
            templateId,
            tpl.version,
            JSON.stringify(tpl.defaultSections),
            JSON.stringify(tpl.designTokens),
            JSON.stringify(tpl.demoContent),
            checksum,
          ]
        );

        if (tplRes.rows[0].inserted) inserted++;
        else updated++;
      });

      invalidateTemplateCache(key);
    } catch (err) {
      failed++;
      failures.push({ key, error: err instanceof Error ? err.message : String(err) });
    }
  }

  if (inserted + updated > 0) {
    await auditLog("cron_seed_templates", {
      targetType: "template",
      extra: { inserted, updated, skipped, failed, total: keys.length },
    });
  }

  return Response.json({
    scanned: keys.length,
    inserted,
    updated,
    skipped,
    failed,
    failures: failures.length > 0 ? failures : undefined,
  });
}

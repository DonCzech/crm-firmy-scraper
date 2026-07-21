import { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { queryOne } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { moodPresetSchema } from "@/lib/schema/section";

/**
 * GET /api/demo/<slug>/mood-presets — mood presety šablony tenanta.
 *
 * Presety deklaruje šablona v `template.json` (pole `moodPresets`); aplikace
 * presetu jde klientsky přes existující POST /api/demo/<slug>/design-tokens,
 * takže tenhle endpoint je čistě read-only katalog.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const presetsFileSchema = z.object({ moodPresets: z.array(moodPresetSchema).optional() }).passthrough();

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const row = await queryOne<{ key: string }>(
    `SELECT t.key FROM templates t JOIN tenants te ON te.template_id = t.id WHERE te.id = $1`,
    [tenant.id]
  );
  if (!row?.key || !/^[a-z0-9-]+$/.test(row.key)) return Response.json({ presets: [] });

  try {
    const manifestPath = path.join(process.cwd(), "src", "templates", row.key, "template.json");
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    const parsed = presetsFileSchema.safeParse(raw);
    const presets = parsed.success ? (parsed.data.moodPresets ?? []) : [];
    return Response.json({ presets, templateKey: row.key });
  } catch {
    return Response.json({ presets: [], templateKey: row.key });
  }
}

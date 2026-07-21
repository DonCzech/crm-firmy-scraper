import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { queryOne } from "@/lib/db";

/**
 * GET /api/demo/:tenantSlug/theme-presets
 *
 * Vrací mood presety šablony tenanta (theme.json → `presets`). Preset je
 * pojmenovaná sada brand design-tokenů (colorPrimary, colorAccent, …), kterou
 * Studio aplikuje přes existující design-tokens store — tzn. živý náhled,
 * draft/commit i persistence jedou stávající cestou.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const row = await queryOne<{ key: string }>(
    `SELECT tmpl.key FROM tenants t JOIN templates tmpl ON tmpl.id = t.template_id WHERE t.slug = $1`,
    [tenantSlug]
  );
  if (!row?.key) return Response.json({ presets: {} });

  try {
    const p = path.join(process.cwd(), "src", "templates", row.key, "theme.json");
    const theme = JSON.parse(await fs.readFile(p, "utf8")) as {
      presets?: Record<string, { label: string; tokens: Record<string, string> }>;
    };
    return Response.json({ presets: theme.presets ?? {} });
  } catch {
    return Response.json({ presets: {} });
  }
}

import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { existsSync } from "fs";
import { query } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/platform-admin";

/**
 * F2 Sprint 2 — Template catalog for "Change Template" wizard.
 *
 * Scans src/templates/<key>/template.json + theme.json on disk, returns minimal
 * list (key, name, industry, primaryColor, screenshot URL). Only active templates.
 */
interface CatalogItem {
  key: string;
  name: string;
  industry: string;
  primaryColor: string;
  screenshot: string | null;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requirePlatformAdmin(req);
  if (!auth.ok) return auth.response;
  const root = path.join(process.cwd(), "src", "templates");
  if (!existsSync(root)) return Response.json({ templates: [] });

  const entries = await fs.readdir(root, { withFileTypes: true });
  const dirs = entries.filter((d) => d.isDirectory()).map((d) => d.name);

  // Only return templates seeded in DB (active)
  const activeKeys = new Set(
    (await query<{ key: string }>("SELECT key FROM templates WHERE status = 'active'")).map((r) => r.key)
  );

  const items: CatalogItem[] = [];
  for (const key of dirs) {
    if (!activeKeys.has(key)) continue;
    const manifestPath = path.join(root, key, "template.json");
    const themePath = path.join(root, key, "theme.json");
    if (!existsSync(manifestPath)) continue;
    try {
      const manifest = JSON.parse(await fs.readFile(manifestPath, "utf-8")) as { name?: string; industry?: string };
      const theme = existsSync(themePath)
        ? (JSON.parse(await fs.readFile(themePath, "utf-8")) as { colors?: { primary?: string } })
        : null;
      const screenshotFs = path.join(process.cwd(), "public", "templates", key, "preview.png");
      const screenshot = existsSync(screenshotFs) ? `/templates/${key}/preview.png` : null;
      items.push({
        key,
        name: manifest.name ?? key,
        industry: manifest.industry ?? "default",
        primaryColor: theme?.colors?.primary ?? "#1f1f1f",
        screenshot,
      });
    } catch {
      // skip broken manifest
    }
  }

  items.sort((a, b) => a.industry.localeCompare(b.industry, "cs") || a.name.localeCompare(b.name, "cs"));
  return Response.json({ templates: items });
}

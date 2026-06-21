import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { existsSync } from "fs";
import { auditLog } from "@/lib/db";

/**
 * Vercel Cron — daily residue scan against template content + skin.css.
 *
 * Schedule: 0 3 * * * (daily at 03:00 UTC).
 *
 * Reports findings to audit_log with action='cron_residue_audit'. No render
 * fetch (production sites can't be scanned via cron without auth — rely on
 * disk-level scan for regression detection).
 *
 * Auth: x-cron-secret header must match CRON_SECRET env var.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PATTERNS = [
  { name: "wordpress",  re: /\/wp-content\/|\/wp-includes\//gi },
  { name: "wixstatic",  re: /static\.wixstatic\.com/gi },
  { name: "shopify",    re: /cdn\.shopify\.com\/s\/files/gi },
  { name: "webflow",    re: /assets-global\.website-files\.com/gi },
  { name: "framer",     re: /framerusercontent\.com/gi },
  { name: "wp-emoji",   re: /s\.w\.org\b/gi },
  { name: "clones",     re: /\/clones\/[a-z0-9-]+\//gi },
  { name: "gtm",        re: /googletagmanager\.com\/gtm\.js/gi },
  { name: "fb-pixel",   re: /connect\.facebook\.net|fbevents\.js/gi },
  { name: "clarity",    re: /clarity\.ms/gi },
];

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

  const findings: Array<{ key: string; file: string; pattern: string; count: number; sample: string }> = [];
  for (const key of keys) {
    for (const rel of ["content/cs.json", "skin.css"]) {
      const full = path.join(templatesRoot, key, rel);
      if (!existsSync(full)) continue;
      const raw = await fs.readFile(full, "utf-8");
      for (const p of PATTERNS) {
        const matches = [...raw.matchAll(p.re)];
        if (matches.length > 0) {
          findings.push({
            key,
            file: rel,
            pattern: p.name,
            count: matches.length,
            sample: matches[0][0].slice(0, 80),
          });
        }
      }
    }
  }

  const affectedKeys = new Set(findings.map((f) => f.key));

  await auditLog("cron_residue_audit", {
    targetType: "template",
    extra: {
      scanned: keys.length,
      withFindings: affectedKeys.size,
      totalIssues: findings.reduce((a, f) => a + f.count, 0),
      findings: findings.slice(0, 100),
    },
  });

  return Response.json({
    scanned: keys.length,
    withFindings: affectedKeys.size,
    totalIssues: findings.reduce((a, f) => a + f.count, 0),
    affectedKeys: [...affectedKeys],
    findings: findings.slice(0, 50),
  });
}

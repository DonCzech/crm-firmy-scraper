import { NextRequest } from "next/server";
import {
  markInactiveWarnings,
  archiveInactiveTenants,
  purgeArchivedTenants,
  setSetting,
  type CleanupReport,
} from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

function hasCronSecret(req: NextRequest): boolean {
  if (!CRON_SECRET) return false;
  const authHeader = req.headers.get("authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const a = Buffer.from(CRON_SECRET);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return Buffer.compare(a, b) === 0;
}

function hasAdminCookie(req: NextRequest): boolean {
  const cookies = req.headers.get("cookie") ?? "";
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  return verifyToken(match[1]) !== null;
}

function isAuthorized(req: NextRequest): boolean {
  return (
    hasCronSecret(req) ||
    req.headers.get("x-vercel-cron") === "1" ||
    hasAdminCookie(req)
  );
}

async function runCleanup(dryRun: boolean): Promise<CleanupReport> {
  const [warned, archived, purged] = await Promise.all([
    markInactiveWarnings(dryRun),
    archiveInactiveTenants(dryRun),
    purgeArchivedTenants(dryRun),
  ]);

  const report: CleanupReport = {
    warned,
    archived,
    purged,
    dryRun,
    ranAt: new Date().toISOString(),
  };

  if (!dryRun) {
    await setSetting("last_cleanup_at", report.ranAt);
    await setSetting("last_cleanup_summary", JSON.stringify({
      warned: warned.length,
      archived: archived.length,
      purged: purged.length,
    }));
  }

  console.log("[cleanup-inactive]", JSON.stringify({
    dryRun,
    warned: warned.length,
    archived: archived.length,
    purged: purged.length,
    ranAt: report.ranAt,
  }));

  return report;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dryRun = new URL(req.url).searchParams.get("dry_run") === "1";
  try {
    return Response.json(await runCleanup(dryRun));
  } catch (err) {
    console.error("[cleanup-inactive] error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dryRun = new URL(req.url).searchParams.get("dry_run") === "1";
  try {
    return Response.json(await runCleanup(dryRun));
  } catch (err) {
    console.error("[cleanup-inactive] error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/apiAuth";
import { getPortalConnector } from "@/lib/portal-connectors";

export const maxDuration = 300;

/**
 * Automatický sync exportů na portály — volá se externím cronem
 * (Vercel Cron / systemd timer): GET /api/cron/portal-sync?secret=CRON_SECRET
 * Synchronizuje PENDING a ERROR exporty aktivních inzerátů, max 10 na běh.
 */
export async function GET(req: NextRequest) {
  // Secret v query (?secret=) nebo v hlavičce Authorization: Bearer — Vercel cron
  // posílá Bearer automaticky, když existuje env proměnná CRON_SECRET
  const secret = process.env.CRON_SECRET;
  const provided = req.nextUrl.searchParams.get("secret")
    || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || provided !== secret) {
    return jsonError("Neplatný nebo chybějící CRON_SECRET", 401);
  }

  const exports = await prisma.portalExport.findMany({
    where: {
      status: { in: ["PENDING", "ERROR"] },
      listing: { status: "ACTIVE" },
    },
    include: {
      listing: {
        include: {
          images: { orderBy: { order: "asc" } },
          agent: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
    },
    orderBy: { lastAttemptAt: { sort: "asc", nulls: "first" } },
    take: 10,
  });

  const results: { id: string; portal: string; ok: boolean; message?: string }[] = [];

  for (const pe of exports) {
    const connector = getPortalConnector(pe.portal);
    const attemptedAt = new Date();
    if (!connector) {
      results.push({ id: pe.id, portal: pe.portal, ok: false, message: "Konektor není implementovaný" });
      continue;
    }
    try {
      const result = await connector.sync(pe.listing, { localId: pe.localId });
      await prisma.portalExport.update({
        where: { id: pe.id },
        data: {
          status: result.published ? "SYNCED" : "PENDING",
          lastSyncAt: result.published ? attemptedAt : null,
          lastAttemptAt: attemptedAt,
          verifiedAt: result.published ? attemptedAt : null,
          externalId: result.externalId,
          remoteUrl: result.remoteUrl || null,
          remoteStatus: result.remoteStatus,
          errorLog: result.published ? null : result.message,
        },
      });
      results.push({ id: pe.id, portal: pe.portal, ok: result.published, message: result.message });
    } catch (e: any) {
      await prisma.portalExport.update({
        where: { id: pe.id },
        data: {
          status: "ERROR",
          lastAttemptAt: attemptedAt,
          errorLog: e.message?.slice(0, 2000) || "Neznámá chyba",
        },
      });
      results.push({ id: pe.id, portal: pe.portal, ok: false, message: e.message });
    }
  }

  return jsonOk({ processed: results.length, results });
}

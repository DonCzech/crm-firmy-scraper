import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";
import { getPortalConnector } from "@/lib/portal-connectors";
import { PortalConnectorError } from "@/lib/portal-connectors/types";

export const maxDuration = 300;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const portalExport = await prisma.portalExport.findUnique({
    where: { id },
    include: {
      listing: {
        include: {
          images: { orderBy: { order: "asc" } },
          agent: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
    },
  });
  if (!portalExport) return jsonError("Export nenalezen", 404);

  const connector = getPortalConnector(portalExport.portal);
  const attemptedAt = new Date();

  if (!connector) {
    const message = "Konektor pro tento portál zatím není implementovaný.";
    const updated = await prisma.portalExport.update({
      where: { id },
      data: {
        status: "ERROR",
        lastAttemptAt: attemptedAt,
        verifiedAt: null,
        remoteStatus: "NOT_IMPLEMENTED",
        errorLog: message,
      },
    });
    return jsonOk({ export: updated, success: false, message });
  }

  try {
    const result = await connector.sync(portalExport.listing, {
      localId: portalExport.localId,
    });
    const updated = await prisma.portalExport.update({
      where: { id },
      data: {
        status: result.published ? "SYNCED" : "PENDING",
        externalId: result.externalId,
        lastAttemptAt: attemptedAt,
        lastSyncAt: result.published ? attemptedAt : null,
        verifiedAt: result.published ? attemptedAt : null,
        remoteUrl: result.remoteUrl || null,
        remoteStatus: result.remoteStatus,
        errorLog: result.published ? null : result.message,
      },
      include: { listing: { select: { id: true, title: true } } },
    });
    return jsonOk({ export: updated, success: result.published, message: result.message });
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Synchronizace s portálem selhala.";
    const remoteStatus =
      caught instanceof PortalConnectorError ? caught.code : "UNEXPECTED_ERROR";
    const updated = await prisma.portalExport.update({
      where: { id },
      data: {
        status: "ERROR",
        lastAttemptAt: attemptedAt,
        verifiedAt: null,
        remoteStatus,
        errorLog: message,
      },
      include: { listing: { select: { id: true, title: true } } },
    });
    return jsonOk({ export: updated, success: false, message });
  }
}

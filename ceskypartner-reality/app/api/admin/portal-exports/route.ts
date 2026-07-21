import { NextRequest } from "next/server";
import type { Portal } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";
import { PORTAL_MAP } from "@/lib/portals";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const exports = await prisma.portalExport.findMany({
    include: {
      listing: { select: { id: true, title: true, status: true, location: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonOk(exports);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { portal, listingId } = body;

  if (!portal || !listingId) {
    return jsonError("Chybi portal nebo listingId");
  }
  const portalInfo = PORTAL_MAP[String(portal).toUpperCase()];
  if (!portalInfo) return jsonError("Neznamy portal");
  if (portalInfo.exportable === false) {
    return jsonError("Tato polozka neni samostatny exportovatelny realitni portal");
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return jsonError("Nemovitost nenalezena", 404);

  const existing = await prisma.portalExport.findUnique({
    where: { portal_listingId: { portal: portalInfo.key as Portal, listingId } },
  });
  if (existing) return jsonError("Export pro tento portal jiz existuje");

  const exp = await prisma.portalExport.create({
    data: {
      portal: portalInfo.key as Portal,
      listingId,
      status: "PENDING",
    },
    include: { listing: { select: { id: true, title: true } } },
  });

  return jsonOk(exp, 201);
}

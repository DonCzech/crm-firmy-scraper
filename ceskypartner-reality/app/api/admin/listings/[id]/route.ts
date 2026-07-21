import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";
import { notifyMatchingDemands } from "@/lib/watchdog";

/** Po každé změně inzerátu invaliduje ISR cache webu, aby se změna projevila hned. */
function revalidateListing(slug?: string | null) {
  if (slug) revalidatePath(`/nemovitost/${slug}`);
  revalidatePath("/");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      agent: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
      images: { orderBy: { order: "asc" } },
      video: true,
      portalExports: true,
      contacts: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!listing) return jsonError("Nemovitost nenalezena", 404);
  return jsonOk(listing);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing) return jsonError("Nemovitost nenalezena", 404);

  const wasNotActive = existing.status !== "ACTIVE";
  const becomingActive = body.status === "ACTIVE";

  const { imageUrls, portals, ...data } = body;

  const listing = await prisma.listing.update({
    where: { id },
    data: {
      ...data,
      publishedAt: wasNotActive && becomingActive ? new Date() : undefined,
    },
    include: { agent: { select: { id: true, name: true } } },
  });

  if (Array.isArray(portals)) {
    await prisma.portalExport.deleteMany({
      where: { listingId: id, portal: { notIn: portals as any[] }, status: { not: "SYNCED" } },
    });
    if (portals.length > 0) {
      await prisma.portalExport.createMany({
        data: portals.map((p: string) => ({ portal: p as any, listingId: id })),
        skipDuplicates: true,
      });
    }
  }

  if (Array.isArray(imageUrls) && imageUrls.length > 0) {
    await prisma.media.updateMany({
      where: { url: { in: imageUrls }, listingId: null },
      data: { listingId: id },
    });
    let order = 0;
    for (const url of imageUrls) {
      await prisma.media.updateMany({ where: { url, listingId: id }, data: { order: order++ } });
    }
  }

  revalidateListing(listing.slug);

  // Publikace → avízo klientům s odpovídajícím hlídacím psem (fire-and-forget)
  if (wasNotActive && becomingActive) {
    notifyMatchingDemands(listing.id);
  }

  return jsonOk(listing);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;
  const deleted = await prisma.listing.delete({ where: { id } });
  revalidateListing(deleted.slug);
  return jsonOk({ deleted: true });
}

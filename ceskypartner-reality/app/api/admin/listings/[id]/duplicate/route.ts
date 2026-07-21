import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

/**
 * Duplikace inzerátu — kopie všech polí jako DRAFT.
 * Fotky se nekopírují (Media.key je unikátní na R2 objekt); nahrají se nové.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const src = await prisma.listing.findUnique({ where: { id } });
  if (!src) return jsonError("Nemovitost nenalezena", 404);

  const { id: _id, slug, createdAt, updatedAt, publishedAt, videoId, ...fields } = src;

  const copy = await prisma.listing.create({
    data: {
      ...fields,
      title: `${src.title} (kopie)`,
      slug: `${slug}-kopie-${Date.now().toString(36)}`,
      status: "DRAFT",
      publishedAt: null,
      agentId: (session!.user as any).id || src.agentId,
    },
  });

  return jsonOk(copy, 201);
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";
import { deleteFromR2, isR2Configured } from "@/lib/r2";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const media = await prisma.media.update({
    where: { id },
    data: {
      alt: body.alt,
      order: body.order,
      listingId: body.listingId,
      blogPostId: body.blogPostId,
    },
  });

  return jsonOk(media);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return jsonError("Media nenalezeno", 404);

  if (isR2Configured() && media.key) {
    await deleteFromR2(media.key);
  }
  await prisma.media.delete({ where: { id } });
  return jsonOk({ deleted: true });
}

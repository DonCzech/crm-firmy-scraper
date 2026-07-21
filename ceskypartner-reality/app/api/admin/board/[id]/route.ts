import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { pinned, content } = body;

  const existing = await prisma.boardMessage.findUnique({ where: { id } });
  if (!existing) return jsonError("Zprava nenalezena", 404);

  const message = await prisma.boardMessage.update({
    where: { id },
    data: {
      ...(pinned !== undefined && { pinned: !!pinned }),
      ...(content !== undefined && { content }),
    },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });

  return jsonOk(message);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const message = await prisma.boardMessage.findUnique({ where: { id } });
  if (!message) return jsonError("Zprava nenalezena", 404);

  const user = session!.user as any;
  if (user.role !== "ADMIN" && message.authorId !== user.id) {
    return jsonError("Muzete mazat jen vlastni zpravy", 403);
  }

  await prisma.boardMessage.delete({ where: { id } });
  return jsonOk({ deleted: true });
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const { content } = await req.json();

  if (!content?.trim()) {
    return jsonError("Poznamka nemuze byt prazdna");
  }

  const note = await prisma.contactNote.create({
    data: {
      content: content.trim(),
      contactId: id,
      authorId: (session!.user as any).id,
    },
    include: { author: { select: { id: true, name: true } } },
  });

  return jsonOk(note, 201);
}

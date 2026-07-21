import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const messages = await prisma.boardMessage.findMany({
    include: { author: { select: { id: true, name: true, avatar: true } } },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return jsonOk(messages);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { content, pinned } = body;
  if (!content?.trim()) return jsonError("Chybi obsah zpravy");

  const message = await prisma.boardMessage.create({
    data: {
      content: content.trim(),
      pinned: !!pinned,
      authorId: (session!.user as any).id,
    },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });

  return jsonOk(message, 201);
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true, avatar: true } },
      images: true,
    },
  });

  if (!post) return jsonError("Clanek nenalezen", 404);
  return jsonOk(post);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return jsonError("Clanek nenalezen", 404);

  const wasNotPublished = existing.status !== "PUBLISHED";
  const becomingPublished = body.status === "PUBLISHED";

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...body,
      publishedAt: wasNotPublished && becomingPublished ? new Date() : undefined,
    },
    include: { author: { select: { id: true, name: true } } },
  });

  return jsonOk(post);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } });
  return jsonOk({ deleted: true });
}

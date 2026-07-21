import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";
import { deleteFromR2, isR2Configured } from "@/lib/r2";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { name, category, note, dealId, listingId } = body;

  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) return jsonError("Dokument nenalezen", 404);

  const document = await prisma.document.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(note !== undefined && { note: note || null }),
      ...(dealId !== undefined && { dealId: dealId || null }),
      ...(listingId !== undefined && { listingId: listingId || null }),
    },
  });

  return jsonOk(document);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) return jsonError("Dokument nenalezen", 404);

  if (isR2Configured()) {
    await deleteFromR2(document.key).catch(() => {});
  }
  await prisma.document.delete({ where: { id } });
  return jsonOk({ deleted: true });
}

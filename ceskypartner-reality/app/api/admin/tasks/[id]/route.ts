import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return jsonError("Ukol nenalezen", 404);

  const { title, description, status, priority, dueDate, assigneeId, dealId, personId, listingId } = body;

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description: description || null }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      ...(dealId !== undefined && { dealId: dealId || null }),
      ...(personId !== undefined && { personId: personId || null }),
      ...(listingId !== undefined && { listingId: listingId || null }),
    },
    include: { assignee: { select: { id: true, name: true } } },
  });

  return jsonOk(task);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return jsonOk({ deleted: true });
}

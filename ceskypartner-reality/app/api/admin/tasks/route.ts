import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const assigneeId = searchParams.get("assigneeId");

  const where: any = {};
  if (status) where.status = status;
  if (assigneeId) where.assigneeId = assigneeId;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      deal: { select: { id: true, title: true } },
      person: { select: { id: true, name: true } },
      listing: { select: { id: true, title: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  return jsonOk(tasks);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { title, description, status, priority, dueDate, assigneeId, dealId, personId, listingId } = body;
  if (!title) return jsonError("Chybi nazev ukolu");

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      status: status || "TODO",
      priority: priority || "NORMAL",
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || (session!.user as any).id,
      dealId: dealId || null,
      personId: personId || null,
      listingId: listingId || null,
    },
    include: { assignee: { select: { id: true, name: true } } },
  });

  return jsonOk(task, 201);
}

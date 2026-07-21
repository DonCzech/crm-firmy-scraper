import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) return jsonError("Pripad nenalezen", 404);

  const { title, stage, dealType, price, commission, commissionPct, note, listingId, clientId, agentId } = body;

  const deal = await prisma.deal.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(stage !== undefined && {
        stage,
        closedAt: stage === "CLOSED" ? existing.closedAt ?? new Date() : stage === "LOST" ? existing.closedAt : null,
      }),
      ...(dealType !== undefined && { dealType }),
      ...(price !== undefined && { price: price ? Number(price) : null }),
      ...(commission !== undefined && { commission: commission ? Number(commission) : null }),
      ...(commissionPct !== undefined && { commissionPct: commissionPct ? Number(commissionPct) : null }),
      ...(note !== undefined && { note: note || null }),
      ...(listingId !== undefined && { listingId: listingId || null }),
      ...(clientId !== undefined && { clientId: clientId || null }),
      ...(agentId !== undefined && { agentId: agentId || null }),
    },
    include: {
      listing: { select: { id: true, title: true } },
      client: { select: { id: true, name: true } },
      agent: { select: { id: true, name: true } },
    },
  });

  return jsonOk(deal);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  await prisma.deal.delete({ where: { id } });
  return jsonOk({ deleted: true });
}

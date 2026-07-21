import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const stage = searchParams.get("stage");
  const agentId = searchParams.get("agentId");

  const where: any = {};
  if (stage) where.stage = stage;
  if (agentId) where.agentId = agentId;

  const deals = await prisma.deal.findMany({
    where,
    include: {
      listing: { select: { id: true, title: true, location: true, price: true } },
      client: { select: { id: true, name: true, phone: true, email: true } },
      agent: { select: { id: true, name: true } },
      _count: { select: { tasks: true, documents: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return jsonOk(deals);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { title, stage, dealType, price, commission, commissionPct, note, listingId, clientId, agentId } = body;
  if (!title) return jsonError("Chybi nazev pripadu");

  const deal = await prisma.deal.create({
    data: {
      title,
      stage: stage || "LEAD",
      dealType: dealType || "SALE",
      price: price ? Number(price) : null,
      commission: commission ? Number(commission) : null,
      commissionPct: commissionPct ? Number(commissionPct) : null,
      note: note || null,
      listingId: listingId || null,
      clientId: clientId || null,
      agentId: agentId || (session!.user as any).id,
      closedAt: stage === "CLOSED" ? new Date() : null,
    },
    include: {
      listing: { select: { id: true, title: true } },
      client: { select: { id: true, name: true } },
      agent: { select: { id: true, name: true } },
    },
  });

  return jsonOk(deal, 201);
}

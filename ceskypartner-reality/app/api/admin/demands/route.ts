import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  const demands = await prisma.demand.findMany({
    where,
    include: { person: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  return jsonOk(demands);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { title, deal, kind, region, district, dispositions, priceMin, priceMax, areaMin, note, personId, status } = body;
  if (!title || !deal) return jsonError("Chybi nazev nebo typ obchodu");

  const demand = await prisma.demand.create({
    data: {
      title,
      deal,
      kind: kind || null,
      region: region || null,
      district: district || null,
      dispositions: dispositions || [],
      priceMin: priceMin ? Number(priceMin) : null,
      priceMax: priceMax ? Number(priceMax) : null,
      areaMin: areaMin ? Number(areaMin) : null,
      note: note || null,
      status: status || "ACTIVE",
      personId: personId || null,
    },
    include: { person: { select: { id: true, name: true } } },
  });

  return jsonOk(demand, 201);
}

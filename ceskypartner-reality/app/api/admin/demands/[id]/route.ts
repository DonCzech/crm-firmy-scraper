import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const demand = await prisma.demand.findUnique({
    where: { id },
    include: { person: { select: { id: true, name: true, email: true, phone: true } } },
  });
  if (!demand) return jsonError("Poptavka nenalezena", 404);

  // Párování poptávky s aktivními nabídkami podle kritérií
  const where: any = { status: "ACTIVE", deal: demand.deal };
  if (demand.kind) where.kind = demand.kind;
  if (demand.region) where.region = demand.region;
  if (demand.district) where.district = demand.district;
  if (demand.dispositions.length > 0) where.disposition = { in: demand.dispositions };
  if (demand.priceMin || demand.priceMax) {
    where.price = {};
    if (demand.priceMin) where.price.gte = demand.priceMin;
    if (demand.priceMax) where.price.lte = demand.priceMax;
  }
  if (demand.areaMin) where.area = { gte: demand.areaMin };

  const matches = await prisma.listing.findMany({
    where,
    select: {
      id: true, title: true, slug: true, price: true, location: true,
      disposition: true, area: true, kind: true,
      images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  return jsonOk({ demand, matches });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.demand.findUnique({ where: { id } });
  if (!existing) return jsonError("Poptavka nenalezena", 404);

  const { title, deal, kind, region, district, dispositions, priceMin, priceMax, areaMin, note, personId, status } = body;

  const demand = await prisma.demand.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(deal !== undefined && { deal }),
      ...(kind !== undefined && { kind: kind || null }),
      ...(region !== undefined && { region: region || null }),
      ...(district !== undefined && { district: district || null }),
      ...(dispositions !== undefined && { dispositions: dispositions || [] }),
      ...(priceMin !== undefined && { priceMin: priceMin ? Number(priceMin) : null }),
      ...(priceMax !== undefined && { priceMax: priceMax ? Number(priceMax) : null }),
      ...(areaMin !== undefined && { areaMin: areaMin ? Number(areaMin) : null }),
      ...(note !== undefined && { note: note || null }),
      ...(personId !== undefined && { personId: personId || null }),
      ...(status !== undefined && { status }),
    },
    include: { person: { select: { id: true, name: true } } },
  });

  return jsonOk(demand);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  await prisma.demand.delete({ where: { id } });
  return jsonOk({ deleted: true });
}

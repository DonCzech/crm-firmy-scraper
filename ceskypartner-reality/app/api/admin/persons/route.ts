import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const search = searchParams.get("q");

  const where: any = {};
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const persons = await prisma.person.findMany({
    where,
    include: { _count: { select: { deals: true, demands: true, tasks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return jsonOk(persons);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { name, email, phone, type, company, address, note, gdprConsent } = body;
  if (!name) return jsonError("Chybi jmeno");

  const person = await prisma.person.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      type: type || "CLIENT",
      company: company || null,
      address: address || null,
      note: note || null,
      gdprConsent: !!gdprConsent,
      gdprConsentAt: gdprConsent ? new Date() : null,
    },
  });

  return jsonOk(person, 201);
}

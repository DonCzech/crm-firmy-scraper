import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  settings.forEach((s) => { map[s.key] = s.value; });

  return jsonOk(map);
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;

  const body = await req.json();

  if (typeof body !== "object" || body === null) {
    return jsonError("Body musi byt objekt { key: value }");
  }

  const ops = Object.entries(body).map(([key, value]) =>
    prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  );

  await prisma.$transaction(ops);
  return jsonOk({ saved: true });
}

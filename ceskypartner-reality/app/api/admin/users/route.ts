import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      phone: true,
      createdAt: true,
      _count: { select: { listings: true, blogPosts: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return jsonOk(users);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;

  const { email, name, password, role, phone } = await req.json();

  if (!email || !name || !password) {
    return jsonError("Chybi povinne pole: email, name, password");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return jsonError("Uzivatel s timto emailem jiz existuje", 409);

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: role || "AGENT",
      phone: phone || null,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return jsonOk(user, 201);
}

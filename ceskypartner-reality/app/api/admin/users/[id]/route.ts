import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  const data: any = {};
  if (body.name) data.name = body.name;
  if (body.email) data.email = body.email;
  if (body.role) data.role = body.role;
  if (body.phone !== undefined) data.phone = body.phone || null;
  if (body.password) data.passwordHash = await hash(body.password, 12);

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true },
  });

  return jsonOk(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth("ADMIN");
  if (error) return error;

  const { id } = await params;

  if ((session!.user as any).id === id) {
    return jsonError("Nemuzes smazat sam sebe", 400);
  }

  await prisma.user.delete({ where: { id } });
  return jsonOk({ deleted: true });
}

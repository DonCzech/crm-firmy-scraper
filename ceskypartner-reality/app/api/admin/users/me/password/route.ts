import { NextRequest } from "next/server";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function PATCH(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { oldPassword, newPassword } = await req.json();

  if (!oldPassword || !newPassword) {
    return jsonError("Chybi stavajici nebo nove heslo");
  }

  if (newPassword.length < 6) {
    return jsonError("Heslo musi mit alespon 6 znaku");
  }

  const userId = (session!.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return jsonError("Uzivatel nenalezen", 404);

  const valid = await compare(oldPassword, user.passwordHash);
  if (!valid) return jsonError("Stavajici heslo neni spravne");

  const passwordHash = await hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return jsonOk({ changed: true });
}

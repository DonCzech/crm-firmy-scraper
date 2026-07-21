import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  await req.json();

  const exp = await prisma.portalExport.findUnique({ where: { id } });
  if (!exp) return jsonError("Export nenalezen", 404);

  return jsonError(
    "Stav exportu nelze nastavovat ručně. Použijte synchronizační endpoint konektoru.",
    409,
  );
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  await prisma.portalExport.delete({ where: { id } });
  return jsonOk({ deleted: true });
}

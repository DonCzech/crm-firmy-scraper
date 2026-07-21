import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk } from "@/lib/apiAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const row = await prisma.testimonial.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
      ...(body.context !== undefined ? { context: body.context?.trim() || null } : {}),
      ...(body.quote !== undefined ? { quote: String(body.quote).trim() } : {}),
      ...(body.rating !== undefined ? { rating: Math.min(5, Math.max(1, Number(body.rating) || 5)) } : {}),
      ...(body.published !== undefined ? { published: Boolean(body.published) } : {}),
    },
  });
  revalidatePath("/");
  revalidatePath("/prodano");
  return jsonOk(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth("ADMIN");
  if (error) return error;
  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/prodano");
  return jsonOk({ deleted: true });
}

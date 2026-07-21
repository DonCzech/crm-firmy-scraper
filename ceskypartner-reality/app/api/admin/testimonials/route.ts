import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const rows = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return jsonOk(rows);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;
  const body = await req.json();
  if (!body.name?.trim() || !body.quote?.trim()) {
    return jsonError("Vyplňte jméno a text recenze");
  }
  const row = await prisma.testimonial.create({
    data: {
      name: String(body.name).trim(),
      context: body.context?.trim() || null,
      quote: String(body.quote).trim(),
      rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
      published: Boolean(body.published),
    },
  });
  revalidatePath("/");
  revalidatePath("/prodano");
  return jsonOk(row, 201);
}

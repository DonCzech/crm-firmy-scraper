import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const search = searchParams.get("q");

  const where: any = {};
  if (type === "image") where.mimeType = { startsWith: "image/" };
  else if (type === "video") where.mimeType = { startsWith: "video/" };
  if (search) where.filename = { contains: search, mode: "insensitive" };

  const media = await prisma.media.findMany({
    where,
    include: {
      listing: { select: { id: true, title: true } },
      blogPost: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonOk(media);
}

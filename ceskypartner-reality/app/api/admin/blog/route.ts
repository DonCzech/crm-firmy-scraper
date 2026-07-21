import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const search = searchParams.get("q");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)));

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return jsonOk({ posts, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { title, content, excerpt, coverImage, metaTitle, metaDesc, tags, status: postStatus } = body;

  if (!title || !content) {
    return jsonError("Chybi povinne pole: title, content");
  }

  const slug = title
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existingSlug = await prisma.blogPost.findUnique({ where: { slug } });
  const finalSlug = existingSlug ? `${slug}-${Date.now().toString(36)}` : slug;

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug: finalSlug,
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      metaTitle: metaTitle || null,
      metaDesc: metaDesc || null,
      tags: tags || [],
      status: postStatus || "DRAFT",
      authorId: (session!.user as any).id,
      publishedAt: postStatus === "PUBLISHED" ? new Date() : null,
    },
    include: { author: { select: { id: true, name: true } } },
  });

  return jsonOk(post, 201);
}

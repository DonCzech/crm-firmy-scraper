import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";
import { uploadToR2, isR2Configured } from "@/lib/r2";

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const search = searchParams.get("q");

  const where: any = {};
  if (category) where.category = category;
  if (search) where.name = { contains: search, mode: "insensitive" };

  const documents = await prisma.document.findMany({
    where,
    include: {
      uploader: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true } },
      listing: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return jsonOk(documents);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as string) || "OTHER";
  const note = formData.get("note") as string | null;
  const dealId = formData.get("dealId") as string | null;
  const listingId = formData.get("listingId") as string | null;

  if (!file) return jsonError("Chybi soubor");

  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now().toString(36);
  const safeName = file.name
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();
  const key = `documents/${timestamp}-${safeName}`;

  let url: string;
  if (isR2Configured()) {
    url = await uploadToR2(key, buffer, file.type || "application/octet-stream");
  } else {
    const localDir = join(process.cwd(), "public", "uploads", "documents");
    await mkdir(localDir, { recursive: true });
    await writeFile(join(localDir, `${timestamp}-${safeName}`), buffer);
    url = `/uploads/documents/${timestamp}-${safeName}`;
  }

  const document = await prisma.document.create({
    data: {
      name: file.name,
      url,
      key,
      mimeType: file.type || "application/octet-stream",
      size: buffer.length,
      category: category as any,
      note: note || null,
      uploaderId: (session!.user as any).id,
      dealId: dealId || null,
      listingId: listingId || null,
    },
    include: { uploader: { select: { id: true, name: true } } },
  });

  return jsonOk(document, 201);
}

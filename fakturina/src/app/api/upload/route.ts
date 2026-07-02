import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { extname, join } from "path";
import { requireSession, getUserCompany } from "@/lib/auth";

const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "branding");

function safeExt(file: File) {
  const byName = extname(file.name).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".svg"].includes(byName)) return byName;
  if (file.type === "image/png") return ".png";
  if (file.type === "image/jpeg") return ".jpg";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/svg+xml") return ".svg";
  return "";
}

export async function POST(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = String(formData.get("type") ?? "image");

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Podporované jsou PNG, JPG, WebP nebo SVG" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Soubor je příliš velký (max 4 MB)" }, { status: 400 });
  }

  const ext = safeExt(file);
  if (!ext) return NextResponse.json({ error: "Neplatná přípona souboru" }, { status: 400 });

  const prefix = type === "stamp" ? "stamp" : type === "logo" ? "logo" : "image";
  const filename = `${company.id}-${prefix}-${randomUUID()}${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/branding/${filename}` }, { status: 201 });
}

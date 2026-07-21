import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { extname } from "path";
import { requireSession, getUserCompany } from "@/lib/auth";
import { storePublicFile } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/security";

const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function safeExt(file: File) {
  const byName = extname(file.name).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(byName)) return byName;
  if (file.type === "image/png") return ".png";
  if (file.type === "image/jpeg") return ".jpg";
  if (file.type === "image/webp") return ".webp";
  return "";
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(`branding-upload:${requestIp(req)}`, 20, 60 * 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Příliš mnoho uploadů" }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = String(formData.get("type") ?? "image");

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Podporované jsou PNG, JPG nebo WebP" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Soubor je příliš velký (max 4 MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isWebp = buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (!isPng && !isJpeg && !isWebp) {
    return NextResponse.json({ error: "Obsah souboru neodpovídá podporovanému obrázku" }, { status: 400 });
  }

  const ext = safeExt(file);
  if (!ext) return NextResponse.json({ error: "Neplatná přípona souboru" }, { status: 400 });

  const prefix = type === "stamp" ? "stamp" : type === "logo" ? "logo" : "image";
  const filename = `${company.id}-${prefix}-${randomUUID()}${ext}`;
  const url = await storePublicFile(`branding/${filename}`, buffer, file.type);
  return NextResponse.json({ url }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { deletePublicFile, storePublicFile } from "@/lib/storage";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const { id } = await params;
  const { rows } = await query(
    "SELECT a.* FROM fak_invoice_attachments a JOIN fak_invoices i ON i.id = a.invoice_id WHERE a.invoice_id = $1 AND i.company_id = $2 ORDER BY a.created_at DESC",
    [id, company.id]
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const { id } = await params;
  const { rows: inv } = await query("SELECT id FROM fak_invoices WHERE id = $1 AND company_id = $2", [id, company.id]);
  if (!inv[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Soubor je příliš velký (max 10 MB)" }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const isPdf = buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isWebp = buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (!isPdf && !isPng && !isJpeg && !isWebp) {
    return NextResponse.json({ error: "Povoleny jsou pouze PDF, PNG, JPG a WebP" }, { status: 400 });
  }
  const ext = isPdf ? "pdf" : isPng ? "png" : isJpeg ? "jpg" : "webp";
  const mime = isPdf ? "application/pdf" : isPng ? "image/png" : isJpeg ? "image/jpeg" : "image/webp";
  const filename = `${randomUUID()}.${ext}`;
  const fileUrl = await storePublicFile(`attachments/${company.id}/${filename}`, buffer, mime);

  const attachId = randomUUID();
  await query(
    "INSERT INTO fak_invoice_attachments (id, invoice_id, filename, file_url, file_size, mime_type) VALUES ($1, $2, $3, $4, $5, $6)",
    [attachId, id, file.name.slice(0, 255), fileUrl, file.size, mime]
  );

  const { rows } = await query("SELECT * FROM fak_invoice_attachments WHERE id = $1", [attachId]);
  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const { id } = await params;
  const attachId = req.nextUrl.searchParams.get("attachId");
  if (!attachId) return NextResponse.json({ error: "Missing attachId" }, { status: 400 });

  const deleted = await query(
    `DELETE FROM fak_invoice_attachments
     WHERE id = $1 AND invoice_id = $3 AND invoice_id IN (
       SELECT id FROM fak_invoices WHERE company_id = $2
     ) RETURNING file_url`,
    [attachId, company.id, id]
  );
  if (deleted.rows[0]?.file_url) await deletePublicFile(deleted.rows[0].file_url).catch(() => undefined);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "attachments");

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

  const ext = file.name.split(".").pop() ?? "";
  const filename = `${randomUUID()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(join(UPLOAD_DIR, filename), Buffer.from(bytes));

  const attachId = randomUUID();
  const fileUrl = `/uploads/attachments/${filename}`;
  await query(
    "INSERT INTO fak_invoice_attachments (id, invoice_id, filename, file_url, file_size, mime_type) VALUES ($1, $2, $3, $4, $5, $6)",
    [attachId, id, file.name, fileUrl, file.size, file.type || null]
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

  await query(
    `DELETE FROM fak_invoice_attachments
     WHERE id = $1 AND invoice_id IN (
       SELECT id FROM fak_invoices WHERE company_id = $2
     )`,
    [attachId, company.id]
  );
  return NextResponse.json({ ok: true });
}

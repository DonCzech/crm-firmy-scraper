import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#4f46e5"),
});

export async function GET() {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json([]);

  const { rows } = await query(
    "SELECT * FROM fak_tags WHERE company_id = $1 ORDER BY name",
    [company.id]
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });

  const id = randomUUID();
  await query(
    "INSERT INTO fak_tags (id, company_id, name, color) VALUES ($1, $2, $3, $4) ON CONFLICT (company_id, name) DO UPDATE SET color = EXCLUDED.color",
    [id, company.id, parsed.data.name, parsed.data.color]
  );
  const { rows } = await query("SELECT * FROM fak_tags WHERE company_id = $1 AND name = $2", [company.id, parsed.data.name]);
  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await query("DELETE FROM fak_tags WHERE id = $1 AND company_id = $2", [id, company.id]);
  return NextResponse.json({ ok: true });
}

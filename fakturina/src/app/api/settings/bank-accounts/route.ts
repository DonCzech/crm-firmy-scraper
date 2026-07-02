import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  bank_account: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
  currency: z.string().default("CZK"),
  is_default: z.boolean().default(false),
});

export async function GET() {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json([]);

  const { rows } = await query(
    "SELECT * FROM fak_bank_accounts WHERE company_id = $1 ORDER BY is_default DESC, created_at ASC",
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

  const d = parsed.data;
  if (d.is_default) {
    await query("UPDATE fak_bank_accounts SET is_default = false WHERE company_id = $1", [company.id]);
  }

  const id = randomUUID();
  await query(
    `INSERT INTO fak_bank_accounts (id, company_id, name, bank_account, iban, swift, currency, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, company.id, d.name, d.bank_account ?? null, d.iban ?? null,
     d.swift ?? null, d.currency, d.is_default]
  );

  const { rows } = await query("SELECT * FROM fak_bank_accounts WHERE id = $1", [id]);
  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await query("DELETE FROM fak_bank_accounts WHERE id = $1 AND company_id = $2", [id, company.id]);
  return NextResponse.json({ ok: true });
}

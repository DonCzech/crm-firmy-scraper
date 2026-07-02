import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { requireSession, getUserCompany } from "@/lib/auth";
import { initDb, query } from "@/lib/db";
import { encryptBankToken } from "@/lib/bank-sync";

const schema = z.object({
  bankAccountId: z.string().min(1),
  provider: z.enum(["fio", "airbank"]).default("fio"),
  name: z.string().min(1),
  token: z.string().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json([]);

  await initDb();
  const { rows } = await query(
    `SELECT bc.id, bc.bank_account_id, bc.provider, bc.name, bc.last_transaction_id,
            bc.last_sync_at, bc.active, bc.created_at, ba.name AS bank_account_name,
            ba.bank_account, ba.currency
     FROM fak_bank_connections bc
     JOIN fak_bank_accounts ba ON ba.id = bc.bank_account_id AND ba.company_id = bc.company_id
     WHERE bc.company_id = $1
     ORDER BY bc.active DESC, bc.created_at DESC`,
    [company.id]
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  await initDb();
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });
  const data = parsed.data;

  const { rows: accountRows } = await query(
    "SELECT id FROM fak_bank_accounts WHERE id = $1 AND company_id = $2",
    [data.bankAccountId, company.id]
  );
  if (!accountRows[0]) return NextResponse.json({ error: "Bankovní účet neexistuje" }, { status: 400 });

  if (data.provider === "airbank") {
    return NextResponse.json(
      { error: "Air Bank napojení je připravené architekturou, ale vyžaduje PSD2 registraci, certifikáty a OAuth souhlas. Použijte zatím Fio API token." },
      { status: 400 }
    );
  }
  if (!data.token) return NextResponse.json({ error: "Chybí Fio API token" }, { status: 400 });

  let tokenEncrypted: string;
  try {
    tokenEncrypted = encryptBankToken(data.token);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Token nelze zašifrovat" }, { status: 500 });
  }

  const id = randomUUID();
  await query(
    `INSERT INTO fak_bank_connections
       (id, company_id, bank_account_id, provider, name, token_encrypted, active)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, company.id, data.bankAccountId, data.provider, data.name, tokenEncrypted, data.active]
  );

  const { rows } = await query(
    `SELECT id, bank_account_id, provider, name, last_transaction_id, last_sync_at, active, created_at
     FROM fak_bank_connections
     WHERE id = $1 AND company_id = $2`,
    [id, company.id]
  );
  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await initDb();
  await query("DELETE FROM fak_bank_connections WHERE id = $1 AND company_id = $2", [id, company.id]);
  return NextResponse.json({ ok: true });
}

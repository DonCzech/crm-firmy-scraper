import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  ico: z.string().optional(),
  dic: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

export async function GET() {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json([]);

  const { rows } = await query(
    "SELECT * FROM fak_clients WHERE company_id = $1 AND archived = false ORDER BY name ASC",
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

  const { name, ico, dic, email, address, city, zip, country } = parsed.data;
  const id = randomUUID();

  await query(
    `INSERT INTO fak_clients (id, company_id, name, ico, dic, email, address, city, zip, country)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, company.id, name, ico ?? null, dic ?? null, email ?? null, address ?? null, city ?? null, zip ?? null, country ?? "CZ"]
  );

  await auditLog({ userId: user.id, companyId: company.id, action: "client.created", entityType: "client", entityId: id });
  const { rows } = await query("SELECT * FROM fak_clients WHERE id = $1", [id]);
  return NextResponse.json(rows[0], { status: 201 });
}

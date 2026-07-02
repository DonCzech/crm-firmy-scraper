import { NextRequest, NextResponse } from "next/server";
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

async function getOwnedClient(clientId: string, companyId: string) {
  const { rows } = await query(
    "SELECT * FROM fak_clients WHERE id = $1 AND company_id = $2",
    [clientId, companyId]
  );
  return rows[0] ?? null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const client = await getOwnedClient(id, company.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const client = await getOwnedClient(id, company.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });

  const { name, ico, dic, email, address, city, zip, country } = parsed.data;
  await query(
    `UPDATE fak_clients SET name=$1, ico=$2, dic=$3, email=$4, address=$5, city=$6, zip=$7, country=$8 WHERE id=$9 AND company_id=$10`,
    [name, ico ?? null, dic ?? null, email ?? null, address ?? null, city ?? null, zip ?? null, country ?? "CZ", id, company.id]
  );

  await auditLog({ userId: user.id, companyId: company.id, action: "client.updated", entityType: "client", entityId: id });
  const { rows } = await query("SELECT * FROM fak_clients WHERE id = $1 AND company_id = $2", [id, company.id]);
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const client = await getOwnedClient(id, company.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await query("UPDATE fak_clients SET archived = true WHERE id = $1 AND company_id = $2", [id, company.id]);
  await auditLog({ userId: user.id, companyId: company.id, action: "client.archived", entityType: "client", entityId: id });
  return NextResponse.json({ ok: true });
}

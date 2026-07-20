import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTenantBySlug, query } from "@/lib/db";
import { getActiveAddonSlugs, initAddonsDb } from "@/lib/commerce/addons";

/** Modul „Diskuze u produktů“ — veřejné otázky k produktu. */
export const dynamic = "force-dynamic";

const PostSchema = z.object({
  product_id: z.number().int().positive(),
  author_name: z.string().trim().min(2).max(80),
  question: z.string().trim().min(5).max(2000),
});

async function guard(tenantSlug: string) {
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { error: NextResponse.json({ error: "Tenant nenalezen" }, { status: 404 }) };
  const active = await getActiveAddonSlugs(tenant.id);
  if (!active.has("diskuze")) {
    return { error: NextResponse.json({ error: "Modul Diskuze není aktivní" }, { status: 403 }) };
  }
  return { tenant };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const g = await guard(tenantSlug);
  if ("error" in g) return g.error;

  const productId = Number(req.nextUrl.searchParams.get("product_id"));
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Neplatné product_id" }, { status: 400 });
  }

  await initAddonsDb();
  const questions = await query(
    `SELECT id, author_name, question, answer, created_at
     FROM commerce_product_questions
     WHERE tenant_id = $1 AND product_id = $2
     ORDER BY created_at DESC LIMIT 50`,
    [g.tenant.id, productId]
  );
  return NextResponse.json({ questions });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const g = await guard(tenantSlug);
  if ("error" in g) return g.error;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Neplatný požadavek" }, { status: 400 }); }
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Vyplňte jméno a otázku (min. 5 znaků)" }, { status: 400 });

  await initAddonsDb();
  const product = await query<{ id: number }>(
    "SELECT id FROM products WHERE tenant_id = $1 AND id = $2 AND status = 'active'",
    [g.tenant.id, parsed.data.product_id]
  );
  if (!product.length) return NextResponse.json({ error: "Produkt nenalezen" }, { status: 404 });

  await query(
    `INSERT INTO commerce_product_questions (tenant_id, product_id, author_name, question)
     VALUES ($1, $2, $3, $4)`,
    [g.tenant.id, parsed.data.product_id, parsed.data.author_name, parsed.data.question]
  );
  return NextResponse.json({ ok: true });
}

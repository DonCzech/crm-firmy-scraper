import { NextRequest, NextResponse } from "next/server";
import { getTenantBySlug, query } from "@/lib/db";
import { initCommerceDb } from "@/lib/commerce/schema";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getToken(tenantSlug: string): Promise<string> {
  const jar = await cookies();
  const key = `webero_wish_${tenantSlug}`;
  const existing = jar.get(key)?.value;
  if (existing) return existing;
  return crypto.randomUUID();
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ items: [] });

  const token = await getToken(tenantSlug);
  await initCommerceDb();

  const items = await query(
    `SELECT w.product_id, p.title, p.slug, p.brand,
            (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) as image_url,
            (SELECT price_cents FROM product_variants WHERE product_id = p.id AND is_default = true LIMIT 1) as price_cents,
            (SELECT id FROM product_variants WHERE product_id = p.id AND is_default = true LIMIT 1) as variant_id
     FROM commerce_wishlist w
     JOIN products p ON p.id = w.product_id
     WHERE w.tenant_id = $1 AND w.session_token = $2
     ORDER BY w.created_at DESC`,
    [tenant.id, token]
  );

  return Response.json({ items });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "not found" }, { status: 404 });

  const { productId, action } = await req.json();
  if (!productId) return Response.json({ error: "missing productId" }, { status: 400 });

  const token = await getToken(tenantSlug);
  await initCommerceDb();

  if (action === "remove") {
    await query(
      `DELETE FROM commerce_wishlist WHERE tenant_id = $1 AND session_token = $2 AND product_id = $3`,
      [tenant.id, token, productId]
    );
  } else {
    await query(
      `INSERT INTO commerce_wishlist (tenant_id, session_token, product_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (tenant_id, session_token, product_id) DO NOTHING`,
      [tenant.id, token, productId]
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(`webero_wish_${tenantSlug}`, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

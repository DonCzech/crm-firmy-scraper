import { NextRequest } from "next/server";
import { getTenantBySlug, query } from "@/lib/db";
import { initCommerceDb } from "@/lib/commerce/schema";
import { getActiveAddonSlugs, initAddonsDb } from "@/lib/commerce/addons";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ reviews: [] });

  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return Response.json({ reviews: [] });

  await initCommerceDb();
  await initAddonsDb(); // photo_url sloupec (modul fotorecenze)
  const reviews = await query(
    `SELECT id, author_name, rating, title, body, photo_url, created_at
     FROM commerce_reviews
     WHERE tenant_id = $1 AND product_id = $2 AND status = 'approved'
     ORDER BY created_at DESC LIMIT 50`,
    [tenant.id, Number(productId)]
  );

  const stats = await query<{ avg_rating: string; total: string }>(
    `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total
     FROM commerce_reviews
     WHERE tenant_id = $1 AND product_id = $2 AND status = 'approved'`,
    [tenant.id, Number(productId)]
  );

  return Response.json({
    reviews,
    avgRating: parseFloat(stats[0]?.avg_rating ?? "0"),
    totalReviews: parseInt(stats[0]?.total ?? "0"),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "not found" }, { status: 404 });

  const { productId, authorName, authorEmail, rating, title, body, photoUrl } = await req.json();
  if (!productId || !authorName || !rating || rating < 1 || rating > 5) {
    return Response.json({ error: "invalid data" }, { status: 400 });
  }

  await initCommerceDb();
  await initAddonsDb();
  // Foto jen s aktivním modulem fotorecenze + validní http(s) URL
  const active = await getActiveAddonSlugs(tenant.id);
  const photo = active.has("fotorecenze") && typeof photoUrl === "string" && /^https?:\/\//.test(photoUrl)
    ? photoUrl.slice(0, 1000)
    : null;
  await query(
    `INSERT INTO commerce_reviews (tenant_id, product_id, author_name, author_email, rating, title, body, photo_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [tenant.id, productId, authorName, authorEmail || null, rating, title || null, body || null, photo]
  );

  return Response.json({ ok: true, message: "Recenze byla odeslána ke schválení." });
}

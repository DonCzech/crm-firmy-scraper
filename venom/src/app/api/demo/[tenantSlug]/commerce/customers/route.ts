import { NextRequest } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { query } from "@/lib/db";

/** Webero Commerce — zákazníci (list s agregacemi objednávek). */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

interface CustomerRow {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  marketing_consent: boolean;
  created_at: string;
  order_count: string;
  total_spent_cents: string;
  last_order_at: string | null;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(sp.get("perPage") ?? "50", 10) || 50));
  const search = sp.get("search");

  const where: string[] = ["c.tenant_id = $1"];
  const values: unknown[] = [guard.tenant.id];
  if (search) {
    values.push(`%${search}%`);
    where.push(`(c.email ILIKE $${values.length} OR c.first_name ILIKE $${values.length} OR c.last_name ILIKE $${values.length} OR c.phone ILIKE $${values.length})`);
  }

  const totalRow = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM customers c WHERE ${where.join(" AND ")}`,
    values
  );

  values.push(perPage, (page - 1) * perPage);
  const items = await query<CustomerRow>(
    `SELECT c.id, c.email, c.first_name, c.last_name, c.phone, c.marketing_consent, c.created_at,
            COALESCE(o.order_count, 0)::text AS order_count,
            COALESCE(o.total_spent, 0)::text AS total_spent_cents,
            o.last_order_at
     FROM customers c
     LEFT JOIN LATERAL (
       SELECT COUNT(*) AS order_count,
              SUM(total_cents) FILTER (WHERE status != 'cancelled') AS total_spent,
              MAX(placed_at) AS last_order_at
       FROM orders WHERE customer_id = c.id AND tenant_id = c.tenant_id
     ) o ON true
     WHERE ${where.join(" AND ")}
     ORDER BY o.last_order_at DESC NULLS LAST, c.created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return Response.json({
    items: items.map((r) => ({
      ...r,
      order_count: parseInt(r.order_count, 10),
      total_spent_cents: parseInt(r.total_spent_cents, 10),
    })),
    total: parseInt(totalRow[0]?.count ?? "0", 10),
    page,
    perPage,
  });
}

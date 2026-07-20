import { NextRequest } from "next/server";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";
import { query } from "@/lib/db";

/**
 * Webero Commerce — dashboard data.
 * Období (dnes/7/30/365 dní) s meziobdobním srovnáním, denní řada tržeb
 * za 30 dní pro graf, poslední objednávky, nízký sklad, top produkty.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

interface PeriodRow { revenue: string; orders: string; margin_hint: string }

async function period(tid: number, fromDays: number, toDays: number): Promise<{ revenue: number; orders: number }> {
  const rows = await query<PeriodRow>(
    `SELECT
       COALESCE(SUM(total_cents) FILTER (WHERE payment_status = 'paid'), 0)::text AS revenue,
       COUNT(*)::text AS orders,
       '0' AS margin_hint
     FROM orders
     WHERE tenant_id = $1 AND status != 'cancelled'
       AND placed_at >= now() - ($2 || ' days')::interval
       AND placed_at < now() - ($3 || ' days')::interval`,
    [tid, String(fromDays), String(toDays)]
  );
  return { revenue: parseInt(rows[0]?.revenue ?? "0", 10), orders: parseInt(rows[0]?.orders ?? "0", 10) };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  const tid = guard.tenant.id;

  const [
    today, yesterday, d7, d7prev, d30, d30prev, y1,
    series, lowStock, latestOrders, topProducts, totals,
  ] = await Promise.all([
    period(tid, 1, 0), period(tid, 2, 1),
    period(tid, 7, 0), period(tid, 14, 7),
    period(tid, 30, 0), period(tid, 60, 30),
    period(tid, 365, 0),
    query<{ day: string; revenue: string; orders: string }>(
      `SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
              COALESCE(SUM(o.total_cents) FILTER (WHERE o.payment_status = 'paid'), 0)::text AS revenue,
              COUNT(o.id)::text AS orders
       FROM generate_series(date_trunc('day', now()) - INTERVAL '29 days', date_trunc('day', now()), '1 day') AS d(day)
       LEFT JOIN orders o ON o.tenant_id = $1 AND o.status != 'cancelled'
         AND date_trunc('day', o.placed_at) = d.day
       GROUP BY d.day ORDER BY d.day`,
      [tid]
    ),
    query<{ variant_id: number; product_title: string; variant_title: string | null; sku: string | null; stock_qty: number }>(
      `SELECT pv.id AS variant_id, p.title AS product_title, pv.title AS variant_title, pv.sku, pv.stock_qty
       FROM product_variants pv JOIN products p ON p.id = pv.product_id
       WHERE pv.tenant_id = $1 AND pv.track_stock = true AND pv.stock_qty <= 5 AND p.status = 'active'
       ORDER BY pv.stock_qty ASC LIMIT 8`,
      [tid]
    ),
    query<{ id: number; order_number: string; email: string; total_cents: number; status: string; payment_status: string; placed_at: string; shipping_method: string | null; payment_method: string | null }>(
      `SELECT id, order_number, email, total_cents, status, payment_status, placed_at, shipping_method, payment_method
       FROM orders WHERE tenant_id = $1 ORDER BY placed_at DESC LIMIT 6`,
      [tid]
    ),
    query<{ title: string; qty_sold: string; revenue_cents: string }>(
      `SELECT oi.title, SUM(oi.qty)::text AS qty_sold, SUM(oi.total_cents)::text AS revenue_cents
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE oi.tenant_id = $1 AND o.status != 'cancelled' AND o.placed_at > now() - INTERVAL '30 days'
       GROUP BY oi.title ORDER BY SUM(oi.total_cents) DESC LIMIT 5`,
      [tid]
    ),
    query<{ pending_payment: string; customers_total: string; products_active: string }>(
      `SELECT
        (SELECT COUNT(*) FROM orders o WHERE o.tenant_id = $1 AND o.payment_status = 'pending' AND o.status NOT IN ('cancelled'))::text AS pending_payment,
        (SELECT COUNT(*) FROM customers c WHERE c.tenant_id = $1)::text AS customers_total,
        (SELECT COUNT(*) FROM products p WHERE p.tenant_id = $1 AND p.status = 'active')::text AS products_active`,
      [tid]
    ),
  ]);

  return Response.json({
    currency: guard.shop.currency,
    periods: {
      today: { ...today, prev: yesterday },
      d7: { ...d7, prev: d7prev },
      d30: { ...d30, prev: d30prev },
      y1: { ...y1, prev: { revenue: 0, orders: 0 } },
    },
    series_30d: series.map((s) => ({
      day: s.day,
      revenue_cents: parseInt(s.revenue, 10),
      orders: parseInt(s.orders, 10),
    })),
    low_stock: lowStock,
    latest_orders: latestOrders,
    top_products: topProducts.map((t) => ({
      title: t.title,
      qty_sold: parseInt(t.qty_sold, 10),
      revenue_cents: parseInt(t.revenue_cents, 10),
    })),
    totals: {
      pending_payment: parseInt(totals[0]?.pending_payment ?? "0", 10),
      customers_total: parseInt(totals[0]?.customers_total ?? "0", 10),
      products_active: parseInt(totals[0]?.products_active ?? "0", 10),
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTenantBySlug, query } from "@/lib/db";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { checkRateLimit } from "@/lib/rate-limit";

/** Modul „Stav objednávky“ — veřejné dohledání objednávky podle čísla + e-mailu. */
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  order_number: z.string().trim().min(3).max(40),
  email: z.string().trim().email().max(200),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await ctx.params;
  const limited = checkRateLimit(req, "order-status", 10, 15 * 60_000, tenantSlug);
  if (!limited.ok) return limited.response;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return NextResponse.json({ error: "Tenant nenalezen" }, { status: 404 });

  const addons = await getActiveAddonSlugs(tenant.id);
  if (!addons.has("stav-objednavky")) {
    return NextResponse.json({ error: "Modul Stav objednávky není aktivní" }, { status: 403 });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Zadejte číslo objednávky a e-mail" }, { status: 400 });
  }

  const rows = await query<{
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total_cents: number;
    currency: string;
    shipping_method: string | null;
    payment_method: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT id, order_number, status, payment_status, total_cents, currency,
            shipping_method, payment_method, created_at, updated_at
     FROM orders
     WHERE tenant_id = $1 AND lower(order_number) = lower($2) AND lower(email) = lower($3)
     LIMIT 1`,
    [tenant.id, parsed.data.order_number, parsed.data.email]
  );
  const order = rows[0];
  if (!order) {
    return NextResponse.json(
      { error: "Objednávku jsme nenašli. Zkontrolujte číslo objednávky a e-mail." },
      { status: 404 }
    );
  }

  const items = await query<{ title: string; qty: number; total_cents: number }>(
    "SELECT title, qty, total_cents FROM order_items WHERE tenant_id = $1 AND order_id = $2 ORDER BY id",
    [tenant.id, order.id]
  );

  return NextResponse.json({
    order: {
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      total_cents: order.total_cents,
      currency: order.currency,
      shipping_method: order.shipping_method,
      payment_method: order.payment_method,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items,
    },
  });
}

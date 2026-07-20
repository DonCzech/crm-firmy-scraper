import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { requireCommerceAdmin } from "@/lib/commerce/api-guard";

export const dynamic = "force-dynamic";

interface OrderRow {
  id: number; order_number: string; status: string;
  customer_email: string; customer_name: string;
  total_cents: number; shipping_cents: number;
  items_count: string; created_at: string;
  shipping_city: string; shipping_zip: string;
  payment_method: string; shipping_method: string;
}

function escape(val: string | number | null): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const status = req.nextUrl.searchParams.get("status");
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  let where = "o.tenant_id = $1";
  const vals: (string | number)[] = [guard.tenant.id];
  let idx = 2;

  if (status) { where += ` AND o.status = $${idx++}`; vals.push(status); }
  if (from) { where += ` AND o.created_at >= $${idx++}`; vals.push(from); }
  if (to) { where += ` AND o.created_at <= $${idx++}`; vals.push(to); }

  const orders = await query<OrderRow>(
    `SELECT o.id, o.order_number, o.status,
            o.customer_email, COALESCE(o.shipping_name, '') as customer_name,
            o.total_cents, o.shipping_cents,
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count,
            o.created_at,
            COALESCE(o.shipping_city, '') as shipping_city,
            COALESCE(o.shipping_zip, '') as shipping_zip,
            COALESCE(o.payment_method, '') as payment_method,
            COALESCE(o.shipping_method, '') as shipping_method
     FROM orders o WHERE ${where}
     ORDER BY o.created_at DESC LIMIT 10000`,
    vals
  );

  const headers = ["Číslo objednávky", "Stav", "Zákazník", "E-mail", "Celkem (Kč)", "Doprava (Kč)", "Položek", "Platba", "Doprava", "Město", "PSČ", "Vytvořeno"];

  const rows = orders.map((o) => [
    o.order_number, o.status, o.customer_name, o.customer_email,
    (o.total_cents / 100).toFixed(2), (o.shipping_cents / 100).toFixed(2),
    o.items_count, o.payment_method, o.shipping_method,
    o.shipping_city, o.shipping_zip,
    new Date(o.created_at).toLocaleDateString("cs-CZ"),
  ].map(escape).join(","));

  const csv = "﻿" + [headers.join(","), ...rows].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="objednavky-${tenantSlug}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

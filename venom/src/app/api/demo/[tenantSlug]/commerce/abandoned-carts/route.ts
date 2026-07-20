import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCommerceAdmin, jsonError, parseJsonBody } from "@/lib/commerce/api-guard";
import { initCommerceDb } from "@/lib/commerce/schema";
import { query } from "@/lib/db";
import { getAbandonedCarts, getAbandonedCartStats, markReminderSent, buildAbandonedCartEmailHtml } from "@/lib/commerce/abandoned-cart";
import { getShopByTenantId, updateShop } from "@/lib/commerce/shop";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

interface RouteParams { params: Promise<{ tenantSlug: string }> }

interface AbandonedCartSettings { after_hours: number; max_reminders: number; coupon_code: string }

function readSettings(settings: unknown): AbandonedCartSettings {
  const s = (settings as { abandoned_cart?: Partial<AbandonedCartSettings> })?.abandoned_cart ?? {};
  return {
    after_hours: Number(s.after_hours) || 2,
    max_reminders: Number(s.max_reminders) || 3,
    coupon_code: typeof s.coupon_code === "string" ? s.coupon_code : "",
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  try {
    const shop = await getShopByTenantId(guard.tenant.id);
    const settings = readSettings(shop?.settings);
    const carts = await getAbandonedCarts(guard.tenant.id, {
      minAge: settings.after_hours,
      maxReminders: settings.max_reminders,
    });
    const stats = await getAbandonedCartStats(guard.tenant.id);
    return NextResponse.json({ carts, stats, settings });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Chyba" }, { status: 400 });
  }
}

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send"), cart_id: z.number().int().positive() }),
  z.object({
    action: z.literal("settings"),
    after_hours: z.number().int().min(1).max(72),
    max_reminders: z.number().int().min(1).max(3),
    coupon_code: z.string().max(40),
  }),
]);

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;
  await initCommerceDb();

  const parsed = bodySchema.safeParse(await parseJsonBody(req));
  if (!parsed.success) return jsonError("Neplatný požadavek");
  const body = parsed.data;

  const shop = await getShopByTenantId(guard.tenant.id);
  if (!shop) return jsonError("Obchod nenalezen", 404);

  if (body.action === "settings") {
    const merged = {
      ...((shop.settings ?? {}) as Record<string, unknown>),
      abandoned_cart: {
        after_hours: body.after_hours,
        max_reminders: body.max_reminders,
        coupon_code: body.coupon_code.trim().toUpperCase(),
      },
    };
    await updateShop(guard.tenant.id, { settings: merged });
    return NextResponse.json({ ok: true });
  }

  // action === "send" — ruční odeslání upomínky
  const carts = await query<{ id: number; token: string; email: string | null; reminder_count: number }>(
    `SELECT id, token, email, reminder_count FROM carts
     WHERE id = $1 AND tenant_id = $2 AND status = 'open'`,
    [body.cart_id, guard.tenant.id]
  );
  const cart = carts[0];
  if (!cart) return jsonError("Košík nenalezen", 404);
  if (!cart.email) return jsonError("Košík nemá zachycený e-mail");

  const items = await query<{ title: string; variant_title: string | null; qty: number; price_cents: number; image_url: string | null }>(
    `SELECT p.title, pv.title AS variant_title, ci.qty, pv.price_cents,
       (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position LIMIT 1) AS image_url
     FROM cart_items ci
     JOIN product_variants pv ON pv.id = ci.variant_id
     JOIN products p ON p.id = pv.product_id
     WHERE ci.cart_id = $1`,
    [cart.id]
  );
  if (!items.length) return jsonError("Košík je prázdný");

  const settings = readSettings(shop.settings);
  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: shop.currency, maximumFractionDigits: 0 }).format(cents / 100);
  const totalCents = items.reduce((sum, i) => sum + i.price_cents * i.qty, 0);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3015";
  const cartUrl = `${baseUrl}/api/demo/${tenantSlug}/shop/cart/restore?token=${encodeURIComponent(cart.token)}`;

  const html = buildAbandonedCartEmailHtml({
    shopName: shop.name,
    cartUrl,
    items: items.map((i) => ({
      title: i.title,
      variant_title: i.variant_title,
      qty: i.qty,
      price: fmt(i.price_cents * i.qty),
      image_url: i.image_url,
    })),
    totalFormatted: fmt(totalCents),
    couponCode: settings.coupon_code || undefined,
  });

  await sendEmail({
    to: cart.email,
    subject: `Zapomněli jste na svůj košík? — ${shop.name}`,
    html,
  });
  await markReminderSent(guard.tenant.id, cart.id);
  return NextResponse.json({ ok: true, reminder_count: cart.reminder_count + 1 });
}

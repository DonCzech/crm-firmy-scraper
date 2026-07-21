import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug } from "@/lib/db";
import { assertSameOrigin } from "@/lib/demo-auth";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { placeOrder } from "@/lib/commerce/checkout";
import { createGoPayShopPayment } from "@/lib/commerce/shop-payments";
import { sendOrderEmails } from "@/lib/commerce/emails";
import { isAddonActive } from "@/lib/commerce/addons";
import { recordConversion, AFF_COOKIE_PREFIX } from "@/lib/commerce/affiliates";
import { isSubscriptionLocked } from "@/lib/trial-gate";

/**
 * Public storefront API — odeslání objednávky.
 * GoPay → vrací redirect na platební bránu; převod/dobírka → potvrzení.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const BodySchema = z.object({
  email: z.string().email("Zadejte platný e-mail"),
  phone: z.string().max(30).optional(),
  name: z.string().min(2, "Vyplňte jméno").max(160),
  street: z.string().min(2, "Vyplňte ulici a číslo popisné").max(200),
  city: z.string().min(2, "Vyplňte město").max(120),
  zip: z.string().min(3, "Vyplňte PSČ").max(16),
  country: z.string().max(2).optional(),
  company: z.string().max(200).optional(),
  ico: z.string().max(16).optional(),
  dic: z.string().max(16).optional(),
  shipping_method: z.string().min(1, "Vyberte dopravu").max(60),
  payment_method: z.string().min(1, "Vyberte platbu").max(60),
  note: z.string().max(2000).optional(),
  coupon_code: z.string().max(40).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Potvrďte souhlas s obchodními podmínkami" }) }),
  marketing_consent: z.boolean().optional(),
});

// Rate limit: max 5 objednávek za 10 minut z jedné IP
const attempts = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 10 * 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json({ error: "Příliš mnoho pokusů. Zkuste to za pár minut." }, { status: 429 });
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });
  if (await isSubscriptionLocked(tenant.id)) {
    return Response.json({ error: "Obchod je momentálně nedostupný." }, { status: 403 });
  }
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return Response.json({ error: "Not found" }, { status: 404 });

  const cartToken = req.cookies.get(`webero_cart_${tenantSlug}`)?.value;
  if (!cartToken) return Response.json({ error: "Košík je prázdný" }, { status: 400 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Neplatný požadavek" }, { status: 400 }); }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Zkontrolujte formulář" }, { status: 400 });
  }

  const result = await placeOrder(tenant.id, cartToken, parsed.data);
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 });

  const { order, next } = result;

  // Potvrzovací e-maily (fire-and-forget)
  sendOrderEmails(order, shop, tenant.email).catch((e) => console.error("[checkout] emails failed:", e));

  // Modul provizni-system: konverze podle ref. cookie (fire-and-forget)
  const affCode = req.cookies.get(`${AFF_COOKIE_PREFIX}${tenantSlug}`)?.value;
  if (affCode) {
    isAddonActive(tenant.id, "provizni-system")
      .then((active) => (active ? recordConversion(tenant.id, affCode, order) : undefined))
      .catch((e) => console.error("[checkout] affiliate conversion failed:", e));
  }

  const confirmationUrl = `/demo/${tenantSlug}/obchod/objednavka/${order.order_number}?t=${order.public_token}`;

  const headers = new Headers({ "Content-Type": "application/json" });
  // Košík byl konvertován → smazat cookie
  headers.append("Set-Cookie", `webero_cart_${tenantSlug}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);

  if (next === "gopay") {
    const origin = req.nextUrl.origin;
    const gp = await createGoPayShopPayment(tenant.id, order, origin, tenantSlug);
    if ("error" in gp) {
      // Objednávka existuje; pošleme zákazníka na potvrzení s hláškou — platbu lze opakovat později (admin)
      return new Response(JSON.stringify({
        orderNumber: order.order_number,
        redirect: confirmationUrl,
        warning: gp.error,
      }), { status: 200, headers });
    }
    return new Response(JSON.stringify({ orderNumber: order.order_number, redirect: gp.gwUrl }), { status: 200, headers });
  }

  // Moduly paypal / splatky — demo platební brána (approve/cancel → payment_status)
  if (next === "demo-gateway") {
    const gatewayUrl = `/demo/${tenantSlug}/obchod/platba?order=${encodeURIComponent(order.order_number)}&t=${order.public_token}`;
    return new Response(JSON.stringify({ orderNumber: order.order_number, redirect: gatewayUrl }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ orderNumber: order.order_number, redirect: confirmationUrl }), { status: 200, headers });
}

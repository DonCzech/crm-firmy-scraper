import { NextRequest } from "next/server";
import { getTenantBySlug } from "@/lib/db";
import { isAddonActive } from "@/lib/commerce/addons";
import { setCartEmail } from "@/lib/commerce/abandoned-cart";

/** Modul opusteny-kosik — tiché zachycení e-mailu z pokladny k otevřenému košíku. */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Not found" }, { status: 404 });
  if (!(await isAddonActive(tenant.id, "opusteny-kosik"))) return Response.json({ ok: false });

  const token = req.cookies.get(`webero_cart_${tenantSlug}`)?.value ?? null;
  if (!token) return Response.json({ ok: false });

  const body = await req.json().catch(() => null) as { email?: string } | null;
  const email = body?.email?.trim();
  if (!email || !email.includes("@") || email.length > 200) return Response.json({ ok: false });

  await setCartEmail(tenant.id, token, email);
  return Response.json({ ok: true });
}

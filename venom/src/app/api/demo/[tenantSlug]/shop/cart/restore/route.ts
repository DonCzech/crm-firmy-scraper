import { NextRequest } from "next/server";
import { getTenantBySlug, query } from "@/lib/db";

/** Modul opusteny-kosik — obnovení košíku z upomínkového e-mailu (?token=...). */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const cartPath = `/demo/${tenantSlug}/obchod/kosik`;
  const redirectTo = new URL(cartPath, req.nextUrl.origin);

  const tenant = await getTenantBySlug(tenantSlug);
  const token = req.nextUrl.searchParams.get("token");
  if (!tenant || !token) return Response.redirect(redirectTo, 302);

  const rows = await query<{ id: number }>(
    `SELECT id FROM carts WHERE tenant_id = $1 AND token = $2 AND status = 'open'`,
    [tenant.id, token]
  );
  const headers = new Headers({ Location: redirectTo.toString() });
  if (rows.length) {
    headers.append(
      "Set-Cookie",
      `webero_cart_${tenantSlug}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`
    );
  }
  return new Response(null, { status: 302, headers });
}

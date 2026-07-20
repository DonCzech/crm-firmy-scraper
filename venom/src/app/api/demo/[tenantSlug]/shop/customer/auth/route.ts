import { NextRequest, NextResponse } from "next/server";
import { initCommerceDb } from "@/lib/commerce/schema";
import { query } from "@/lib/db";
import { registerCustomer, loginCustomer, verifyEmail, requestPasswordReset, resetPassword, createSessionToken } from "@/lib/commerce/customer-auth";

export const dynamic = "force-dynamic";

async function getTenantId(slug: string): Promise<number | null> {
  const rows = await query<{ id: number }>(
    `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`, [slug]
  );
  return rows?.[0]?.id ?? null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  await initCommerceDb();

  const tenantId = await getTenantId(tenantSlug);
  if (!tenantId) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "register": {
        const result = await registerCustomer(tenantId, {
          email: body.email, password: body.password,
          first_name: body.first_name ?? body.name, last_name: body.last_name, phone: body.phone,
        });
        return NextResponse.json(result);
      }
      case "login": {
        const result = await loginCustomer(tenantId, body.email, body.password);
        const token = createSessionToken(result.id, tenantId);
        return NextResponse.json({ customer: result, token });
      }
      case "verify_email": {
        const ok = await verifyEmail(tenantId, body.token);
        return NextResponse.json({ ok });
      }
      case "forgot_password": {
        const token = await requestPasswordReset(tenantId, body.email);
        return NextResponse.json({ ok: !!token });
      }
      case "reset_password": {
        const ok = await resetPassword(tenantId, body.token, body.password);
        return NextResponse.json({ ok });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

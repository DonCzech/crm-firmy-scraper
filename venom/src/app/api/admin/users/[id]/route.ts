import { NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { getUserById, query } from "@/lib/db";

function getAdmin(req: NextRequest) {
  const cookies = req.headers.get("cookie") ?? "";
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyToken(match[1]);
}

// GET /api/admin/users/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!getAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const userId = parseInt(id);
  if (isNaN(userId)) return Response.json({ error: "Invalid ID" }, { status: 400 });

  const user = await getUserById(userId);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const tenants = await query<{
    id: number; slug: string; email: string; status: string; plan: string;
    business_name: string | null; industry: string | null; created_at: string; updated_at: string;
    sub_status: string | null; trial_starts_at: string | null; trial_ends_at: string | null;
    paid_at: string | null; next_billing_at: string | null; price_czk: number | null;
    days_remaining: number | null;
  }>(
    `SELECT t.id, t.slug, t.email, t.status, t.plan, t.business_name, t.industry,
            t.created_at, t.updated_at,
            s.status AS sub_status, s.trial_starts_at, s.trial_ends_at,
            s.paid_at, s.next_billing_at, s.price_czk,
            GREATEST(0, CEIL(EXTRACT(EPOCH FROM (s.trial_ends_at - NOW())) / 86400))::int AS days_remaining
     FROM tenants t
     LEFT JOIN subscriptions s ON s.tenant_id = t.id
     WHERE t.user_account_id = $1
     ORDER BY t.created_at DESC`,
    [userId]
  );

  return Response.json({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    created_at: user.created_at,
    tenants,
  });
}

// PATCH /api/admin/users/[id] — admin can update user details
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!getAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const userId = parseInt(id);
  if (isNaN(userId)) return Response.json({ error: "Invalid ID" }, { status: 400 });

  const body = await request.json();
  const { name, phone } = body;

  await query(
    "UPDATE user_accounts SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = now() WHERE id = $3",
    [name ?? null, phone ?? null, userId]
  );

  return Response.json({ ok: true });
}

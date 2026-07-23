import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getUserById, getUserByEmail, query, queryOne } from "@/lib/db";
import { requireTenantAdmin, assertSameOrigin } from "@/lib/demo-auth";
import { signUserToken, USER_COOKIE_NAME, USER_COOKIE_MAX_AGE } from "@/lib/user-auth";
import { serializeAuthCookie } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Update the account (owner) login credentials for a tenant. Authorized by the
// tenant admin cookie; operates on the tenant's owning user_account.
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) {
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const { tenantSlug } = await params;
  const auth = await requireTenantAdmin(tenantSlug);
  if (!auth.ok || !auth.tenant) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerRow = await queryOne<{ user_account_id: number | null }>(
    "SELECT user_account_id FROM tenants WHERE id = $1",
    [auth.tenant.id]
  );
  const userId = ownerRow?.user_account_id;
  if (!userId) {
    return Response.json({ error: "Tenant nemá vlastníka účtu." }, { status: 400 });
  }
  const user = await getUserById(userId);
  if (!user) {
    return Response.json({ error: "Účet nenalezen." }, { status: 404 });
  }

  let body: { currentPassword?: string; newEmail?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  // Current password is always required to change credentials.
  const valid = body.currentPassword && (await bcrypt.compare(body.currentPassword, user.password_hash));
  if (!valid) {
    return Response.json({ error: "Současné heslo není správné." }, { status: 403 });
  }

  const newEmail = body.newEmail?.trim().toLowerCase();
  const newPassword = body.newPassword;

  if (!newEmail && !newPassword) {
    return Response.json({ error: "Není co měnit." }, { status: 400 });
  }

  // ── Email change ───────────────────────────────────────────────────────────
  let emailChanged = false;
  if (newEmail && newEmail !== user.email) {
    if (!EMAIL_RE.test(newEmail)) {
      return Response.json({ error: "Neplatný formát e-mailu." }, { status: 400 });
    }
    const clash = await getUserByEmail(newEmail);
    if (clash && clash.id !== user.id) {
      return Response.json({ error: "Tento e-mail už používá jiný účet." }, { status: 409 });
    }
    await query("UPDATE user_accounts SET email = $1, updated_at = now() WHERE id = $2", [newEmail, user.id]);
    // Keep tenant contact e-mails in sync for all tenants this user owns.
    await query("UPDATE tenants SET email = $1 WHERE user_account_id = $2", [newEmail, user.id]);
    emailChanged = true;
  }

  // ── Password change ──────────────────────────────────────────────────────────
  if (newPassword) {
    if (newPassword.length < 6) {
      return Response.json({ error: "Heslo musí mít alespoň 6 znaků." }, { status: 400 });
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await query("UPDATE user_accounts SET password_hash = $1, updated_at = now() WHERE id = $2", [hash, user.id]);
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  // Refresh the account JWT when the e-mail (part of the token) changed.
  if (emailChanged) {
    const token = signUserToken({ id: user.id, email: newEmail! });
    headers.append("Set-Cookie", serializeAuthCookie(USER_COOKIE_NAME, token, USER_COOKIE_MAX_AGE));
  }

  return new Response(
    JSON.stringify({ ok: true, email: emailChanged ? newEmail : user.email, passwordChanged: Boolean(newPassword) }),
    { status: 200, headers }
  );
}

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, query } from "@/lib/db";
import { signUserToken, USER_COOKIE_NAME, USER_COOKIE_MAX_AGE } from "@/lib/user-auth";
import { serializeAuthCookie } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/demo-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const limited = checkRateLimit(request, "account-login", 8, 15 * 60_000);
  if (!limited.ok) return limited.response;
  const { email, password } = await request.json();
  if (!email || !password) {
    return Response.json({ error: "Email a heslo jsou povinné" }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return Response.json({ error: "Neplatné přihlašovací údaje" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return Response.json({ error: "Neplatné přihlašovací údaje" }, { status: 401 });
  }

  const token = signUserToken({ id: user.id, email: user.email });
  const maxAge = USER_COOKIE_MAX_AGE;

  // Fetch all tenants for this user so we can set their access cookies too
  const tenants = await query<{ slug: string; access_token: string | null }>(
    "SELECT slug, access_token FROM tenants WHERE user_account_id = $1 AND access_token IS NOT NULL",
    [user.id]
  );

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  // JWT cookie
  headers.append(
    "Set-Cookie",
    serializeAuthCookie(USER_COOKIE_NAME, token, maxAge)
  );
  // Per-tenant access cookies (legacy editor auth)
  for (const t of tenants) {
    if (t.access_token) {
      headers.append(
        "Set-Cookie",
        serializeAuthCookie(`webero_access_${t.slug}`, t.access_token, maxAge)
      );
    }
  }

  return new Response(JSON.stringify({ ok: true, email: user.email, name: user.name }), {
    status: 200,
    headers,
  });
}

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUserAccount, initDb, query } from "@/lib/db";
import { signUserToken, USER_COOKIE_NAME, USER_COOKIE_MAX_AGE } from "@/lib/user-auth";
import { serializeAuthCookie } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/demo-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const limited = checkRateLimit(request, "account-register", 3, 60 * 60_000);
  if (!limited.ok) return limited.response;
  const { email, password, name } = await request.json();
  if (!email || !password || password.length < 6) {
    return Response.json({ error: "Email a heslo (min 6 znaků) jsou povinné" }, { status: 400 });
  }

  await initDb();
  const existing = await getUserByEmail(email);
  if (existing) {
    return Response.json({ error: "Účet s tímto e-mailem již existuje" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await createUserAccount(email, hash, name);

  // Link any tenants with matching email to this user account
  await query(
    "UPDATE tenants SET user_account_id = $1 WHERE email = $2 AND user_account_id IS NULL",
    [user.id, email]
  );

  const token = signUserToken({ id: user.id, email: user.email });
  return Response.json(
    { ok: true, email: user.email, name: user.name },
    { headers: { "Set-Cookie": serializeAuthCookie(USER_COOKIE_NAME, token, USER_COOKIE_MAX_AGE) } }
  );
}

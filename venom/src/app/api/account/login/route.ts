import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db";
import { signUserToken, USER_COOKIE_NAME, USER_COOKIE_MAX_AGE } from "@/lib/user-auth";

export async function POST(request: NextRequest) {
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
  return Response.json(
    { ok: true, email: user.email, name: user.name },
    { headers: { "Set-Cookie": `${USER_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${USER_COOKIE_MAX_AGE}; SameSite=Lax` } }
  );
}

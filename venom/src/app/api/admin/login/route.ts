import { NextRequest } from "next/server";
import { adminExists, getAdminByEmail } from "@/lib/db";
import { signToken, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/demo-auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { email, password } = await request.json();
  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }
  if (!(await adminExists())) {
    return Response.json({ error: "No admin account. Setup first." }, { status: 403 });
  }
  const admin = await getAdminByEmail(email);
  if (!admin) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = signToken({ id: admin.id, email: admin.email });
  return Response.json(
    { ok: true, email: admin.email },
    { headers: { "Set-Cookie": `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax` } }
  );
}

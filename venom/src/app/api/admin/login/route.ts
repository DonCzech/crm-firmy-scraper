import { NextRequest } from "next/server";
import { adminExists, getAdminByEmail } from "@/lib/db";
import { signToken, COOKIE_NAME, COOKIE_MAX_AGE, serializeAuthCookie } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/demo-auth";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const limited = checkRateLimit(request, "admin-login", 5, 15 * 60_000);
  if (!limited.ok) return limited.response;

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
    { headers: { "Set-Cookie": serializeAuthCookie(COOKIE_NAME, token, COOKIE_MAX_AGE) } }
  );
}

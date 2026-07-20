import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { updateAdminPassword, initDb } from "@/lib/db";
import { timingSafeEqual } from "crypto";
import { assertSameOrigin } from "@/lib/demo-auth";
import { checkRateLimit } from "@/lib/rate-limit";

// POST /api/admin/setup
// Body: { secret, email, password }
// secret must match SETUP_SECRET env var
export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const limited = checkRateLimit(request, "admin-setup", 3, 60 * 60_000);
  if (!limited.ok) return limited.response;

  const { secret, email, password } = await request.json();

  const setupSecret = process.env.SETUP_SECRET;
  const supplied = typeof secret === "string" ? Buffer.from(secret) : Buffer.alloc(0);
  const expected = setupSecret ? Buffer.from(setupSecret) : Buffer.alloc(1);
  if (!setupSecret || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!email || !password || password.length < 8) {
    return Response.json({ error: "Email and password (min 8 chars) required" }, { status: 400 });
  }

  await initDb();
  const hash = await bcrypt.hash(password, 12);
  await updateAdminPassword(email, hash);

  return Response.json({ ok: true, email });
}

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { updateAdminPassword, initDb } from "@/lib/db";

// POST /api/admin/setup
// Body: { secret, email, password }
// secret must match SETUP_SECRET env var
export async function POST(request: NextRequest) {
  const { secret, email, password } = await request.json();

  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret || secret !== setupSecret) {
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

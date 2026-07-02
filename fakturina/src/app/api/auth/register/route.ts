import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID, randomBytes } from "crypto";
import { query, initDb } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export async function POST(req: NextRequest) {
  await initDb();

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });
  }

  const { email, password, name } = parsed.data;
  const emailLower = email.toLowerCase().trim();

  const { rows: existing } = await query("SELECT id FROM fak_users WHERE email = $1", [emailLower]);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Tento e-mail je již registrován" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = randomUUID();

  await query(
    "INSERT INTO fak_users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)",
    [userId, emailLower, name, passwordHash]
  );

  await query(
    "INSERT INTO fak_subscriptions (id, user_id, plan, status) VALUES ($1, $2, 'free', 'active')",
    [randomUUID(), userId]
  );

  const token = randomBytes(32).toString("hex");
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  await query(
    "INSERT INTO fak_sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
    [token, userId, expires]
  );

  const res = NextResponse.json({ ok: true });
  res.cookies.set("fak_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

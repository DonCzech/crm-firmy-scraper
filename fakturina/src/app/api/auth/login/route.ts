import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { query, initDb } from "@/lib/db";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/security";
import { hashSessionToken } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(`login:${requestIp(req)}`, 10, 15 * 60_000);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Příliš mnoho pokusů. Zkuste to později." }, {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfter) },
    });
  }
  await initDb();

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const { rows } = await query("SELECT * FROM fak_users WHERE email = $1", [email.toLowerCase().trim()]);
  const user = rows[0];

  if (!user) {
    await bcrypt.hash("dummy", 12); // timing-safe
    return NextResponse.json({ error: "Nesprávný e-mail nebo heslo" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "Nesprávný e-mail nebo heslo" }, { status: 401 });
  }

  const token = randomBytes(32).toString("hex");
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  await query("INSERT INTO fak_sessions (token, user_id, expires_at) VALUES ($1, $2, $3)", [hashSessionToken(token), user.id, expires]);

  const res = NextResponse.json({ ok: true, name: user.name });
  res.cookies.set("fak_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

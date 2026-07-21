import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("fak_session")?.value;
  if (token) {
    await query("DELETE FROM fak_sessions WHERE token = $1 OR token = $2", [hashSessionToken(token), token]);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("fak_session", "", { maxAge: 0, path: "/" });
  return res;
}

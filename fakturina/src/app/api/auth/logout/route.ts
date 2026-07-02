import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("fak_session")?.value;
  if (token) {
    await query("DELETE FROM fak_sessions WHERE token = $1", [token]);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("fak_session", "", { maxAge: 0, path: "/" });
  return res;
}

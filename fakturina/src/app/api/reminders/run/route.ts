import { NextRequest, NextResponse } from "next/server";
import { requireSession, getUserCompany } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const limited = rateLimit(`reminders-run:${user.id}:${requestIp(req)}`, 3, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Příliš mnoho požadavků" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const secret = process.env.CRON_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!secret || !appUrl) {
    return NextResponse.json({ error: "Automatizace není nakonfigurována" }, { status: 503 });
  }

  const response = await fetch(new URL("/api/cron/reminders", appUrl), {
    headers: { authorization: `Bearer ${secret}` },
    cache: "no-store",
    signal: AbortSignal.timeout(120_000),
  });
  const payload = await response.json().catch(() => ({ error: "Neplatná odpověď automatiky" }));
  return NextResponse.json(payload, { status: response.status });
}

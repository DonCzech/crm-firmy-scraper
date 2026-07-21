import { NextRequest, NextResponse } from "next/server";
import { lookupCompanyByIco } from "@/lib/ares";
import { requireSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/security";

export async function GET(req: NextRequest) {
  const limited = rateLimit(`ares:${requestIp(req)}`, 30, 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Příliš mnoho požadavků" }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ico = req.nextUrl.searchParams.get("ico");
  if (!ico) return NextResponse.json({ error: "Chybí IČO" }, { status: 400 });

  const company = await lookupCompanyByIco(ico);
  if (!company) return NextResponse.json({ error: "Firma nenalezena" }, { status: 404 });

  return NextResponse.json(company);
}

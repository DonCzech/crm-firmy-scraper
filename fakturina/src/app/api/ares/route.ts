import { NextRequest, NextResponse } from "next/server";
import { lookupCompanyByIco } from "@/lib/ares";
import { requireSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ico = req.nextUrl.searchParams.get("ico");
  if (!ico) return NextResponse.json({ error: "Chybí IČO" }, { status: 400 });

  const company = await lookupCompanyByIco(ico);
  if (!company) return NextResponse.json({ error: "Firma nenalezena" }, { status: 404 });

  return NextResponse.json(company);
}

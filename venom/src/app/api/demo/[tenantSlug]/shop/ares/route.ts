import { NextRequest, NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/db";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";

/**
 * Modul „Načítání z ARES“ — proxy na oficiální REST API ARES (ares.gov.cz).
 * Vrací {company, dic, street, city, zip} pro předvyplnění pokladny.
 */
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return NextResponse.json({ error: "Tenant nenalezen" }, { status: 404 });

  const active = await getActiveAddonSlugs(tenant.id);
  if (!active.has("ares-ico")) {
    return NextResponse.json({ error: "Modul Načítání z ARES není aktivní" }, { status: 403 });
  }

  const ico = (req.nextUrl.searchParams.get("ico") ?? "").replace(/\s/g, "");
  if (!/^\d{8}$/.test(ico)) {
    return NextResponse.json({ error: "Zadejte platné 8místné IČO" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) }
    );
    if (res.status === 404) {
      return NextResponse.json({ error: "Firma s tímto IČO nebyla v ARES nalezena" }, { status: 404 });
    }
    if (!res.ok) throw new Error(`ARES ${res.status}`);
    const data = await res.json();

    const sidlo = data?.sidlo ?? {};
    const street = [sidlo.nazevUlice ?? sidlo.nazevCastiObce, [sidlo.cisloDomovni, sidlo.cisloOrientacni].filter(Boolean).join("/")]
      .filter(Boolean)
      .join(" ");

    return NextResponse.json({
      company: data?.obchodniJmeno ?? "",
      dic: data?.dic ? `CZ${String(data.dic).replace(/^CZ/i, "")}` : "",
      street,
      city: sidlo.nazevObce ?? "",
      zip: sidlo.psc ? String(sidlo.psc) : "",
    });
  } catch {
    return NextResponse.json({ error: "ARES momentálně neodpovídá, zkuste to později" }, { status: 502 });
  }
}

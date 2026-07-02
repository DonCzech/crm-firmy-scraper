import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/user-auth";
import { initDb, query } from "@/lib/db";
import dns from "node:dns/promises";

// Webero edge IP / CNAME target — update when you have a real edge
const WEBERO_IP = process.env.WEBERO_EDGE_IP || "1.2.3.4";
const WEBERO_CNAME = process.env.WEBERO_EDGE_CNAME || "edge.webero.co";

async function getTenantId(tenantSlug: string, userId: number): Promise<number | null> {
  const rows = await query<{ id: number }>(
    `SELECT t.id FROM tenants t
     JOIN user_accounts ua ON ua.id = t.user_account_id
     WHERE t.slug = $1 AND ua.id = $2 LIMIT 1`,
    [tenantSlug, userId]
  );
  return rows[0]?.id ?? null;
}

/** GET — list all custom domains for a tenant */
export async function GET(req: NextRequest) {
  await initDb();
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const tenantSlug = req.nextUrl.searchParams.get("tenantSlug") || "";
  if (!tenantSlug) return NextResponse.json({ error: "missing_tenant" }, { status: 400 });

  const tenantId = await getTenantId(tenantSlug, user.id);
  if (!tenantId) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const rows = await query(
    "SELECT id, domain, verified, www_redirect, created_at FROM domains WHERE tenant_id = $1 ORDER BY created_at",
    [tenantId]
  );

  return NextResponse.json({
    domains: rows,
    weberoUrl: `${tenantSlug}.webero.co`,
    dnsInstructions: { ip: WEBERO_IP, cname: WEBERO_CNAME },
  });
}

/** POST — add a custom domain */
export async function POST(req: NextRequest) {
  await initDb();
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { tenantSlug?: string; domain?: string };
  const tenantSlug = (body.tenantSlug ?? "").trim();
  const rawDomain = (body.domain ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

  if (!tenantSlug || !rawDomain) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  // Basic domain validation
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(rawDomain)) {
    return NextResponse.json({ error: "Neplatná doménová adresa" }, { status: 422 });
  }

  const tenantId = await getTenantId(tenantSlug, user.id);
  if (!tenantId) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Check not already taken by another tenant
  const existing = await query<{ tenant_id: number }>(
    "SELECT tenant_id FROM domains WHERE domain = $1 LIMIT 1",
    [rawDomain]
  );
  if (existing[0] && existing[0].tenant_id !== tenantId) {
    return NextResponse.json({ error: "Tato doména je již registrována jiným webem" }, { status: 409 });
  }

  await query(
    `INSERT INTO domains (tenant_id, domain, verified)
     VALUES ($1, $2, false)
     ON CONFLICT (domain) DO NOTHING`,
    [tenantId, rawDomain]
  );

  return NextResponse.json({ ok: true, domain: rawDomain });
}

/** DELETE — remove a domain */
export async function DELETE(req: NextRequest) {
  await initDb();
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const domainId = req.nextUrl.searchParams.get("id");
  const tenantSlug = req.nextUrl.searchParams.get("tenantSlug") || "";
  if (!domainId || !tenantSlug) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  const tenantId = await getTenantId(tenantSlug, user.id);
  if (!tenantId) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await query("DELETE FROM domains WHERE id = $1 AND tenant_id = $2", [domainId, tenantId]);
  return NextResponse.json({ ok: true });
}

/** PATCH — verify DNS records for a domain */
export async function PATCH(req: NextRequest) {
  await initDb();
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { tenantSlug?: string; domainId?: number };
  const tenantSlug = (body.tenantSlug ?? "").trim();
  const domainId = body.domainId;

  if (!tenantSlug || !domainId) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  const tenantId = await getTenantId(tenantSlug, user.id);
  if (!tenantId) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const rows = await query<{ domain: string }>(
    "SELECT domain FROM domains WHERE id = $1 AND tenant_id = $2 LIMIT 1",
    [domainId, tenantId]
  );
  const domain = rows[0]?.domain;
  if (!domain) return NextResponse.json({ error: "Doména nenalezena" }, { status: 404 });

  // DNS check: look for A record matching our IP, or CNAME to our edge
  let verified = false;
  const checks: { type: string; found: string[]; ok: boolean }[] = [];

  try {
    const aRecords = await dns.resolve4(domain).catch(() => [] as string[]);
    const aOk = aRecords.includes(WEBERO_IP);
    checks.push({ type: "A", found: aRecords, ok: aOk });
    if (aOk) verified = true;
  } catch { /* DNS failure = not verified */ }

  if (!verified) {
    try {
      const cnames = await dns.resolveCname(domain).catch(() => [] as string[]);
      const cnameOk = cnames.some((c) => c.replace(/\.$/, "") === WEBERO_CNAME.replace(/\.$/, ""));
      checks.push({ type: "CNAME", found: cnames, ok: cnameOk });
      if (cnameOk) verified = true;
    } catch { /* ignore */ }
  }

  if (verified) {
    await query(
      "UPDATE domains SET verified = true, updated_at = now() WHERE id = $1",
      [domainId]
    );
  }

  return NextResponse.json({ verified, checks, domain, weberoIp: WEBERO_IP, weberoCname: WEBERO_CNAME });
}

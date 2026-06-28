import { NextRequest } from "next/server";
import { z } from "zod";
import { query, queryOne, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { randomBytes, createHash } from "crypto";

/**
 * Custom domain management for a tenant.
 *
 * GET    list existing domains + verification status + DNS instructions
 * POST   add a new domain (creates a verification token, returns DNS records)
 * DELETE remove a domain by id
 * PATCH  re-check DNS via dns.resolveTxt(); flips verified=true when the
 *        expected token is found.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const PostSchema = z.object({
  domain: z.string()
    .trim()
    .toLowerCase()
    .min(3).max(120)
    .regex(/^([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i, "Neplatná doména"),
});

const DELETE_TARGET = "203.0.113.42"; // SETME — production edge IP
const VERIFICATION_RECORD_NAME = "_webero-verify";

function expectedToken(domain: string, tenantId: number, salt: string) {
  // Deterministic token (not secret) — derived from domain + tenant + a
  // server-side salt so the user can re-fetch instructions without a state
  // mismatch.
  return createHash("sha256").update(`${domain}|${tenantId}|${salt}`).digest("hex").slice(0, 32);
}

function dnsRecords(domain: string, tenantId: number, salt: string) {
  const apex = !domain.includes(".") || domain.split(".").length === 2;
  const token = expectedToken(domain, tenantId, salt);
  return [
    apex
      ? { name: "@", type: "A", value: DELETE_TARGET, ttl: 3600, purpose: "Spojí kořenovou doménu se serverem" }
      : { name: domain.split(".")[0], type: "CNAME", value: "edge.webero.co", ttl: 3600, purpose: "Spojí subdoménu se serverem" },
    { name: "www", type: "CNAME", value: "edge.webero.co", ttl: 3600, purpose: "Přesměrování z www" },
    { name: VERIFICATION_RECORD_NAME, type: "TXT", value: `webero-verify=${token}`, ttl: 300, purpose: "Ověřuje vlastnictví domény" },
  ];
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query<{
    id: number; domain: string; verified: boolean; verification_token: string | null;
    created_at: string; updated_at: string;
  }>(
    "SELECT id, domain, verified, verification_token, created_at, updated_at FROM domains WHERE tenant_id = $1 ORDER BY created_at",
    [tenant.id]
  );

  const salt = process.env.DOMAIN_VERIFY_SALT || "webero-dev-salt";
  const domains = rows.map((r) => ({
    id: r.id,
    domain: r.domain,
    verified: r.verified,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    instructions: dnsRecords(r.domain, tenant.id, salt),
  }));
  return Response.json({ domains });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const domain = parsed.data.domain;
  const dupe = await queryOne<{ id: number; tenant_id: number }>(
    "SELECT id, tenant_id FROM domains WHERE domain = $1",
    [domain]
  );
  if (dupe) {
    return Response.json(
      { error: dupe.tenant_id === tenant.id ? "Doména už je přidaná" : "Doména je obsazená jiným tenantem" },
      { status: 409 }
    );
  }

  const salt = process.env.DOMAIN_VERIFY_SALT || "webero-dev-salt";
  const token = expectedToken(domain, tenant.id, salt);
  const ins = await queryOne<{ id: number }>(
    `INSERT INTO domains (tenant_id, domain, verified, verification_token)
     VALUES ($1, $2, false, $3) RETURNING id`,
    [tenant.id, domain, token]
  );

  await auditLog("domain_added", {
    tenantId: tenant.id,
    targetType: "domain",
    targetId: String(ins?.id),
    extra: { domain },
  });

  return Response.json({
    ok: true,
    id: ins?.id,
    domain,
    verified: false,
    instructions: dnsRecords(domain, tenant.id, salt),
  });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const idSchema = z.object({ id: z.number().int().positive() });
  const parsed = idSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Missing id" }, { status: 400 });

  const row = await queryOne<{ id: number; domain: string; verification_token: string | null }>(
    "SELECT id, domain, verification_token FROM domains WHERE id = $1 AND tenant_id = $2",
    [parsed.data.id, tenant.id]
  );
  if (!row) return Response.json({ error: "Domain not found" }, { status: 404 });

  const salt = process.env.DOMAIN_VERIFY_SALT || "webero-dev-salt";
  const expected = expectedToken(row.domain, tenant.id, salt);

  let verified = false;
  let detail = "";
  try {
    const dns = await import("dns/promises");
    const txt = await dns.resolveTxt(`${VERIFICATION_RECORD_NAME}.${row.domain}`);
    const flat = txt.map((r) => r.join("")).flat();
    verified = flat.some((entry) => entry.replace(/^"|"$/g, "") === `webero-verify=${expected}`);
    detail = verified ? "TXT record nalezen." : `TXT records nalezeny, ale token nesedí (${flat.length} records).`;
  } catch (e) {
    detail = `DNS lookup selhal: ${(e as Error).message}. DNS propagace může trvat až 24 h.`;
  }

  if (verified) {
    await query("UPDATE domains SET verified = true, updated_at = now() WHERE id = $1", [row.id]);
    await auditLog("domain_verified", { tenantId: tenant.id, targetType: "domain", targetId: String(row.id), extra: { domain: row.domain } });
  }
  return Response.json({ verified, detail });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = parseInt(url.searchParams.get("id") ?? "", 10);
  if (isNaN(id)) return Response.json({ error: "Missing id" }, { status: 400 });

  const r = await query<{ id: number }>(
    "DELETE FROM domains WHERE id = $1 AND tenant_id = $2 RETURNING id",
    [id, tenant.id]
  );
  if (!r.length) return Response.json({ error: "Domain not found" }, { status: 404 });
  await auditLog("domain_removed", { tenantId: tenant.id, targetType: "domain", targetId: String(id) });
  return Response.json({ ok: true });
}

// Surface unused randomBytes by suppressing — kept for future token rotation.
void randomBytes;

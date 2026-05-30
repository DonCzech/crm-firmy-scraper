import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug, touchTenantActivity } from "@/lib/db";
import { assertSameOrigin } from "@/lib/demo-auth";

const BodySchema = z.object({
  accessToken: z.string().min(1),
});

// Simple in-memory brute-force protection (max 5 attempts per IP per 15 min)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkLoginRateLimit(ip)) {
    return Response.json({ error: "Příliš mnoho pokusů. Zkuste to za 15 minut." }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Neplatný přístupový kód." }, { status: 400 });

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !tenant.access_token) {
    return Response.json({ error: "Tenant nenalezen." }, { status: 404 });
  }

  // Constant-time comparison to prevent timing attacks
  const provided = Buffer.from(parsed.data.accessToken);
  const expected = Buffer.from(tenant.access_token);
  const valid =
    provided.length === expected.length &&
    Buffer.compare(provided, expected) === 0;

  if (!valid) {
    return Response.json({ error: "Nesprávný přístupový kód." }, { status: 401 });
  }

  // Record activity — resets the 60-day inactivity clock
  await touchTenantActivity(tenant.id);

  const cookieName = `venom_access_${tenantSlug}`;
  const maxAge = 60 * 60 * 24 * 30; // 30 days

  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append(
    "Set-Cookie",
    `${cookieName}=${tenant.access_token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`
  );

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug, query } from "@/lib/db";

const BodySchema = z.object({
  name: z.string().max(200).optional(),
  email: z.string().email().max(300),
  phone: z.string().max(50).optional(),
  message: z.string().max(5000).min(1),
  website: z.string().max(0).optional(), // honeypot — must be empty
});

// 3 submissions per IP per hour
const contactRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = contactRateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    contactRateLimit.set(ip, { count: 1, resetAt: now + 60 * 60_000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return Response.json({ error: "Příliš mnoho zpráv. Zkuste to za hodinu." }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Neplatná data formuláře." }, { status: 400 });
  }

  // Honeypot check
  if (parsed.data.website && parsed.data.website.length > 0) {
    // Silently succeed for bots
    return Response.json({ ok: true });
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") {
    return Response.json({ error: "Tenant nenalezen." }, { status: 404 });
  }

  await query(
    `INSERT INTO contact_submissions (tenant_id, name, email, phone, message, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [tenant.id, parsed.data.name ?? null, parsed.data.email, parsed.data.phone ?? null, parsed.data.message, ip]
  );

  return Response.json({ ok: true });
}

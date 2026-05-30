import { NextRequest } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/lib/demo-auth";
import { createDemoTenantFromTemplate } from "@/lib/tenant-factory";

const BodySchema = z.object({
  email: z.string().email("Neplatný e-mail"),
  templateKey: z.enum(["barber-01", "barber-02", "barber-03", "barber-04", "barber", "wellness", "lawyer", "astera", "cafe-01", "the-barber", "peak-cut", "fade-room", "hair-01", "hair-02", "hair-03", "hair-04", "beauty-01"]),
  industry: z.string().max(100).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(60).optional(),
});

// Simple in-memory rate limiter (per IP, max 3 registrations per hour)
const registrationAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = registrationAttempts.get(ip);

  if (!entry || entry.resetAt < now) {
    registrationAttempts.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }

  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Příliš mnoho registrací. Zkuste to znovu za hodinu." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Neplatná data" }, { status: 400 });
  }

  try {
    const result = await createDemoTenantFromTemplate({
      email: parsed.data.email,
      templateKey: parsed.data.templateKey,
      industry: parsed.data.industry,
      slug: parsed.data.slug,
    });

    const cookieName = `venom_access_${result.slug}`;
    const cookieValue = result.accessToken;
    const maxAge = 60 * 60 * 24 * 30; // 30 days

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.append(
      "Set-Cookie",
      `${cookieName}=${cookieValue}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`
    );

    return new Response(JSON.stringify(result), { status: 201, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[onboarding] createDemoTenant failed:", message, err);
    // Don't leak internal DB errors to client
    return Response.json(
      { error: "Nepodařilo se vytvořit demo web. Zkuste to znovu." },
      { status: 500 }
    );
  }
}

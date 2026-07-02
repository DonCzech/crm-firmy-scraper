import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { assertSameOrigin } from "@/lib/demo-auth";
import { createDemoTenantFromTemplate } from "@/lib/tenant-factory";
import { getTemplate } from "@/lib/templates";
import { seedDemoMedia } from "@/lib/seed-demo-media";
import { getUserByEmail, createUserAccount, createSubscription, initDb, query } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { signUserToken, USER_COOKIE_NAME, USER_COOKIE_MAX_AGE } from "@/lib/user-auth";

const BodySchema = z.object({
  email: z.string().email("Neplatný e-mail"),
  templateKey: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Neplatný klíč šablony"),
  industry: z.string().max(100).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(60).optional(),
  name: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků").max(128).optional(),
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
  try { body = await req.json(); } catch {
    return Response.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Neplatná data" }, { status: 400 });
  }

  const tpl = await getTemplate(parsed.data.templateKey);
  if (!tpl) {
    return Response.json({ error: "Šablona neexistuje nebo není dostupná." }, { status: 400 });
  }

  await initDb();

  try {
    const result = await createDemoTenantFromTemplate({
      email: parsed.data.email,
      templateKey: parsed.data.templateKey,
      industry: parsed.data.industry,
      slug: parsed.data.slug,
    });

    seedDemoMedia(result.tenantId).catch((e) =>
      console.error("[onboarding] seedDemoMedia failed:", e)
    );

    const maxAge = 60 * 60 * 24 * 30;
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    // Set per-tenant access token cookie (legacy editor auth)
    headers.append(
      "Set-Cookie",
      `webero_access_${result.slug}=${result.accessToken}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`
    );

    // Create / link user account so billing JWT works
    const password = parsed.data.password;
    if (password) {
      const existing = await getUserByEmail(parsed.data.email);
      let userId: number;

      if (existing) {
        userId = existing.id;
      } else {
        const hash = await bcrypt.hash(password, 12);
        const user = await createUserAccount(parsed.data.email, hash, parsed.data.name ?? "");
        userId = user.id;
      }

      // Link tenant to this user account
      await query(
        "UPDATE tenants SET user_account_id = $1 WHERE id = $2 AND user_account_id IS NULL",
        [userId, result.tenantId]
      );

      // Ensure subscription row exists (trial by default)
      await createSubscription(result.tenantId, userId).catch(() => {/* already exists */});

      // Send welcome email (fire-and-forget, don't fail registration on email error)
      sendWelcomeEmail({ to: parsed.data.email, name: parsed.data.name ?? "", slug: result.slug }).catch((e) =>
        console.error("[onboarding] welcome email failed:", e)
      );

      const jwt = signUserToken({ id: userId, email: parsed.data.email });
      headers.append(
        "Set-Cookie",
        `${USER_COOKIE_NAME}=${jwt}; HttpOnly; Path=/; Max-Age=${USER_COOKIE_MAX_AGE}; SameSite=Lax`
      );
    }

    return new Response(JSON.stringify(result), { status: 201, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[onboarding] createDemoTenant failed:", message, err);
    return Response.json(
      { error: "Nepodařilo se vytvořit demo web. Zkuste to znovu." },
      { status: 500 }
    );
  }
}

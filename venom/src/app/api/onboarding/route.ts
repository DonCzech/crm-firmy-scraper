import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { assertSameOrigin } from "@/lib/demo-auth";
import { createDemoTenantFromTemplate, DuplicateOnboardingEmailError } from "@/lib/tenant-factory";
import { getTemplate } from "@/lib/templates";
import { seedDemoMedia } from "@/lib/seed-demo-media";
import { getUserByEmail, initDb } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { signUserToken, USER_COOKIE_NAME, USER_COOKIE_MAX_AGE } from "@/lib/user-auth";
import { grantBonusCredits } from "@/lib/ai-designer/credits";
import { BUILDER_WELCOME_BONUS } from "@/lib/ai-designer/pricing";

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email("Neplatný e-mail"),
  // mode "builder" = „Postavit cokoliv" (AI Builder): tenant vzniká z prázdné
  // šablony blank-01 a uživatel jde rovnou do fullscreen AI Builderu.
  mode: z.enum(["template", "builder"]).default("template"),
  templateKey: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Neplatný klíč šablony").optional(),
  industry: z.string().max(100).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(60).optional(),
  name: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků").max(128),
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

  // Builder mode vždy startuje z prázdného plátna — klient klíč šablony neposílá
  // (a kdyby poslal, server ho přepíše; blank-01 je jediný povolený základ).
  const isBuilder = parsed.data.mode === "builder";
  const templateKey = isBuilder ? "blank-01" : parsed.data.templateKey;
  if (!templateKey) {
    return Response.json({ error: "Chybí klíč šablony." }, { status: 400 });
  }

  const tpl = await getTemplate(templateKey);
  if (!tpl) {
    return Response.json({ error: "Šablona neexistuje nebo není dostupná." }, { status: 400 });
  }

  await initDb();

  // Fast rejection for the normal repeat-registration case. The factory also
  // performs this check under an advisory transaction lock for race safety.
  const existing = await getUserByEmail(parsed.data.email);
  if (existing) {
    return Response.json(
      { error: "Účet s tímto e-mailem už existuje. Přihlaste se." },
      { status: 409 },
    );
  }

  try {
    const hash = await bcrypt.hash(parsed.data.password, 12);
    const result = await createDemoTenantFromTemplate({
      email: parsed.data.email,
      templateKey,
      industry: parsed.data.industry,
      slug: parsed.data.slug,
    }, {
      email: parsed.data.email,
      passwordHash: hash,
      name: parsed.data.name,
    });

    seedDemoMedia(result.tenantId).catch((e) =>
      console.error("[onboarding] seedDemoMedia failed:", e)
    );

    // AI Builder: startovní bonus, ať první komplexní build (30 kr.) projde
    // zdarma i s rezervou na iterace. Idempotentní (per-tenant, per-note).
    if (isBuilder) {
      await grantBonusCredits(
        result.tenantId,
        BUILDER_WELCOME_BONUS,
        "Startovní bonus AI Builderu"
      ).catch((e) => console.error("[onboarding] builder bonus failed:", e));
    }

    const maxAge = 60 * 60 * 24 * 30;
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    // Set per-tenant access token cookie (legacy editor auth)
    headers.append(
      "Set-Cookie",
      `webero_access_${result.slug}=${result.accessToken}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`
    );

    // Send welcome email (fire-and-forget, don't fail registration on email error)
    sendWelcomeEmail({ to: parsed.data.email, name: parsed.data.name ?? "", slug: result.slug }).catch((e) =>
      console.error("[onboarding] welcome email failed:", e)
    );

    if (!result.userAccountId) throw new Error("Onboarding owner account was not created");
    const jwt = signUserToken({ id: result.userAccountId, email: parsed.data.email });
    headers.append(
      "Set-Cookie",
      `${USER_COOKIE_NAME}=${jwt}; HttpOnly; Path=/; Max-Age=${USER_COOKIE_MAX_AGE}; SameSite=Lax`
    );

    return new Response(
      JSON.stringify({
        ...result,
        // AI Builder tenant přistává ve Studiu rovnou v builder režimu
        builderUrl: isBuilder ? `/demo/${result.slug}/admin?builder=1` : undefined,
      }),
      { status: 201, headers }
    );
  } catch (err) {
    if (err instanceof DuplicateOnboardingEmailError) {
      return Response.json(
        { error: "Účet s tímto e-mailem už existuje. Přihlaste se." },
        { status: 409 },
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("[onboarding] createDemoTenant failed:", message, err);
    return Response.json(
      { error: "Nepodařilo se vytvořit demo web. Zkuste to znovu." },
      { status: 500 }
    );
  }
}

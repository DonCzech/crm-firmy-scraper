import { NextRequest } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/lib/demo-auth";
import { getUserFromRequest } from "@/lib/user-auth";
import { createDemoTenantFromTemplate } from "@/lib/tenant-factory";
import { getTemplate } from "@/lib/templates";
import { seedDemoMedia } from "@/lib/seed-demo-media";
import { getUserById, initDb, queryOne } from "@/lib/db";
import { grantBonusCredits } from "@/lib/ai-designer/credits";
import { BUILDER_WELCOME_BONUS } from "@/lib/ai-designer/pricing";

/**
 * POST /api/account/tenants — další projekt pod existujícím účtem.
 *
 * Přihlášený uživatel (webero_user_token) si zakládá nový web / e-shop /
 * AI Builder projekt. Vše zůstává pod jedním účtem (user_account_id) —
 * onboarding /api/onboarding je jen pro první registraci (duplicitní e-mail
 * tam správně končí 409).
 */

const BodySchema = z.object({
  mode: z.enum(["template", "builder"]).default("template"),
  templateKey: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Neplatný klíč šablony").optional(),
  industry: z.string().max(100).optional(),
});

/** Strop projektů na účet — pojistka proti zneužití demo infrastruktury. */
const MAX_TENANTS_PER_ACCOUNT = 10;

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const payload = getUserFromRequest(req);
  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await initDb();
  const user = await getUserById(payload.id);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Neplatný JSON" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Neplatná data" }, { status: 400 });
  }

  const isBuilder = parsed.data.mode === "builder";
  const templateKey = isBuilder ? "blank-01" : parsed.data.templateKey;
  if (!templateKey) {
    return Response.json({ error: "Chybí klíč šablony." }, { status: 400 });
  }

  const tpl = await getTemplate(templateKey);
  if (!tpl) {
    return Response.json({ error: "Šablona neexistuje nebo není dostupná." }, { status: 400 });
  }

  const countRow = await queryOne<{ n: string }>(
    "SELECT COUNT(*)::text AS n FROM tenants WHERE user_account_id = $1",
    [user.id]
  );
  if (Number(countRow?.n ?? 0) >= MAX_TENANTS_PER_ACCOUNT) {
    return Response.json(
      { error: `Dosáhli jste limitu ${MAX_TENANTS_PER_ACCOUNT} projektů na účet. Kontaktujte podporu.` },
      { status: 403 }
    );
  }

  try {
    const result = await createDemoTenantFromTemplate(
      {
        email: user.email,
        templateKey,
        industry: parsed.data.industry,
      },
      undefined,
      { existingUserAccountId: user.id }
    );

    seedDemoMedia(result.tenantId).catch((e) =>
      console.error("[account/tenants] seedDemoMedia failed:", e)
    );

    if (isBuilder) {
      await grantBonusCredits(
        result.tenantId,
        BUILDER_WELCOME_BONUS,
        "Startovní bonus AI Builderu"
      ).catch((e) => console.error("[account/tenants] builder bonus failed:", e));
    }

    const maxAge = 60 * 60 * 24 * 30;
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.append(
      "Set-Cookie",
      `webero_access_${result.slug}=${result.accessToken}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`
    );

    return new Response(
      JSON.stringify({
        ...result,
        builderUrl: isBuilder ? `/demo/${result.slug}/admin?builder=1` : undefined,
      }),
      { status: 201, headers }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[account/tenants] create failed:", message, err);
    return Response.json(
      { error: "Nepodařilo se vytvořit nový projekt. Zkuste to znovu." },
      { status: 500 }
    );
  }
}

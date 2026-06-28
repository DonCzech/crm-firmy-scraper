import { NextRequest } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { query, queryOne, auditLog } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";

interface CaptureResult {
  preview: boolean;
  desktopFull: boolean;
  mobileHero: boolean;
  mobileFull: boolean;
  sections: number;
  errors: string[];
}

export async function captureTemplateScreenshot(
  templateKey: string,
  tenantSlug: string
): Promise<CaptureResult> {
  const result: CaptureResult = {
    preview: false,
    desktopFull: false,
    mobileHero: false,
    mobileFull: false,
    sections: 0,
    errors: [],
  };

  let browser: Awaited<ReturnType<typeof import("playwright-core").chromium.launch>> | null = null;
  try {
    const { chromium } = await import("playwright-core");
    const executablePath =
      process.env.CHROME_EXECUTABLE_PATH ??
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3015";

    browser = await chromium.launch({ executablePath, headless: true });

    const outDir = path.join(process.cwd(), "public", "templates", templateKey);
    const showcaseDir = path.join(outDir, "showcase");
    await fs.mkdir(outDir, { recursive: true });
    await fs.mkdir(showcaseDir, { recursive: true });

    // STEP 1 — preview.png (homepage/catalog thumbnail). Highest priority,
    // isolated try so a later failure can't wipe it.
    try {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`${base}/demo/${tenantSlug}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.screenshot({
        path: path.join(outDir, "preview.png"),
        clip: { x: 0, y: 0, width: 1280, height: 800 },
      });
      await page.screenshot({
        path: path.join(showcaseDir, "desktop-hero.png"),
        clip: { x: 0, y: 0, width: 1280, height: 800 },
      });
      result.preview = true;

      // Desktop full page — best-effort
      try {
        await page.screenshot({
          path: path.join(showcaseDir, "desktop-full.png"),
          fullPage: true,
        });
        result.desktopFull = true;
      } catch (err) {
        result.errors.push(`desktop-full: ${(err as Error).message}`);
      }

      // Section walk — best-effort
      try {
        const totalHeight = await page.evaluate(() => document.body.scrollHeight);
        const stops = [0.25, 0.5, 0.78];
        for (let i = 0; i < stops.length; i++) {
          const y = Math.max(0, Math.floor(totalHeight * stops[i]!) - 100);
          await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
          await page.waitForTimeout(400);
          await page.screenshot({
            path: path.join(showcaseDir, `section-${i + 1}.png`),
            clip: { x: 0, y: 0, width: 1280, height: 800 },
          });
          result.sections++;
        }
      } catch (err) {
        result.errors.push(`sections: ${(err as Error).message}`);
      }

      await page.close();
    } catch (err) {
      result.errors.push(`preview: ${(err as Error).message}`);
    }

    // STEP 2 — mobile shots (separate page, doesn't affect preview success)
    try {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${base}/demo/${tenantSlug}`, { waitUntil: "networkidle", timeout: 30000 });
      try {
        await page.screenshot({
          path: path.join(showcaseDir, "mobile-hero.png"),
          clip: { x: 0, y: 0, width: 390, height: 844 },
        });
        result.mobileHero = true;
      } catch (err) {
        result.errors.push(`mobile-hero: ${(err as Error).message}`);
      }
      try {
        await page.screenshot({
          path: path.join(showcaseDir, "mobile-full.png"),
          fullPage: true,
        });
        result.mobileFull = true;
      } catch (err) {
        result.errors.push(`mobile-full: ${(err as Error).message}`);
      }
      await page.close();
    } catch (err) {
      result.errors.push(`mobile-goto: ${(err as Error).message}`);
    }
  } catch (err) {
    result.errors.push(`launch: ${(err as Error).message}`);
    console.error(`[screenshot] failed for ${templateKey}:`, err instanceof Error ? err.message : err);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        /* ignore */
      }
    }
  }
  return result;
}

interface RouteParams { params: Promise<{ key: string }> }

async function requireAdmin() {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return { ok: false, email: undefined as string | undefined };
  const payload = verifyToken(token) as { email?: string } | null;
  if (!payload) return { ok: false, email: undefined as string | undefined };
  return { ok: true, email: payload.email };
}

const PatchBodySchema = z.object({
  review_status: z.enum(["pending", "reviewed", "approved", "blocked"]).optional(),
  review_notes: z.string().max(4000).nullable().optional(),
  assigned_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  review_checklist: z.record(z.unknown()).optional(),
});

/**
 * PATCH /api/admin/template-queue/:key
 *
 * Updates review state. Setting status='approved' also revalidates the public
 * catalog routes (/sablony + /) so the new card appears immediately.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { ok, email } = await requireAdmin();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;
  const body = await req.json().catch(() => null);
  const parsed = PatchBodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const tplRow = await queryOne<{ id: number; review_status: string }>(
    "SELECT id, review_status FROM templates WHERE key = $1",
    [key]
  );
  if (!tplRow) return Response.json({ error: "Template not found" }, { status: 404 });

  const updates: string[] = ["updated_at = now()"];
  const values: unknown[] = [];

  for (const [k, v] of Object.entries(parsed.data)) {
    if (v === undefined) continue;
    if (k === "review_checklist") {
      values.push(JSON.stringify(v));
      updates.push(`review_checklist = $${values.length}::jsonb`);
    } else {
      values.push(v);
      updates.push(`${k} = $${values.length}`);
    }
  }

  // Auto-stamp reviewed_at + reviewer when status flips
  if (parsed.data.review_status && parsed.data.review_status !== tplRow.review_status) {
    values.push(email ?? null);
    updates.push(`reviewer_email = $${values.length}`);
    updates.push(`reviewed_at = now()`);
  }

  values.push(tplRow.id);
  await query(
    `UPDATE templates SET ${updates.join(", ")} WHERE id = $${values.length}`,
    values
  );

  await auditLog("template_queue_updated", {
    actorEmail: email,
    targetType: "template",
    targetId: key,
    extra: parsed.data as Record<string, unknown>,
  });

  // Approved → publish to homepage + /sablony catalog + showcase
  if (parsed.data.review_status === "approved") {
    revalidatePath("/");
    revalidatePath("/sablony");
    revalidatePath("/ukazka-sablon");
    revalidatePath(`/ukazka-sablon/${key}`);
  }

  return Response.json({ ok: true });
}

/**
 * POST /api/admin/template-queue/:key/publish
 *
 * Convenience endpoint: marks approved + revalidates catalog routes. Used by
 * the "Publikovat na homepage" button in admin queue UI.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { ok, email } = await requireAdmin();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { key } = await params;

  const tplRow = await queryOne<{ id: number }>(
    "SELECT id FROM templates WHERE key = $1",
    [key]
  );
  if (!tplRow) return Response.json({ error: "Template not found" }, { status: 404 });

  await query(
    `UPDATE templates
        SET review_status = 'approved',
            reviewer_email = $1,
            reviewed_at = now(),
            updated_at = now()
      WHERE id = $2`,
    [email ?? null, tplRow.id]
  );

  await auditLog("template_published_to_catalog", {
    actorEmail: email,
    targetType: "template",
    targetId: key,
  });

  // Take screenshot of demo tenant and save as preview.png
  const tenant = await queryOne<{ slug: string }>(
    `SELECT t.slug FROM tenants t
       JOIN sections s ON s.tenant_id = t.id AND s.content_source = 'v2'
      WHERE t.template_id = $1
      ORDER BY t.id LIMIT 1`,
    [tplRow.id]
  ).catch(() => null);

  let screenshot: Awaited<ReturnType<typeof captureTemplateScreenshot>> | null = null;
  if (tenant) {
    screenshot = await captureTemplateScreenshot(key, tenant.slug);
  }

  revalidatePath("/");
  revalidatePath("/sablony");
  revalidatePath("/ukazka-sablon");
  revalidatePath(`/ukazka-sablon/${key}`);

  return Response.json({
    ok: true,
    key,
    status: "approved",
    tenantFound: !!tenant,
    screenshot,
  });
}

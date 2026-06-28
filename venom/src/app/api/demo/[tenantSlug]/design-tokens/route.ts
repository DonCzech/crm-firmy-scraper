import { NextRequest } from "next/server";
import { z } from "zod";
import { query, queryOne, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";

/**
 * GET  /api/demo/<slug>/design-tokens — return the current per-tenant tokens.
 * POST /api/demo/<slug>/design-tokens — patch the global design tokens (brand
 *      colors, fonts, radius). Tokens are mirrored to every section's
 *      `settings.designTokens` so the existing render path picks them up
 *      without a resolver change.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const Hex = z.string().regex(HEX, "Neplatná barva (HEX)");
const Font = z.string().min(2).max(120);

/**
 * Strict validators for the core 11 brand tokens. Studio extended-design
 * panels save many additional keys (header.padding.h, typography.baseSize, …);
 * those are accepted as arbitrary string/number/boolean values via the
 * permissive passthrough below.
 */
const PatchSchema = z.object({
  colorPrimary: Hex.optional(),
  colorSecondary: Hex.optional(),
  colorAccent: Hex.optional(),
  colorBackground: Hex.optional(),
  colorSurface: Hex.optional(),
  colorText: Hex.optional(),
  colorTextMuted: Hex.optional(),
  colorBorder: Hex.optional(),
  fontHeading: Font.optional(),
  fontBody: Font.optional(),
  borderRadius: z.string().regex(/^\d+(px|rem)$/).optional(),
}).catchall(z.union([z.string().max(400), z.number(), z.boolean(), z.null()]));

const TOKEN_KEYS = [
  "colorPrimary", "colorSecondary", "colorAccent", "colorBackground",
  "colorSurface", "colorText", "colorTextMuted", "colorBorder",
  "fontHeading", "fontBody", "borderRadius",
] as const;

const DEFAULTS: Record<string, string> = {
  colorPrimary: "#6366f1",
  colorSecondary: "#4f46e5",
  colorAccent: "#6366f1",
  colorBackground: "#ffffff",
  colorSurface: "#f9fafb",
  colorText: "#111827",
  colorTextMuted: "#6b7280",
  colorBorder: "#e5e7eb",
  fontHeading: "Inter, sans-serif",
  fontBody: "Inter, sans-serif",
  borderRadius: "8px",
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const row = await queryOne<{ design_tokens: Record<string, string> | null }>(
    `SELECT (settings -> 'designTokens')::jsonb AS design_tokens
       FROM sections
      WHERE tenant_id = $1
      ORDER BY id ASC
      LIMIT 1`,
    [tenant.id]
  );
  const tokens = { ...DEFAULTS, ...(row?.design_tokens ?? {}) };
  return Response.json({ tokens });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const patch = parsed.data as Record<string, unknown>;
  // Accept both the strict 11 brand keys and any extended design key.
  const patchKeys = Object.keys(patch).filter((k) => patch[k] !== undefined);
  if (patchKeys.length === 0) {
    return Response.json({ ok: true, updated: 0 });
  }

  // Read current tokens from any one section to compute the merged result.
  const row = await queryOne<{ design_tokens: Record<string, string> | null }>(
    `SELECT (settings -> 'designTokens')::jsonb AS design_tokens
       FROM sections
      WHERE tenant_id = $1
      ORDER BY id ASC
      LIMIT 1`,
    [tenant.id]
  );
  const merged = { ...DEFAULTS, ...(row?.design_tokens ?? {}), ...patch };

  // Mirror to every section's settings.designTokens so both editor and public
  // view (each reads sections[0].settings.designTokens) reflect immediately.
  const upd = await query<{ count: string }>(
    `WITH updated AS (
       UPDATE sections
          SET settings = jsonb_set(
                COALESCE(settings, '{}'::jsonb),
                '{designTokens}',
                $2::jsonb,
                true
              ),
              updated_at = now()
        WHERE tenant_id = $1
        RETURNING id
     )
     SELECT COUNT(*)::text AS count FROM updated`,
    [tenant.id, JSON.stringify(merged)]
  );

  await auditLog("design_tokens_updated", {
    tenantId: tenant.id,
    targetType: "tenant",
    targetId: String(tenant.id),
    extra: { changed: patchKeys, merged },
  });

  return Response.json({ ok: true, updated: parseInt(upd[0]?.count ?? "0", 10), tokens: merged });
}

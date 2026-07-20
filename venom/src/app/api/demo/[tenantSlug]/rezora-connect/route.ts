import { NextRequest } from "next/server";
import { requireTenantAdmin, assertSameOrigin } from "@/lib/demo-auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Bezpečné propojení tenantího webu s rezervačním účtem v Rezoře.
 *
 * Majitel si v Rezoře vygeneruje párovací klíč (`rz_…`) a zadá ho zde. Tento
 * route ho ověří SERVEROVĚ proti Rezoře (`/api/connect/verify`) a při úspěchu
 * uloží do rezora-widget sekcí jen veřejný `providerSlug`. Klíč se nikdy
 * neukládá do DB ani neposílá do prohlížeče návštěvníka — do HTML jde pouze
 * slug, který je stejně veřejný. Tím se z „napiš si slug ručně" (kdokoli mohl
 * připojit cizí účet) stává ověřené propojení přes tajemství, které zná jen
 * vlastník účtu.
 */

const REZORA_API = (
  process.env.NEXT_PUBLIC_REZERVACE_ORIGIN ||
  (process.env.NODE_ENV !== "production" ? "http://localhost:3199" : "https://app.rezora.cz")
).replace(/\/$/, "");

/** Placeholder slug demo tenantů — bereme ho jako „nepropojeno". */
const DEMO_PLACEHOLDER = "vyzkousej";

interface WidgetRow {
  providerSlug: string | null;
  apiBaseUrl: string | null;
}

/** GET — aktuální stav propojení (kolik widgetů, jaký slug). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!ok || !tenant) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query<WidgetRow>(
    `SELECT settings->'content'->>'providerSlug' AS "providerSlug",
            settings->'content'->>'apiBaseUrl'   AS "apiBaseUrl"
       FROM sections
      WHERE tenant_id = $1 AND section_type = 'rezora-widget'`,
    [tenant.id]
  );

  const slug = rows.find((r) => r.providerSlug && r.providerSlug !== DEMO_PLACEHOLDER)?.providerSlug ?? null;
  return Response.json({
    connected: Boolean(slug),
    slug,
    widgetCount: rows.length,
    apiBaseUrl: REZORA_API,
  });
}

/** POST { key } — ověří párovací klíč a propojí web se slugem účtu. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Neplatný původ požadavku" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!ok || !tenant) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { key?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!key.startsWith("rz_") || key.length < 20) {
    return Response.json({ error: "Neplatný formát klíče" }, { status: 400 });
  }

  // Serverové ověření proti Rezoře — klíč nikdy neopustí server.
  let verify: Response;
  try {
    verify = await fetch(`${REZORA_API}/api/connect/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
      cache: "no-store",
    });
  } catch {
    return Response.json({ error: "Rezervační server je nedostupný" }, { status: 502 });
  }

  const data = (await verify.json().catch(() => ({}))) as { ok?: boolean; slug?: string; name?: string; error?: string };
  if (!verify.ok || !data.ok || !data.slug) {
    return Response.json(
      { error: data.error ?? "Klíč nebyl ověřen" },
      { status: verify.status === 404 ? 404 : 400 }
    );
  }

  // Zapiš JEN slug + veřejné API do všech rezora-widget sekcí tenanta.
  const updated = await query<{ id: number }>(
    `UPDATE sections
        SET settings = jsonb_set(
              jsonb_set(settings, '{content,providerSlug}', to_jsonb($2::text), true),
              '{content,apiBaseUrl}', to_jsonb($3::text), true),
            updated_at = now()
      WHERE tenant_id = $1 AND section_type = 'rezora-widget'
      RETURNING id`,
    [tenant.id, data.slug, REZORA_API]
  );

  return Response.json({
    ok: true,
    slug: data.slug,
    name: data.name ?? null,
    updated: updated.length,
  });
}

/** DELETE — odpojí web (vyprázdní slug; klíč v Rezoře zůstává platný). */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Neplatný původ požadavku" }, { status: 403 });

  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!ok || !tenant) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const updated = await query<{ id: number }>(
    `UPDATE sections
        SET settings = jsonb_set(settings, '{content,providerSlug}', '""'::jsonb, true),
            updated_at = now()
      WHERE tenant_id = $1 AND section_type = 'rezora-widget'
      RETURNING id`,
    [tenant.id]
  );

  return Response.json({ ok: true, updated: updated.length });
}

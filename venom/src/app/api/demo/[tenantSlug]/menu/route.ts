import { NextRequest } from "next/server";
import { z } from "zod";
import { query, auditLog, type Section } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import {
  resolveSectionContent,
  computeOverridesForSubmit,
  invalidateTemplateCache,
} from "@/lib/section-resolver";

/**
 * Menu management — add/remove links in navbar and footer sections.
 *
 * Both navbar and footer sections store their link list as
 *   content.links: Array<{ label: string; href: string }>
 *
 * Adding a link means:
 *   1. Load the current resolved content (template default + slots + overrides).
 *   2. Append/remove the link in content.links.
 *   3. Recompute sparse overrides vs (template + slots) and persist.
 *
 * GET   — list current navbar + footer links (resolved).
 * POST  — { location: "navbar" | "footer", label, href } → add link.
 * DELETE— { location, href } → remove all links pointing to href.
 */
interface RouteParams { params: Promise<{ tenantSlug: string }> }

const PostSchema = z.object({
  location: z.enum(["navbar", "footer"]),
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(200),
});

const DeleteSchema = z.object({
  location: z.enum(["navbar", "footer"]),
  href: z.string().min(1).max(200),
});

type LinkEntry = { label: string; href: string };

type SectionWithContent = Section & {
  content_source: string | null;
  content_overrides: Record<string, unknown>;
};

async function loadSections(tenantId: number, location: "navbar" | "footer") {
  return query<SectionWithContent>(
    "SELECT * FROM sections WHERE tenant_id = $1 AND section_type = $2",
    [tenantId, location]
  );
}

function extractLinks(content: Record<string, unknown>): LinkEntry[] {
  const raw = content.links;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l): l is LinkEntry =>
      typeof l === "object" && l !== null &&
      typeof (l as { label?: unknown }).label === "string" &&
      typeof (l as { href?: unknown }).href === "string"
    )
    .map(l => ({ label: l.label, href: l.href }));
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const navbars = await loadSections(tenant.id, "navbar");
  const footers = await loadSections(tenant.id, "footer");

  const navbarLinks = navbars.length > 0
    ? extractLinks(
        (await resolveSectionContent(
          { ...navbars[0], content_source: (navbars[0].content_source ?? "legacy") as "v2" | "legacy" },
          tenant
        )).content
      )
    : [];
  const footerLinks = footers.length > 0
    ? extractLinks(
        (await resolveSectionContent(
          { ...footers[0], content_source: (footers[0].content_source ?? "legacy") as "v2" | "legacy" },
          tenant
        )).content
      )
    : [];

  return Response.json({ navbar: navbarLinks, footer: footerLinks });
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

  const { location, label, href } = parsed.data;
  const sections = await loadSections(tenant.id, location);
  if (sections.length === 0) {
    return Response.json({ error: `Sekce ${location} neexistuje na žádné stránce` }, { status: 404 });
  }

  let updatedCount = 0;
  for (const s of sections) {
    const sectionV2 = { ...s, content_source: (s.content_source ?? "legacy") as "v2" | "legacy" };
    const resolved = await resolveSectionContent(sectionV2, tenant);
    const links = extractLinks(resolved.content);

    if (links.some(l => l.href === href)) continue; // skip if already present

    const merged: Record<string, unknown> = {
      ...resolved.content,
      links: [...links, { label, href }],
    };

    if (sectionV2.content_source === "v2") {
      const overrides = await computeOverridesForSubmit(sectionV2, tenant, merged);
      await query(
        "UPDATE sections SET content_overrides = $1::jsonb, updated_at = now() WHERE id = $2 AND tenant_id = $3",
        [JSON.stringify(overrides), s.id, tenant.id]
      );
    } else {
      const settings = (s.settings ?? {}) as Record<string, unknown>;
      await query(
        "UPDATE sections SET settings = $1::jsonb, updated_at = now() WHERE id = $2 AND tenant_id = $3",
        [JSON.stringify({ ...settings, content: merged }), s.id, tenant.id]
      );
    }
    updatedCount += 1;
  }

  invalidateTemplateCache();
  await auditLog("menu_link_added", {
    tenantId: tenant.id,
    targetType: "tenant",
    targetId: String(tenant.id),
    extra: { location, label, href, sectionsUpdated: updatedCount },
  });

  return Response.json({ ok: true, updated: updatedCount });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { location, href } = parsed.data;
  const sections = await loadSections(tenant.id, location);

  let updatedCount = 0;
  for (const s of sections) {
    const sectionV2 = { ...s, content_source: (s.content_source ?? "legacy") as "v2" | "legacy" };
    const resolved = await resolveSectionContent(sectionV2, tenant);
    const links = extractLinks(resolved.content);
    if (!links.some(l => l.href === href)) continue;

    const merged: Record<string, unknown> = {
      ...resolved.content,
      links: links.filter(l => l.href !== href),
    };

    if (sectionV2.content_source === "v2") {
      const overrides = await computeOverridesForSubmit(sectionV2, tenant, merged);
      await query(
        "UPDATE sections SET content_overrides = $1::jsonb, updated_at = now() WHERE id = $2 AND tenant_id = $3",
        [JSON.stringify(overrides), s.id, tenant.id]
      );
    } else {
      const settings = (s.settings ?? {}) as Record<string, unknown>;
      await query(
        "UPDATE sections SET settings = $1::jsonb, updated_at = now() WHERE id = $2 AND tenant_id = $3",
        [JSON.stringify({ ...settings, content: merged }), s.id, tenant.id]
      );
    }
    updatedCount += 1;
  }

  invalidateTemplateCache();
  await auditLog("menu_link_removed", {
    tenantId: tenant.id,
    targetType: "tenant",
    targetId: String(tenant.id),
    extra: { location, href, sectionsUpdated: updatedCount },
  });

  return Response.json({ ok: true, removed: updatedCount });
}

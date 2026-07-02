/**
 * POST /api/demo/<tenant>/pages/from-template
 *
 * Single-shot endpoint for the Wix-style "Stránky" panel: take a page
 * template spec, materialise it as a real tenant page, wire it into the
 * navbar of every existing page, and return the new page id + slug.
 *
 * Body:
 *   {
 *     slug:    "rezervace",
 *     title:   "Rezervace",
 *     sections: [{ type, variant }, …]   // navbar/footer are auto-skipped
 *     addToNav?: boolean                 // default true
 *   }
 *
 * Why a dedicated endpoint and not three client calls?
 *   - Atomicity: we don't want to leave half-created pages if the section
 *     batch fails.
 *   - Navbar fan-out: appending the new link to every page's navbar
 *     content_overrides is a multi-row UPDATE — much cleaner server-side.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { auditLog, withTransaction } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import type { PoolClient } from "pg";

const Body = z.object({
  slug:  z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, "Slug může obsahovat jen a-z, 0-9 a pomlčky"),
  title: z.string().min(1).max(120),
  sections: z.array(z.object({
    type:    z.string().min(1).max(50),
    variant: z.string().min(1).max(80),
  })).min(1).max(40),
  addToNav: z.boolean().default(true),
});

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok)     return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { slug, title, sections, addToNav } = parsed.data;

  if (slug === "home") {
    return Response.json({ error: "Slug 'home' je rezervovaný" }, { status: 400 });
  }

  // Skip navbar/footer in incoming sections — those are cloned from homepage
  const contentSections = sections.filter(s => s.type !== "navbar" && s.type !== "footer");

  const result = await withTransaction(async (client: PoolClient) => {
    // 1. Duplicate slug check inside the txn (race-safe)
    const dupe = await client.query<{ id: number }>(
      "SELECT id FROM pages WHERE tenant_id = $1 AND slug = $2",
      [tenant.id, slug],
    );
    if (dupe.rows[0]) return { error: "duplicate", status: 409 } as const;

    // 2. Create the page
    const ins = await client.query<{ id: number }>(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
       VALUES ($1, $2, $3, false, 'draft', NULL, NULL)
       RETURNING id`,
      [tenant.id, slug, title],
    );
    const newPageId = ins.rows[0]?.id;
    if (!newPageId) return { error: "insert_failed", status: 500 } as const;

    // 3. Clone navbar+footer from homepage so new page has chrome
    const home = await client.query<{ id: number }>(
      "SELECT id FROM pages WHERE tenant_id = $1 AND is_homepage = true LIMIT 1",
      [tenant.id],
    );
    const homeId = home.rows[0]?.id ?? null;
    if (homeId) {
      await client.query(
        `INSERT INTO sections (
           tenant_id, page_id, section_type, section_variant, order_index,
           is_visible, settings, content_overrides, content_source
         )
         SELECT tenant_id, $1, section_type, section_variant, order_index,
                is_visible, settings, content_overrides, content_source
           FROM sections
          WHERE tenant_id = $2 AND page_id = $3
            AND section_type IN ('navbar', 'footer')`,
        [newPageId, tenant.id, homeId],
      );
    }

    // 4. Insert content sections in order. Empty content_overrides → renderer
    //    falls back to template defaults (resolveAllSections), which is what
    //    gives every section production-quality demo content out of the box.
    //    Order indices: navbar=0, content=1..n, footer=last (we use a wide
    //    gap so that order stays consistent if footer ends up at e.g. 99).
    let order = 10;
    for (const s of contentSections) {
      await client.query(
        `INSERT INTO sections (
           tenant_id, page_id, section_type, section_variant, order_index,
           is_visible, settings, content_overrides, content_source
         )
         VALUES ($1, $2, $3, $4, $5, true, '{}'::jsonb, '{}'::jsonb, 'template')`,
        [tenant.id, newPageId, s.type, s.variant, order],
      );
      order += 10;
    }

    // Push the footer (already cloned at low order) to the very end
    await client.query(
      `UPDATE sections SET order_index = $1
       WHERE tenant_id = $2 AND page_id = $3 AND section_type = 'footer'`,
      [order + 100, tenant.id, newPageId],
    );

    // 5. Append the new page to navbar.content_overrides.links on every
    //    existing page. We merge into content_overrides so the resolver
    //    composes (templateDefault.links ⊕ override.links) — but for
    //    simplicity we just write the full union: read current links,
    //    append, write back. The resolver treats arrays as full replacement.
    if (addToNav) {
      const navRows = await client.query<{
        id: number; page_id: number; content_overrides: Record<string, unknown> | null;
        settings: Record<string, unknown>;
      }>(
        `SELECT s.id, s.page_id, s.content_overrides, s.settings
           FROM sections s
          WHERE s.tenant_id = $1 AND s.section_type = 'navbar'`,
        [tenant.id],
      );
      const newLink = { label: title, href: `/${slug}` };
      for (const row of navRows.rows) {
        const ov = (row.content_overrides ?? {}) as Record<string, unknown>;
        const existing = (ov.links as Array<{ label: string; href: string }>)
          ?? ((row.settings.content as Record<string, unknown> | undefined)?.links as Array<{ label: string; href: string }>)
          ?? [];
        if (existing.some(l => l.href === newLink.href)) continue;
        const nextLinks = [...existing, newLink];
        await client.query(
          `UPDATE sections SET content_overrides = jsonb_set(
             COALESCE(content_overrides, '{}'::jsonb),
             '{links}',
             $1::jsonb,
             true
           )
           WHERE id = $2`,
          [JSON.stringify(nextLinks), row.id],
        );
      }
    }

    return { ok: true, id: newPageId, slug } as const;
  });

  if ("error" in result) {
    const status = result.status;
    const msg = result.error === "duplicate"
      ? "Stránka se stejným URL již existuje"
      : "Vytvoření stránky selhalo";
    return Response.json({ error: msg }, { status });
  }

  await auditLog("page_created_from_template", {
    tenantId: tenant.id,
    targetType: "page",
    targetId: String(result.id),
    extra: { slug, title, sectionCount: contentSections.length, addToNav },
  });

  return Response.json(result);
}

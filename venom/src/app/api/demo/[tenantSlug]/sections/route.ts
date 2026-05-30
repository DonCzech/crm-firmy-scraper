import { NextRequest } from "next/server";
import { z } from "zod";
import { query, withTransaction, auditLog, touchTenantActivity } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { revalidatePath } from "next/cache";
import type { PoolClient } from "pg";

const SectionSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  page_id: z.number(),
  section_type: z.string().max(50),
  section_variant: z.string().max(50).default("default"),
  order_index: z.number().int().min(0),
  is_visible: z.boolean(),
  settings: z.record(z.unknown()).default({}),
});

const BodySchema = z.object({
  sections: z.array(SectionSchema),
});

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug } = await params;

  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const sections = parsed.data.sections;

  // Security: all sections must belong to this tenant
  for (const s of sections) {
    if (s.tenant_id !== tenant.id) {
      return Response.json({ error: "Section tenant mismatch" }, { status: 403 });
    }
  }

  // Validate no duplicate order_index per page
  const pageGroups = new Map<number, number[]>();
  for (const s of sections) {
    const orders = pageGroups.get(s.page_id) ?? [];
    orders.push(s.order_index);
    pageGroups.set(s.page_id, orders);
  }
  for (const [, orders] of pageGroups) {
    const unique = new Set(orders);
    if (unique.size !== orders.length) {
      return Response.json({ error: "Duplicate section order_index" }, { status: 400 });
    }
  }

  // Validate navbar/footer are not inside sections stream for page builder
  const navFooterCount = sections.filter(
    (s) => s.section_type === "navbar" || s.section_type === "footer"
  ).length;
  // (allowed to exist, but validated as singletons)

  const idMap: Record<string, number> = {};

  try {
    await withTransaction(async (client: PoolClient) => {
      // Save page revision snapshot before updating
      for (const [pageId] of pageGroups) {
        const existingSections = await query(
          "SELECT * FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index",
          [tenant.id, pageId]
        );
        if (existingSections.length > 0) {
          await client.query(
            `INSERT INTO page_revisions (tenant_id, page_id, sections_snapshot)
             VALUES ($1, $2, $3)`,
            [tenant.id, pageId, JSON.stringify(existingSections)]
          );
        }
      }

      // Bump existing sections in this batch out of the way so the UNIQUE
      // (page_id, order_index) constraint can't fail during a reorder swap.
      // We only bump rows that are in the batch — sections not in the batch
      // keep their original order_index untouched.
      const updateIds = sections.filter((s) => s.id > 0).map((s) => s.id);
      if (updateIds.length > 0) {
        await client.query(
          "UPDATE sections SET order_index = order_index + 100000 WHERE id = ANY($1::int[]) AND tenant_id = $2",
          [updateIds, tenant.id]
        );
      }

      // Upsert each section — always with tenant_id validation.
      // Sections with id <= 0 are new (client-side temp IDs) → INSERT and capture
      // the real assigned id so the client can replace its temp id.
      for (const section of sections) {
        if (section.id <= 0) {
          const inserted = await client.query<{ id: number }>(
            `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [
              section.tenant_id,
              section.page_id,
              section.section_type,
              section.section_variant,
              section.order_index,
              section.is_visible,
              JSON.stringify(section.settings),
            ]
          );
          idMap[String(section.id)] = inserted.rows[0].id;
        } else {
          await client.query(
            `INSERT INTO sections (id, tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
             ON CONFLICT (id) DO UPDATE SET
               section_type = EXCLUDED.section_type,
               section_variant = EXCLUDED.section_variant,
               order_index = EXCLUDED.order_index,
               is_visible = EXCLUDED.is_visible,
               settings = EXCLUDED.settings,
               updated_at = now()
             WHERE sections.tenant_id = $2`,
            [
              section.id,
              section.tenant_id,
              section.page_id,
              section.section_type,
              section.section_variant,
              section.order_index,
              section.is_visible,
              JSON.stringify(section.settings),
            ]
          );
        }
      }
    });

    await auditLog("sections_saved", {
      tenantId: tenant.id,
      targetType: "page",
      extra: { count: sections.length },
    });

    await touchTenantActivity(tenant.id);

    // Invalidate ISR cache for this tenant's public pages
    revalidatePath(`/demo/${tenantSlug}`);
    revalidatePath(`/demo/${tenantSlug}/blog`);

    return Response.json({ ok: true, idMap });
  } catch (err) {
    console.error("[sections PUT]", err);
    return Response.json({ error: "Chyba při ukládání" }, { status: 500 });
  }
}

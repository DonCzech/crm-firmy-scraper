import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug, query, auditLog } from "@/lib/db";
import { cookies } from "next/headers";
import { assertSameOrigin } from "@/lib/demo-auth";

const UpdateSchema = z.object({
  pages: z.array(
    z.object({
      id: z.number().int().positive(),
      seo_title: z.string().max(200).nullable().optional(),
      seo_description: z.string().max(300).nullable().optional(),
      og_image: z.string().url().nullable().optional(),
      noindex: z.boolean().optional(),
    })
  ),
});

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

async function checkAuth(tenantSlug: string, accessToken: string | null): Promise<boolean> {
  if (!accessToken) return false;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(`venom_access_${tenantSlug}`)?.value;
  return cookie === accessToken;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });

  if (!(await checkAuth(tenantSlug, tenant.access_token))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  for (const page of parsed.data.pages) {
    // Validate page belongs to this tenant before updating
    await query(
      `UPDATE pages SET
         seo_title = COALESCE($1, seo_title),
         seo_description = COALESCE($2, seo_description),
         og_image = COALESCE($3, og_image),
         noindex = COALESCE($4, noindex),
         updated_at = now()
       WHERE id = $5 AND tenant_id = $6`,
      [
        page.seo_title ?? null,
        page.seo_description ?? null,
        page.og_image ?? null,
        page.noindex ?? null,
        page.id,
        tenant.id,
      ]
    );
  }

  await auditLog("seo_updated", { tenantId: tenant.id, targetType: "pages", targetId: tenant.id.toString() });
  return Response.json({ ok: true });
}

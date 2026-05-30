import { z } from "zod";
import { withTransaction, initDb, auditLog } from "./db";
import { getTemplate } from "./templates";
import type { PoolClient } from "pg";
import type { DesignTokens, SectionConfig } from "./templates/types";

// ── Input validation ──────────────────────────────────────────────────────────

const CreateTenantSchema = z.object({
  email: z.string().email(),
  templateKey: z.string().min(1).max(50),
  industry: z.string().max(100).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(60).optional(),
});

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;

export interface CreateTenantResult {
  tenantId: number;
  slug: string;
  editorUrl: string;
  previewUrl: string;
  accessToken: string;
}

type SectionSeed = SectionConfig & { content?: Record<string, unknown> };

async function insertPageSections(
  client: PoolClient,
  tenantId: number,
  pageId: number,
  sections: SectionSeed[],
  designTokens: DesignTokens,
  demoContent: Record<string, unknown>
) {
  for (const section of sections) {
    const sectionContent = section.content ?? demoContent[section.type] ?? {};

    await client.query(
      `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        tenantId,
        pageId,
        section.type,
        section.variant,
        section.order,
        section.visible,
        JSON.stringify({
          content: sectionContent,
          designTokens,
          anchorId: section.anchorId,
        }),
      ]
    );
  }
}

// ── Slug generator ────────────────────────────────────────────────────────────

function generateSlug(email: string): string {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

// ── Seed templates into DB on first use ───────────────────────────────────────

export async function seedTemplates(): Promise<void> {
  await initDb();
  const { TEMPLATES } = await import("./templates");
  for (const [, template] of Object.entries(TEMPLATES)) {
    await withTransaction(async (client: PoolClient) => {
      // Upsert template record
      const res = await client.query(
        `INSERT INTO templates (key, name, industry, current_version, status)
         VALUES ($1, $2, $3, $4, 'active')
         ON CONFLICT (key) DO UPDATE SET name = $2, industry = $3, current_version = $4, updated_at = now()
         RETURNING id`,
        [template.key, template.name, template.industry, template.version]
      );
      const templateId: number = res.rows[0].id;

      // Upsert template version
      await client.query(
        `INSERT INTO template_versions (template_id, version, default_sections, default_design_tokens, default_demo_content)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (template_id, version) DO UPDATE SET
           default_sections = EXCLUDED.default_sections,
           default_design_tokens = EXCLUDED.default_design_tokens,
           default_demo_content = EXCLUDED.default_demo_content`,
        [
          templateId,
          template.version,
          JSON.stringify(template.defaultSections),
          JSON.stringify(template.designTokens),
          JSON.stringify(template.demoContent),
        ]
      );
    });
  }
}

// ── Main factory function ─────────────────────────────────────────────────────

export async function createDemoTenantFromTemplate(
  input: CreateTenantInput
): Promise<CreateTenantResult> {
  const parsed = CreateTenantSchema.parse(input);

  const template = await getTemplate(parsed.templateKey);
  if (!template) throw new Error(`Unknown template: ${parsed.templateKey}`);

  await seedTemplates();

  const slug = parsed.slug ?? generateSlug(parsed.email);
  // Cryptographically random access token for this tenant's admin
  const { randomBytes } = await import("crypto");
  const accessToken = randomBytes(24).toString("hex");

  return withTransaction(async (client: PoolClient) => {
    // 1. Upsert template record (handles JSON-based templates not in the hardcoded TEMPLATES map)
    await client.query(
      `INSERT INTO templates (key, name, industry, current_version, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (key) DO UPDATE SET name = $2, industry = $3, current_version = $4, updated_at = now()`,
      [template.key, template.name, template.industry, template.version]
    );
    const tplRow = await client.query(
      "SELECT id FROM templates WHERE key = $1",
      [parsed.templateKey]
    );
    if (!tplRow.rows.length) throw new Error("Template not found in DB");
    const templateId: number = tplRow.rows[0].id;

    // 2. Create tenant
    const tenantRes = await client.query(
      `INSERT INTO tenants (slug, email, template_id, template_version, industry, status, active_modules, plan, access_token)
       VALUES ($1, $2, $3, $4, $5, 'demo', $6, 'free', $7)
       RETURNING id`,
      [
        slug,
        parsed.email,
        templateId,
        template.version,
        parsed.industry ?? template.industry,
        ["gallery", "testimonials", "forms"],
        accessToken,
      ]
    );
    const tenantId: number = tenantRes.rows[0].id;

    // 3. Create homepage
    const pageRes = await client.query(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
       VALUES ($1, 'home', $2, true, 'published', $3, $4)
       RETURNING id`,
      [
        tenantId,
        (template.demoContent as Record<string, string>).siteName ?? "Moje webová stránka",
        (template.demoContent as Record<string, Record<string, string>>).seo?.title ?? null,
        (template.demoContent as Record<string, Record<string, string>>).seo?.description ?? null,
      ]
    );
    const pageId: number = pageRes.rows[0].id;

    // 4. Clone homepage sections from template (each gets own record — never shared)
    await insertPageSections(
      client,
      tenantId,
      pageId,
      template.defaultSections,
      template.designTokens,
      template.demoContent
    );

    // 5. Create template subpages with their own editable sections
    for (const page of template.pages ?? []) {
      const subPageRes = await client.query(
        `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
         VALUES ($1, $2, $3, false, 'published', $4, $5)
         RETURNING id`,
        [tenantId, page.slug, page.title, page.seoTitle ?? null, page.seoDescription ?? null]
      );
      await insertPageSections(
        client,
        tenantId,
        subPageRes.rows[0].id,
        page.sections,
        template.designTokens,
        template.demoContent
      );
    }

    // 6. Enable free modules
    const freeModules = ["gallery", "testimonials", "forms"];
    for (const moduleKey of freeModules) {
      await client.query(
        `INSERT INTO tenant_modules (tenant_id, module_key, enabled)
         VALUES ($1, $2, true)
         ON CONFLICT (tenant_id, module_key) DO NOTHING`,
        [tenantId, moduleKey]
      );
    }

    // 7. Audit log
    await auditLog("tenant_created", {
      tenantId,
      actorEmail: parsed.email,
      targetType: "tenant",
      targetId: String(tenantId),
      extra: { slug, templateKey: parsed.templateKey, industry: parsed.industry },
    });

    return {
      tenantId,
      slug,
      editorUrl: `/demo/${slug}/admin`,
      previewUrl: `/demo/${slug}`,
      accessToken,
    };
  });
}

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

// ── Clone sections + all pages from a showcase tenant ───────────────────────
/**
 * Copy the homepage from `showcaseSlug` onto `newTenantId/newPageId`, then
 * mirror EVERY sub-page (slug, title, SEO, OG fields, all sections) the
 * showcase has. This is what gives every fresh demo tenant "ready-made
 * beautiful sub-pages" (solidpixels-style) — assuming the showcase has been
 * curated. Returns the number of pages that were cloned (1 = home only).
 */
async function cloneSectionsFromShowcase(
  client: PoolClient,
  showcaseSlug: string,
  newTenantId: number,
  newPageId: number
): Promise<number> {
  const showcaseRes = await client.query(
    "SELECT id FROM tenants WHERE slug = $1",
    [showcaseSlug]
  );
  if (!showcaseRes.rows.length) return 0;
  const showcaseTenantId: number = showcaseRes.rows[0].id;

  // a) Homepage sections — into the already-created home page row.
  const homeRes = await client.query(
    "SELECT id FROM pages WHERE tenant_id = $1 AND is_homepage = true LIMIT 1",
    [showcaseTenantId]
  );
  if (!homeRes.rows.length) return 0;
  const showcaseHomeId: number = homeRes.rows[0].id;

  async function copySections(srcPageId: number, dstPageId: number) {
    const rows = await client.query(
      `SELECT section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source
       FROM sections WHERE tenant_id = $1 AND page_id = $2 ORDER BY order_index`,
      [showcaseTenantId, srcPageId]
    );
    for (const s of rows.rows) {
      await client.query(
        `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newTenantId, dstPageId, s.section_type, s.section_variant, s.order_index, s.is_visible, s.settings, s.content_overrides ?? {}, s.content_source]
      );
    }
    return rows.rows.length;
  }

  const homeSectionCount = await copySections(showcaseHomeId, newPageId);
  if (homeSectionCount === 0) return 0;

  // b) Every showcase sub-page — create matching row on the new tenant and
  // mirror its sections. Sub-pages preserve slug/title/SEO/OG from showcase.
  const subPages = await client.query(
    `SELECT id, slug, title, status, seo_title, seo_description, og_title, og_description, noindex
     FROM pages
     WHERE tenant_id = $1 AND is_homepage = false
     ORDER BY id`,
    [showcaseTenantId]
  );
  let cloned = 1; // home counted
  for (const sub of subPages.rows) {
    const inserted = await client.query(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description, og_title, og_description, noindex)
       VALUES ($1, $2, $3, false, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (tenant_id, slug) DO NOTHING
       RETURNING id`,
      [
        newTenantId,
        sub.slug,
        sub.title,
        sub.status ?? "published",
        sub.seo_title,
        sub.seo_description,
        sub.og_title,
        sub.og_description,
        sub.noindex ?? false,
      ]
    );
    if (!inserted.rows.length) continue; // skipped due to existing slug
    await copySections(sub.id, inserted.rows[0].id);
    cloned++;
  }

  return cloned;
}

// ── Create sub-pages from the cloned navbar ──────────────────────────────────
/**
 * After the homepage is cloned, look at the navbar's link list and materialise
 * one sub-page per internal link. Each sub-page is seeded with:
 *  - a copy of the homepage navbar (so the menu still works on the sub-page)
 *  - a hero section (clone of homepage hero, retitled to the link label)
 *  - one thematic content section matched to the link slug
 *    (sluzby → services, galerie → gallery, kontakt → contact, …)
 *  - a copy of the homepage footer
 *
 * Templates that don't expose menu links (or whose nav is purely "#" anchors
 * to home sections only) just keep a single homepage. Skipped links: "/",
 * "#", anything starting with `http://`, `https://`, `mailto:`, `tel:`.
 *
 * Idempotent within a transaction: if a slug is already taken for this tenant
 * (e.g. seeded by the template definition), the sub-page creation skips it.
 */
async function createSubPagesFromNavbar(
  client: PoolClient,
  tenantId: number,
  homepageId: number
): Promise<void> {
  // 1. Find the navbar section on the homepage and pull its `links` content.
  const navRes = await client.query(
    `SELECT id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source
     FROM sections
     WHERE tenant_id = $1 AND page_id = $2 AND section_type = 'navbar'
     ORDER BY order_index LIMIT 1`,
    [tenantId, homepageId]
  );
  if (!navRes.rows.length) return;
  const navSection = navRes.rows[0];
  const navContent = (navSection.settings?.content ?? {}) as Record<string, unknown>;
  const primaryLinks = Array.isArray(navContent.links)    ? (navContent.links    as Array<{ href?: string; label?: string }>) : [];
  const topLinks     = Array.isArray(navContent.topLinks) ? (navContent.topLinks as Array<{ href?: string; label?: string }>) : [];
  const links = [...primaryLinks, ...topLinks];
  if (!links.length) return;

  // 2. Footer section (we'll clone it onto every sub-page so the layout stays consistent).
  const footerRes = await client.query(
    `SELECT id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source
     FROM sections
     WHERE tenant_id = $1 AND page_id = $2 AND section_type = 'footer'
     ORDER BY order_index LIMIT 1`,
    [tenantId, homepageId]
  );
  const footerSection = footerRes.rows[0] ?? null;

  // 3. Hero section (cloned + retitled on each sub-page so the sub-page has a banner).
  const heroRes = await client.query(
    `SELECT id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source
     FROM sections
     WHERE tenant_id = $1 AND page_id = $2 AND section_type = 'hero'
     ORDER BY order_index LIMIT 1`,
    [tenantId, homepageId]
  );
  const heroSection = heroRes.rows[0] ?? null;

  // 4. Map link slug → ordered list of acceptable section_types to copy from
  // homepage. First match wins; lets us cascade "services" → "pricing" for
  // templates that use a pricing variant instead of a dedicated services list.
  function slugToTopics(s: string): string[] {
    const norm = s.toLowerCase();
    if (/^(sluzby|sluzba|services|service|lekce|nase-sluzby|nabidka|zakroky)$/.test(norm)) return ["services", "pricing", "promo"];
    if (/^(cenik|ceny|pricing|price-list)$/.test(norm))                              return ["pricing", "about", "services"];
    if (/^(galerie|gallery|fotky|portfolio|projekty|realizace|promeny)$/.test(norm)) return ["gallery"];
    if (/^(kontakt|kontakty|contact|napiste-nam|kde-jsme)$/.test(norm))              return ["contact", "opening-hours"];
    if (/^(o-nas|onas|o-mne|about|o-spolecnosti|atelier|o-klinice|klinika)$/.test(norm)) return ["about", "stats"];
    if (/^(kariera|karriera|jobs|prace|nabor)$/.test(norm))                          return ["team", "about"];
    if (/^(faq|otazky|caste-otazky)$/.test(norm))                                    return ["faq", "testimonials"];
    if (/^(akce|promo|nabidka-akci|specialni-nabidka)$/.test(norm))                  return ["promo", "services"];
    if (/^(lekari|doktori|doctors)$/.test(norm))                                     return ["about", "team"];
    if (/^(celebrity|celebrities|slavni)$/.test(norm))                               return ["about", "gallery", "testimonials"];
    if (/^(tym|team|nas-tym|architekti)$/.test(norm))                                return ["team", "about"];
    if (/^(reference|recenze|testimonials|hodnoceni)$/.test(norm))                   return ["testimonials"];
    if (/^(blog|novinky|clanky|aktuality)$/.test(norm))                              return ["blog-preview", "about"];
    if (/^(voucher|vouchery|darkovy-poukaz|poukaz|gift)$/.test(norm))                return ["promo", "about"];
    if (/^(rezervace|rezervovat|objednavka|booking)$/.test(norm))                    return ["contact", "about"];
    return [];
  }

  // 5. Pre-fetch all homepage sections so we can pick the right ones cheaply.
  const homeSectionsRes = await client.query(
    `SELECT id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source
     FROM sections
     WHERE tenant_id = $1 AND page_id = $2
     ORDER BY order_index`,
    [tenantId, homepageId]
  );
  const homeSections = homeSectionsRes.rows;
  function findHomeSection(type: string) {
    return homeSections.find((s) => s.section_type === type) ?? null;
  }

  // 6. Slug normaliser (matches the client-side slugify in PagesPanel — strip
  // diacritics, lowercase, hyphenate).
  function slugify(input: string): string {
    if (!input) return "";
    const stripped = input
      .normalize("NFKD")
      .replace(/\p{M}+/gu, "")
      .toLowerCase();
    return stripped.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  // 7. Existing sub-page slugs for this tenant (avoid duplicates on retry / re-seed).
  const existing = await client.query(
    "SELECT slug FROM pages WHERE tenant_id = $1",
    [tenantId]
  );
  const taken = new Set<string>(existing.rows.map((r) => r.slug));

  // 8. Walk the link list and create one page per internal link.
  for (const link of links) {
    const rawHref = String(link.href ?? "").trim();
    const label = String(link.label ?? "").trim();
    if (!rawHref || !label) continue;
    // Skip external / placeholder / home anchors.
    if (/^(https?:|mailto:|tel:|sms:)/i.test(rawHref)) continue;
    if (rawHref === "/" || rawHref === "#" || rawHref === "#/") continue;

    // Extract a slug from "#sluzby", "/sluzby", "/sluzby/foo".
    const stripped = rawHref.replace(/^[#/]+/, "").split(/[?#/]/)[0];
    const slug = slugify(stripped || label);
    // Never create a separate page for the homepage — it already exists and
    // its content is owned by the user. A nav link to /home or /homepage just
    // routes back to "/". The list `home/homepage/uvod/index` covers the
    // common synonyms (CS + EN + CMS-typical).
    if (!slug) continue;
    if (["home", "homepage", "uvod", "index"].includes(slug)) continue;
    if (taken.has(slug)) continue;
    taken.add(slug);

    // Create the sub-page (status=published so it's reachable straight away;
    // editor users can toggle to draft later).
    const subRes = await client.query(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
       VALUES ($1, $2, $3, false, 'published', $4, $5)
       RETURNING id`,
      [tenantId, slug, label, label, null]
    );
    const subPageId: number = subRes.rows[0].id;

    // Helper to clone a homepage section onto the sub-page at a given order.
    let order = 0;
    async function cloneSection(src: Record<string, unknown>, overrideContent?: Record<string, unknown>) {
      const settings = (src.settings ?? {}) as Record<string, unknown>;
      const mergedSettings = overrideContent
        ? { ...settings, content: { ...(settings.content as object ?? {}), ...overrideContent } }
        : settings;
      await client.query(
        `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          tenantId,
          subPageId,
          src.section_type,
          src.section_variant,
          order++,
          src.is_visible ?? true,
          mergedSettings,
          src.content_overrides ?? {},
          src.content_source ?? null,
        ]
      );
    }

    // a) Navbar (so the menu still works on the sub-page).
    await cloneSection(navSection);

    // b) Hero — retitle to the link label so the page header reads "Galerie",
    // "Kontakty" etc. Falls back to a basic placeholder if no hero exists.
    if (heroSection) {
      await cloneSection(heroSection, { title: label, subtitle: "" });
    }

    // c) Thematic content matched to the slug — first matching section_type wins.
    for (const topic of slugToTopics(slug)) {
      const themed = findHomeSection(topic);
      if (themed) { await cloneSection(themed); break; }
    }

    // d) Footer.
    if (footerSection) await cloneSection(footerSection);
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
  const { randomBytes } = await import("crypto");
  const accessToken = randomBytes(24).toString("hex");

  return withTransaction(async (client: PoolClient) => {
    // 1. Upsert template record
    await client.query(
      `INSERT INTO templates (key, name, industry, current_version, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (key) DO UPDATE SET name = $2, industry = $3, current_version = $4, updated_at = now()`,
      [template.key, template.name, template.industry, template.version]
    );
    const tplRow = await client.query(
      "SELECT id, primary_demo_slug FROM templates WHERE key = $1",
      [parsed.templateKey]
    );
    if (!tplRow.rows.length) throw new Error("Template not found in DB");
    const templateId: number = tplRow.rows[0].id;
    const showcaseSlug: string | null = tplRow.rows[0].primary_demo_slug ?? null;

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
    const siteName = (template.demoContent as Record<string, string>).siteName ?? "Moje webová stránka";
    const seoTitle = (template.demoContent as Record<string, Record<string, string>>).seo?.title ?? null;
    const seoDesc = (template.demoContent as Record<string, Record<string, string>>).seo?.description ?? null;

    const pageRes = await client.query(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
       VALUES ($1, 'home', $2, true, 'published', $3, $4)
       RETURNING id`,
      [tenantId, siteName, seoTitle, seoDesc]
    );
    const pageId: number = pageRes.rows[0].id;

    // 4. Clone from showcase if available, otherwise seed from template definition
    const clonedPageCount = showcaseSlug
      ? await cloneSectionsFromShowcase(client, showcaseSlug, tenantId, pageId)
      : 0;

    if (clonedPageCount === 0) {
      // Fallback: seed from hardcoded template definition
      await insertPageSections(
        client,
        tenantId,
        pageId,
        template.defaultSections,
        template.designTokens,
        template.demoContent
      );

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
    }

    // 4b. Materialise sub-pages from the cloned navbar links (Služby, O nás,
    // Ceník, Galerie, Kontakty, …). Templates without navbar links keep only
    // the homepage. Each sub-page is seeded with the same navbar+footer, a
    // retitled hero, and one thematic content section copied from homepage.
    await createSubPagesFromNavbar(client, tenantId, pageId);

    // 5. Enable free modules
    const freeModules = ["gallery", "testimonials", "forms"];
    for (const moduleKey of freeModules) {
      await client.query(
        `INSERT INTO tenant_modules (tenant_id, module_key, enabled)
         VALUES ($1, $2, true)
         ON CONFLICT (tenant_id, module_key) DO NOTHING`,
        [tenantId, moduleKey]
      );
    }

    // 6. Audit log
    await auditLog("tenant_created", {
      tenantId,
      actorEmail: parsed.email,
      targetType: "tenant",
      targetId: String(tenantId),
      extra: { slug, templateKey: parsed.templateKey, industry: parsed.industry, clonedFrom: showcaseSlug },
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

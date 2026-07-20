import { query, queryOne } from "@/lib/db";

/**
 * Modul „Pokročilé SEO" — reálný audit katalogu.
 * Projde aktivní produkty + kategorie, aplikuje SEO pravidla (délky titulků,
 * popisky, meta descriptions, alt texty, sluky, duplicitní tituly, EAN…)
 * a uloží report se skóre do commerce_seo_audits.
 */

export type SeoSeverity = "error" | "warning" | "info";

export interface SeoIssue {
  code: string;
  severity: SeoSeverity;
  message: string;
}

export interface SeoProductResult {
  id: number;
  title: string;
  slug: string;
  score: number;
  issues: SeoIssue[];
}

export interface SeoReport {
  score: number;
  products_total: number;
  products_ok: number;
  issues_by_severity: { error: number; warning: number; info: number };
  top_issues: { code: string; message: string; severity: SeoSeverity; count: number }[];
  products: SeoProductResult[];
  categories_missing_description: number;
  generated_at: string;
}

const DEDUCTIONS: Record<SeoSeverity, number> = { error: 25, warning: 10, info: 3 };

interface AuditProduct {
  id: number; slug: string; title: string; description: string | null;
  seo_title: string | null; seo_description: string | null; og_image: string | null;
  primary_category_id: number | null;
  image_count: number; images_without_alt: number;
  variants_count: number; variants_without_ean: number;
}

export async function initSeoAuditDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_seo_audits (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      report JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

function auditProduct(p: AuditProduct, duplicateTitles: Set<string>): SeoProductResult {
  const issues: SeoIssue[] = [];
  const push = (code: string, severity: SeoSeverity, message: string) => issues.push({ code, severity, message });

  // Titulek
  if (p.title.length < 20) push("title-short", "warning", `Titulek má jen ${p.title.length} znaků (doporučeno 20–70)`);
  else if (p.title.length > 70) push("title-long", "warning", `Titulek má ${p.title.length} znaků (doporučeno 20–70)`);
  if (duplicateTitles.has(p.title.toLowerCase())) push("title-duplicate", "error", "Duplicitní titulek s jiným produktem");

  // Meta title/description
  const seoTitle = p.seo_title ?? "";
  if (seoTitle && seoTitle.length > 60) push("seo-title-long", "warning", `SEO titulek má ${seoTitle.length} znaků (max 60)`);
  if (!p.seo_description) push("meta-missing", "warning", "Chybí meta description (50–160 znaků)");
  else if (p.seo_description.length < 50 || p.seo_description.length > 160) {
    push("meta-length", "warning", `Meta description má ${p.seo_description.length} znaků (doporučeno 50–160)`);
  }

  // Popis
  const desc = (p.description ?? "").replace(/<[^>]+>/g, "").trim();
  if (!desc) push("description-missing", "error", "Produkt nemá žádný popis");
  else if (desc.length < 200) push("description-short", "warning", `Popis má jen ${desc.length} znaků (doporučeno 200+)`);

  // Obrázky
  if (p.image_count === 0) push("image-missing", "error", "Produkt nemá žádný obrázek");
  else if (p.images_without_alt > 0) push("image-alt", "warning", `${p.images_without_alt} z ${p.image_count} obrázků nemá alt text`);
  if (!p.og_image && p.image_count === 0) push("og-missing", "info", "Chybí OG obrázek pro sdílení na sociálních sítích");

  // Slug
  if (/[A-Z]/.test(p.slug) || /[^a-z0-9-]/.test(p.slug)) push("slug-format", "warning", "Slug obsahuje velká písmena nebo nepovolené znaky");
  if (p.slug.length > 80) push("slug-long", "info", `Slug má ${p.slug.length} znaků (doporučeno do 80)`);

  // Zařazení + EAN
  if (!p.primary_category_id) push("category-missing", "warning", "Produkt nemá hlavní kategorii");
  if (p.variants_count > 0 && p.variants_without_ean === p.variants_count) {
    push("ean-missing", "info", "Žádná varianta nemá EAN (pomáhá Google Nákupy a srovnávače)");
  }

  const score = Math.max(0, 100 - issues.reduce((s, i) => s + DEDUCTIONS[i.severity], 0));
  return { id: p.id, title: p.title, slug: p.slug, score, issues };
}

export async function runSeoAudit(tenantId: number): Promise<SeoReport> {
  await initSeoAuditDb();

  const products = await query<AuditProduct>(
    `SELECT p.id, p.slug, p.title, p.description, p.seo_title, p.seo_description, p.og_image, p.primary_category_id,
       (SELECT COUNT(*) FROM product_images i WHERE i.product_id = p.id)::int AS image_count,
       (SELECT COUNT(*) FROM product_images i WHERE i.product_id = p.id AND (i.alt IS NULL OR i.alt = ''))::int AS images_without_alt,
       (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id)::int AS variants_count,
       (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id AND (v.ean IS NULL OR v.ean = ''))::int AS variants_without_ean
     FROM products p
     WHERE p.tenant_id = $1 AND p.status = 'active'
     ORDER BY p.title`,
    [tenantId]
  );

  const titleCounts = new Map<string, number>();
  for (const p of products) {
    const k = p.title.toLowerCase();
    titleCounts.set(k, (titleCounts.get(k) ?? 0) + 1);
  }
  const duplicateTitles = new Set([...titleCounts.entries()].filter(([, n]) => n > 1).map(([k]) => k));

  const results = products.map((p) => auditProduct(p, duplicateTitles));

  const catMissing = await queryOne<{ count: string }>(
    `SELECT COUNT(*) AS count FROM product_categories
     WHERE tenant_id = $1 AND is_visible = true AND (description IS NULL OR description = '')`,
    [tenantId]
  );

  const bySeverity = { error: 0, warning: 0, info: 0 };
  const issueAgg = new Map<string, { code: string; message: string; severity: SeoSeverity; count: number }>();
  for (const r of results) {
    for (const i of r.issues) {
      bySeverity[i.severity]++;
      const agg = issueAgg.get(i.code);
      if (agg) agg.count++;
      else issueAgg.set(i.code, { code: i.code, message: i.message.replace(/\d+/g, "…").replace(/…–…|… z …/g, "…"), severity: i.severity, count: 1 });
    }
  }

  const report: SeoReport = {
    score: results.length ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 100,
    products_total: results.length,
    products_ok: results.filter((r) => r.issues.length === 0).length,
    issues_by_severity: bySeverity,
    top_issues: [...issueAgg.values()].sort((a, b) => b.count - a.count).slice(0, 10),
    products: results.sort((a, b) => a.score - b.score),
    categories_missing_description: parseInt(catMissing?.count ?? "0", 10),
    generated_at: new Date().toISOString(),
  };

  await query(
    `INSERT INTO commerce_seo_audits (tenant_id, score, report) VALUES ($1, $2, $3)`,
    [tenantId, report.score, JSON.stringify(report)]
  );
  return report;
}

export async function getLatestSeoAudit(tenantId: number): Promise<SeoReport | null> {
  await initSeoAuditDb();
  const row = await queryOne<{ report: SeoReport }>(
    `SELECT report FROM commerce_seo_audits WHERE tenant_id = $1 ORDER BY id DESC LIMIT 1`,
    [tenantId]
  );
  return row?.report ?? null;
}

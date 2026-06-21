import { Pool, PoolClient } from "pg";

// ── Pool ──────────────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

// ── Schema init (idempotent) ──────────────────────────────────────────────────

let initialized = false;

export async function initDb(): Promise<void> {
  if (initialized) return;

  await pool.query(`
    -- ── Platform admin users ──────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── User accounts (tenant owners / website owners) ────────────────────────
    CREATE TABLE IF NOT EXISTS user_accounts (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      phone TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Templates (master, read-only) ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS templates (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      current_version TEXT NOT NULL DEFAULT '1.0.0',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS template_versions (
      id SERIAL PRIMARY KEY,
      template_id INTEGER NOT NULL REFERENCES templates(id),
      version TEXT NOT NULL,
      schema_version INTEGER NOT NULL DEFAULT 1,
      default_config JSONB NOT NULL DEFAULT '{}',
      default_sections JSONB NOT NULL DEFAULT '[]',
      default_design_tokens JSONB NOT NULL DEFAULT '{}',
      default_demo_content JSONB NOT NULL DEFAULT '{}',
      migration_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(template_id, version)
    );

    -- ── Tenants ───────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS tenants (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      template_id INTEGER REFERENCES templates(id),
      template_version TEXT NOT NULL DEFAULT '1.0.0',
      industry TEXT,
      status TEXT NOT NULL DEFAULT 'demo',
      active_modules TEXT[] DEFAULT '{}',
      plan TEXT NOT NULL DEFAULT 'free',
      access_token TEXT,
      user_account_id INTEGER REFERENCES user_accounts(id),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Subscriptions (per tenant, after tenants table) ──────────────────────
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_account_id INTEGER REFERENCES user_accounts(id),
      plan TEXT NOT NULL DEFAULT 'trial',
      status TEXT NOT NULL DEFAULT 'trial',
      trial_starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '30 days',
      paid_at TIMESTAMPTZ,
      next_billing_at TIMESTAMPTZ,
      price_czk INTEGER NOT NULL DEFAULT 500,
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      cancelled_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id)
    );

    -- ── Tenant pages ──────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS pages (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      is_homepage BOOLEAN NOT NULL DEFAULT false,
      status TEXT NOT NULL DEFAULT 'published',
      seo_title TEXT,
      seo_description TEXT,
      og_image TEXT,
      noindex BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, slug)
    );

    -- ── Page sections ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS sections (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
      section_type TEXT NOT NULL,
      section_variant TEXT NOT NULL DEFAULT 'default',
      order_index INTEGER NOT NULL,
      is_visible BOOLEAN NOT NULL DEFAULT true,
      settings JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(page_id, order_index)
    );

    -- ── Media ─────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS media (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      original_name TEXT,
      url TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER,
      width INTEGER,
      height INTEGER,
      alt_text TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Custom domains ────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS domains (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      domain TEXT UNIQUE NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT false,
      verification_token TEXT,
      www_redirect TEXT DEFAULT 'redirect_to_www',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Modules registry ──────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS modules (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      version TEXT NOT NULL DEFAULT '1.0.0',
      pricing_tier TEXT NOT NULL DEFAULT 'free',
      enabled_by_default BOOLEAN DEFAULT false,
      config_schema JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS tenant_modules (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      module_key TEXT NOT NULL REFERENCES modules(key),
      module_version TEXT NOT NULL DEFAULT '1.0.0',
      enabled BOOLEAN NOT NULL DEFAULT true,
      config JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, module_key)
    );

    -- ── Feature flags ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS feature_flags (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL,
      scope TEXT NOT NULL DEFAULT 'global',
      scope_id TEXT,
      enabled BOOLEAN NOT NULL DEFAULT false,
      rollout_percent INTEGER DEFAULT 100,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Page revisions ────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS page_revisions (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
      sections_snapshot JSONB NOT NULL,
      created_by TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Audit log ─────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER,
      actor_email TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details JSONB DEFAULT '{}',
      ip_address TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Blog posts ────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      content JSONB NOT NULL DEFAULT '[]',
      featured_image TEXT,
      author TEXT,
      category TEXT,
      tags TEXT[] DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TIMESTAMPTZ,
      scheduled_at TIMESTAMPTZ,
      seo_title TEXT,
      seo_description TEXT,
      og_image TEXT,
      noindex BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, slug)
    );

    -- ── Tenant overrides (templateDefault ?? tenantOverride render pattern) ────
    CREATE TABLE IF NOT EXISTS tenant_overrides (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      target_type TEXT NOT NULL,
      target_id TEXT,
      field_path TEXT NOT NULL,
      value JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Template Intelligence Lab ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS template_lab_sources (
      id SERIAL PRIMARY KEY,
      url TEXT UNIQUE NOT NULL,
      industry TEXT NOT NULL,
      domain TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      priority INTEGER DEFAULT 99,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS template_lab_jobs (
      id SERIAL PRIMARY KEY,
      source_id INTEGER REFERENCES template_lab_sources(id),
      url TEXT NOT NULL,
      industry TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      stage TEXT,
      error_message TEXT,
      log JSONB DEFAULT '[]',
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS template_lab_snapshots (
      id SERIAL PRIMARY KEY,
      job_id INTEGER REFERENCES template_lab_jobs(id),
      url TEXT NOT NULL,
      industry TEXT NOT NULL,
      domain TEXT NOT NULL,
      html_content TEXT,
      analysis JSONB DEFAULT '{}',
      pages JSONB DEFAULT '[]',
      seo JSONB DEFAULT '{}',
      screenshot_desktop TEXT,
      screenshot_mobile TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS template_lab_design_tokens (
      id SERIAL PRIMARY KEY,
      job_id INTEGER REFERENCES template_lab_jobs(id),
      snapshot_id INTEGER REFERENCES template_lab_snapshots(id),
      domain TEXT NOT NULL,
      tokens JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS template_lab_generated (
      id SERIAL PRIMARY KEY,
      job_id INTEGER REFERENCES template_lab_jobs(id),
      industry TEXT NOT NULL,
      source_url TEXT NOT NULL,
      template_slug TEXT UNIQUE NOT NULL,
      template_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      preview_desktop TEXT,
      preview_mobile TEXT,
      editable_schema JSONB DEFAULT '{}',
      content_schema JSONB DEFAULT '{}',
      design_tokens JSONB DEFAULT '{}',
      sections_data JSONB DEFAULT '[]',
      pages_data JSONB DEFAULT '[]',
      review_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      approved_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS template_lab_publish_log (
      id SERIAL PRIMARY KEY,
      generated_id INTEGER REFERENCES template_lab_generated(id),
      action TEXT NOT NULL,
      actor TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Contact form submissions ───────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT,
      ip_address TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Platform settings (key-value store) ──────────────────────────────────
    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Deletion audit log ───────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS deletion_audit_log (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL,
      tenant_slug TEXT NOT NULL,
      tenant_email TEXT NOT NULL,
      action TEXT NOT NULL,
      reason TEXT,
      last_activity_at TIMESTAMPTZ,
      days_inactive INTEGER,
      performed_by TEXT NOT NULL DEFAULT 'system',
      dry_run BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Tenant data slots (F1: shared data nezávislá na šabloně) ──────────────
    -- Sdílená data (kontakt, brand, hodiny, social) přežívají přepnutí šablony.
    -- Šablony v content/cs.json referencují přes {"$slot": "contact.phone"}.
    CREATE TABLE IF NOT EXISTS tenant_data_slots (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      slot_key TEXT NOT NULL,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, slot_key)
    );

    -- ── Indexes ───────────────────────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
    CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
    CREATE INDEX IF NOT EXISTS idx_deletion_audit_log_tenant ON deletion_audit_log(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts(email);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
    CREATE INDEX IF NOT EXISTS idx_tenants_user_account_id ON tenants(user_account_id);
    CREATE INDEX IF NOT EXISTS idx_pages_tenant_id ON pages(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_sections_page_id ON sections(page_id);
    CREATE INDEX IF NOT EXISTS idx_sections_tenant_id ON sections(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_media_tenant_id ON media(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_blog_posts_tenant_id ON blog_posts(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);
    CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_tenant_overrides_tenant_id ON tenant_overrides(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_contact_submissions_tenant_id ON contact_submissions(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_template_lab_jobs_status ON template_lab_jobs(status);
    CREATE INDEX IF NOT EXISTS idx_template_lab_generated_status ON template_lab_generated(status);
    CREATE INDEX IF NOT EXISTS idx_template_lab_generated_industry ON template_lab_generated(industry);
  `);

  // Idempotent column additions for schema evolution
  await pool.query(`
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS access_token TEXT;
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS analytics_config JSONB DEFAULT '{}';
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS search_console_verification TEXT;
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS business_name TEXT;
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS lifecycle_status TEXT NOT NULL DEFAULT 'active';
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMPTZ;
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deletion_notified_at TIMESTAMPTZ;
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS parent_tenant_id INTEGER REFERENCES tenants(id) ON DELETE SET NULL;
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS showcase_kind TEXT;

    -- F1: per-section sparse overrides + dual-mode render flag
    ALTER TABLE sections ADD COLUMN IF NOT EXISTS content_overrides JSONB DEFAULT '{}';
    ALTER TABLE sections ADD COLUMN IF NOT EXISTS content_source TEXT DEFAULT 'legacy';

    -- F1: template version cache key + publish timestamp
    ALTER TABLE template_versions ADD COLUMN IF NOT EXISTS checksum TEXT;
    ALTER TABLE template_versions ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT now();

    -- Phase 3 review queue: daily 3-template QA workflow
    ALTER TABLE templates ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending';
    ALTER TABLE templates ADD COLUMN IF NOT EXISTS review_notes TEXT;
    ALTER TABLE templates ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
    ALTER TABLE templates ADD COLUMN IF NOT EXISTS reviewer_email TEXT;
    ALTER TABLE templates ADD COLUMN IF NOT EXISTS assigned_date DATE;
    ALTER TABLE templates ADD COLUMN IF NOT EXISTS review_checklist JSONB DEFAULT '{}';
    ALTER TABLE templates ADD COLUMN IF NOT EXISTS last_perf_score INTEGER;
    ALTER TABLE templates ADD COLUMN IF NOT EXISTS last_perf_at TIMESTAMPTZ;
    ALTER TABLE templates ADD COLUMN IF NOT EXISTS last_residue_count INTEGER;
    ALTER TABLE templates ADD COLUMN IF NOT EXISTS last_residue_at TIMESTAMPTZ;
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_tenants_lifecycle ON tenants(lifecycle_status);
    CREATE INDEX IF NOT EXISTS idx_tenants_last_activity ON tenants(last_activity_at);
    CREATE INDEX IF NOT EXISTS idx_data_slots_tenant ON tenant_data_slots(tenant_id);
  `);

  // Functional unique index for tenant_overrides — COALESCE avoids null inequalities
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_overrides_unique
      ON tenant_overrides(tenant_id, target_type, COALESCE(target_id, ''), field_path);
  `);

  // Functional unique index for feature_flags — COALESCE not allowed in inline UNIQUE constraint
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_flags_unique
      ON feature_flags(key, scope, COALESCE(scope_id, ''));
  `);

  // Seed core modules
  await pool.query(`
    INSERT INTO modules (key, name, version, pricing_tier, enabled_by_default) VALUES
      ('blog', 'Blog', '1.0.0', 'pro', false),
      ('advanced-seo', 'Advanced SEO', '1.0.0', 'pro', false),
      ('gallery', 'Gallery', '1.0.0', 'free', true),
      ('testimonials', 'Testimonials', '1.0.0', 'free', true),
      ('rezora', 'Rezora Booking', '1.0.0', 'addon', false),
      ('analytics', 'Analytics', '1.0.0', 'pro', false),
      ('forms', 'Forms', '1.0.0', 'starter', true),
      ('newsletter', 'Newsletter', '1.0.0', 'starter', false)
    ON CONFLICT (key) DO NOTHING
  `);

  initialized = true;
}

// ── Generic query helpers ─────────────────────────────────────────────────────

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  await initDb();
  const { rows } = await pool.query(text, params);
  return rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

// ── Transaction helper ────────────────────────────────────────────────────────

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  await initDb();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ── Platform admin ────────────────────────────────────────────────────────────

export async function adminExists(): Promise<boolean> {
  await initDb();
  const rows = await query<{ count: string }>("SELECT COUNT(*) AS count FROM admin_users");
  return Number(rows[0]?.count ?? 0) > 0;
}

export async function getAdminByEmail(email: string) {
  return queryOne<{ id: number; email: string; password_hash: string }>(
    "SELECT id, email, password_hash FROM admin_users WHERE email = $1",
    [email]
  );
}

export async function createAdmin(email: string, passwordHash: string): Promise<void> {
  await initDb();
  await pool.query("INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)", [
    email,
    passwordHash,
  ]);
}

export async function updateAdminPassword(email: string, passwordHash: string): Promise<void> {
  await initDb();
  await pool.query(
    "INSERT INTO admin_users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET password_hash = $2",
    [email, passwordHash]
  );
}

// ── User account helpers ──────────────────────────────────────────────────────

export interface UserAccount {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserByEmail(email: string): Promise<UserAccount | null> {
  await initDb();
  return queryOne<UserAccount>("SELECT * FROM user_accounts WHERE email = $1", [email]);
}

export async function getUserById(id: number): Promise<UserAccount | null> {
  await initDb();
  return queryOne<UserAccount>("SELECT * FROM user_accounts WHERE id = $1", [id]);
}

export async function createUserAccount(
  email: string,
  passwordHash: string,
  name?: string
): Promise<UserAccount> {
  await initDb();
  const rows = await query<UserAccount>(
    "INSERT INTO user_accounts (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *",
    [email, passwordHash, name ?? null]
  );
  return rows[0];
}

export async function getAllUsers(): Promise<UserAccount[]> {
  await initDb();
  return query<UserAccount>("SELECT id, email, name, phone, created_at, updated_at FROM user_accounts ORDER BY created_at DESC");
}

// ── Subscription helpers ──────────────────────────────────────────────────────

export interface Subscription {
  id: number;
  tenant_id: number;
  user_account_id: number | null;
  plan: string;
  status: string;
  trial_starts_at: string;
  trial_ends_at: string;
  paid_at: string | null;
  next_billing_at: string | null;
  price_czk: number;
  billing_cycle: string;
  cancelled_at: string | null;
  created_at: string;
  days_remaining?: number;
}

export async function getSubscriptionByTenantId(tenantId: number): Promise<Subscription | null> {
  await initDb();
  return queryOne<Subscription>(
    `SELECT *,
       GREATEST(0, CEIL(EXTRACT(EPOCH FROM (trial_ends_at - NOW())) / 86400))::int AS days_remaining
     FROM subscriptions WHERE tenant_id = $1`,
    [tenantId]
  );
}

export async function createSubscription(tenantId: number, userAccountId?: number): Promise<Subscription> {
  await initDb();
  const rows = await query<Subscription>(
    `INSERT INTO subscriptions (tenant_id, user_account_id)
     VALUES ($1, $2)
     ON CONFLICT (tenant_id) DO UPDATE SET updated_at = now()
     RETURNING *`,
    [tenantId, userAccountId ?? null]
  );
  return rows[0];
}

export async function activateSubscription(tenantId: number): Promise<void> {
  await initDb();
  await pool.query(
    `UPDATE subscriptions SET
       status = 'active', plan = 'paid', paid_at = now(),
       next_billing_at = now() + INTERVAL '30 days', updated_at = now()
     WHERE tenant_id = $1`,
    [tenantId]
  );
  await pool.query("UPDATE tenants SET plan = 'paid', updated_at = now() WHERE id = $1", [tenantId]);
}

export async function cancelSubscription(tenantId: number): Promise<void> {
  await initDb();
  await pool.query(
    `UPDATE subscriptions SET status = 'cancelled', cancelled_at = now(), updated_at = now()
     WHERE tenant_id = $1`,
    [tenantId]
  );
}

// ── Tenant helpers ────────────────────────────────────────────────────────────

export interface Tenant {
  id: number;
  slug: string;
  email: string;
  template_id: number;
  template_version: string;
  industry: string;
  status: string;
  active_modules: string[];
  plan: string;
  access_token: string | null;
  analytics_config: Record<string, string> | null;
  search_console_verification: string | null;
  created_at: string;
  updated_at: string;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  return queryOne<Tenant>("SELECT * FROM tenants WHERE slug = $1", [slug]);
}

export async function getTenantById(id: number): Promise<Tenant | null> {
  return queryOne<Tenant>("SELECT * FROM tenants WHERE id = $1", [id]);
}

export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  return queryOne<Tenant>(
    `SELECT t.* FROM tenants t
     JOIN domains d ON d.tenant_id = t.id
     WHERE d.domain = $1 AND d.verified = true`,
    [domain]
  );
}

// ── Tenant override helpers ───────────────────────────────────────────────────

export interface TenantOverride {
  target_type: string;
  target_id: string | null;
  field_path: string;
  value: unknown;
}

export async function getTenantOverrides(tenantId: number): Promise<TenantOverride[]> {
  return query<TenantOverride>(
    "SELECT target_type, target_id, field_path, value FROM tenant_overrides WHERE tenant_id = $1",
    [tenantId]
  );
}

/**
 * Apply tenant overrides onto a section's content.
 * Pattern: finalValue = tenantOverride ?? templateDefault
 * Overrides are keyed by field_path (dot-notation) and stored in JSONB.
 */
export function applyOverrides(
  content: Record<string, unknown>,
  overrides: TenantOverride[],
  sectionId: number
): Record<string, unknown> {
  if (!overrides.length) return content;

  const applicable = overrides.filter(
    (o) => o.target_type === "section" && (o.target_id === null || o.target_id === String(sectionId))
  );
  if (!applicable.length) return content;

  const result = { ...content };
  for (const override of applicable) {
    // Simple single-level field path
    const parts = override.field_path.split(".");
    if (parts.length === 1) {
      result[parts[0]] = override.value;
    } else {
      // Nested path — shallow copy up to depth
      let obj = result as Record<string, unknown>;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...(obj[parts[i]] as Record<string, unknown> ?? {}) };
        obj = obj[parts[i]] as Record<string, unknown>;
      }
      obj[parts[parts.length - 1]] = override.value;
    }
  }
  return result;
}

// ── Page helpers ──────────────────────────────────────────────────────────────

export interface Page {
  id: number;
  tenant_id: number;
  slug: string;
  title: string;
  is_homepage: boolean;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  noindex: boolean;
}

export async function getTenantPages(tenantId: number): Promise<Page[]> {
  return query<Page>(
    "SELECT * FROM pages WHERE tenant_id = $1 ORDER BY is_homepage DESC, title",
    [tenantId]
  );
}

export async function getTenantPage(tenantId: number, slug: string): Promise<Page | null> {
  return queryOne<Page>("SELECT * FROM pages WHERE tenant_id = $1 AND slug = $2", [tenantId, slug]);
}

// ── Section helpers ───────────────────────────────────────────────────────────

export interface Section {
  id: number;
  tenant_id: number;
  page_id: number;
  section_type: string;
  section_variant: string;
  order_index: number;
  is_visible: boolean;
  settings: Record<string, unknown>;
}

export async function getPageSections(tenantId: number, pageId: number): Promise<Section[]> {
  // Always filter by BOTH tenant_id AND page_id — never just page_id alone
  return query<Section>(
    `SELECT * FROM sections
     WHERE tenant_id = $1 AND page_id = $2
     ORDER BY order_index`,
    [tenantId, pageId]
  );
}

export async function upsertSection(
  tenantId: number,
  pageId: number,
  section: Omit<Section, "tenant_id" | "page_id">
): Promise<void> {
  await pool.query(
    `INSERT INTO sections (id, tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
     ON CONFLICT (id) DO UPDATE SET
       section_type = $4, section_variant = $5, order_index = $6,
       is_visible = $7, settings = $8, updated_at = now()`,
    [
      section.id,
      tenantId,
      pageId,
      section.section_type,
      section.section_variant,
      section.order_index,
      section.is_visible,
      JSON.stringify(section.settings),
    ]
  );
}

// ── Audit ─────────────────────────────────────────────────────────────────────

export async function auditLog(
  action: string,
  details: {
    tenantId?: number;
    actorEmail?: string;
    targetType?: string;
    targetId?: string;
    extra?: Record<string, unknown>;
    ip?: string;
  }
): Promise<void> {
  await pool.query(
    `INSERT INTO audit_log (tenant_id, actor_email, action, target_type, target_id, details, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      details.tenantId ?? null,
      details.actorEmail ?? null,
      action,
      details.targetType ?? null,
      details.targetId ?? null,
      JSON.stringify(details.extra ?? {}),
      details.ip ?? null,
    ]
  );
}

// ── Lifecycle / inactive-cleanup helpers ─────────────────────────────────────

export interface TenantLifecycleRow {
  id: number;
  slug: string;
  email: string;
  lifecycle_status: string;
  last_activity_at: string;
  deletion_scheduled_at: string | null;
  days_inactive: number;
  has_active_subscription: boolean;
}

/** Update last_activity_at for a tenant — called on every successful admin login or content save. */
export async function touchTenantActivity(tenantId: number): Promise<void> {
  await pool.query(
    `UPDATE tenants
     SET last_activity_at = now(), lifecycle_status = 'active',
         deletion_scheduled_at = NULL, updated_at = now()
     WHERE id = $1 AND lifecycle_status != 'archived'`,
    [tenantId]
  );
}

/** Tenants inactive 53+ days with no active subscription → mark inactive_warning.
 *  Safety: re-checks subscription inside the same query, never touches archived/deleted. */
export async function markInactiveWarnings(dryRun = false): Promise<TenantLifecycleRow[]> {
  await initDb();

  const candidates = await query<TenantLifecycleRow>(`
    SELECT
      t.id, t.slug, t.email, t.lifecycle_status, t.last_activity_at,
      t.deletion_scheduled_at,
      EXTRACT(EPOCH FROM (now() - t.last_activity_at))::int / 86400 AS days_inactive,
      (
        SELECT EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.tenant_id = t.id
            AND s.status IN ('active', 'trial')
            AND (s.status = 'active' OR s.trial_ends_at > now())
        )
      ) AS has_active_subscription
    FROM tenants t
    WHERE t.lifecycle_status = 'active'
      AND t.last_activity_at < now() - INTERVAL '53 days'
  `);

  // Filter out any with active subscription (safety belt)
  const eligible = candidates.filter((r) => !r.has_active_subscription);

  if (!dryRun && eligible.length > 0) {
    const ids = eligible.map((r) => r.id);
    await pool.query(
      `UPDATE tenants
       SET lifecycle_status = 'inactive_warning',
           deletion_scheduled_at = now() + INTERVAL '7 days',
           updated_at = now()
       WHERE id = ANY($1::int[])
         AND lifecycle_status = 'active'
         AND last_activity_at < now() - INTERVAL '53 days'
         AND NOT EXISTS (
           SELECT 1 FROM subscriptions s
           WHERE s.tenant_id = tenants.id
             AND s.status IN ('active', 'trial')
             AND (s.status = 'active' OR s.trial_ends_at > now())
         )`,
      [ids]
    );

    for (const r of eligible) {
      await pool.query(
        `INSERT INTO deletion_audit_log
           (tenant_id, tenant_slug, tenant_email, action, reason, last_activity_at, days_inactive, dry_run)
         VALUES ($1, $2, $3, 'inactive_warning', 'No activity for 53+ days', $4, $5, false)`,
        [r.id, r.slug, r.email, r.last_activity_at, r.days_inactive]
      );
    }
  }

  return eligible;
}

/** Tenants with deletion_scheduled_at passed + still inactive 60+ days → archive (soft delete).
 *  All conditions re-validated inside a transaction. Max 20 per run. */
export async function archiveInactiveTenants(dryRun = false): Promise<TenantLifecycleRow[]> {
  await initDb();

  const candidates = await query<TenantLifecycleRow>(`
    SELECT
      t.id, t.slug, t.email, t.lifecycle_status, t.last_activity_at,
      t.deletion_scheduled_at,
      EXTRACT(EPOCH FROM (now() - t.last_activity_at))::int / 86400 AS days_inactive,
      (
        SELECT EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.tenant_id = t.id
            AND s.status IN ('active', 'trial')
            AND (s.status = 'active' OR s.trial_ends_at > now())
        )
      ) AS has_active_subscription
    FROM tenants t
    WHERE t.lifecycle_status = 'inactive_warning'
      AND t.deletion_scheduled_at IS NOT NULL
      AND t.deletion_scheduled_at < now()
      AND t.last_activity_at < now() - INTERVAL '60 days'
    LIMIT 20
  `);

  const eligible = candidates.filter((r) => !r.has_active_subscription);

  if (!dryRun && eligible.length > 0) {
    for (const r of eligible) {
      await withTransaction(async (client) => {
        // Triple-check inside transaction
        const row = await client.query(
          `SELECT t.id,
             EXISTS (
               SELECT 1 FROM subscriptions s
               WHERE s.tenant_id = t.id
                 AND s.status IN ('active', 'trial')
                 AND (s.status = 'active' OR s.trial_ends_at > now())
             ) AS has_active_sub
           FROM tenants t
           WHERE t.id = $1
             AND t.lifecycle_status = 'inactive_warning'
             AND t.deletion_scheduled_at < now()
             AND t.last_activity_at < now() - INTERVAL '60 days'`,
          [r.id]
        );

        if (row.rows.length === 0 || row.rows[0].has_active_sub) return;

        await client.query(
          `UPDATE tenants
           SET lifecycle_status = 'archived', status = 'archived',
               deletion_scheduled_at = now() + INTERVAL '30 days', updated_at = now()
           WHERE id = $1`,
          [r.id]
        );

        await client.query(
          `INSERT INTO deletion_audit_log
             (tenant_id, tenant_slug, tenant_email, action, reason, last_activity_at, days_inactive, dry_run)
           VALUES ($1, $2, $3, 'archived', 'No activity for 60+ days', $4, $5, false)`,
          [r.id, r.slug, r.email, r.last_activity_at, r.days_inactive]
        );
      });
    }
  }

  return eligible;
}

/** Archived tenants 30+ days after archival → physically delete.
 *  HARD LIMIT: max 5 per run. All checks in transaction. */
export async function purgeArchivedTenants(dryRun = false): Promise<TenantLifecycleRow[]> {
  await initDb();

  // Enforce hard limit of 5 per run
  const candidates = await query<TenantLifecycleRow>(`
    SELECT
      t.id, t.slug, t.email, t.lifecycle_status, t.last_activity_at,
      t.deletion_scheduled_at,
      EXTRACT(EPOCH FROM (now() - t.last_activity_at))::int / 86400 AS days_inactive,
      (
        SELECT EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.tenant_id = t.id
            AND s.status IN ('active', 'trial')
            AND (s.status = 'active' OR s.trial_ends_at > now())
        )
      ) AS has_active_subscription
    FROM tenants t
    WHERE t.lifecycle_status = 'archived'
      AND t.deletion_scheduled_at IS NOT NULL
      AND t.deletion_scheduled_at < now()
      AND t.last_activity_at < now() - INTERVAL '90 days'
    ORDER BY t.last_activity_at ASC
    LIMIT 5
  `);

  // Never purge tenants with any subscription record regardless of status
  const hasSub = await query<{ tenant_id: number }>(
    `SELECT tenant_id FROM subscriptions WHERE tenant_id = ANY($1::int[])`,
    [candidates.map((r) => r.id)]
  );
  const subSet = new Set(hasSub.map((r) => r.tenant_id));
  const eligible = candidates.filter((r) => !r.has_active_subscription && !subSet.has(r.id));

  if (!dryRun && eligible.length > 0) {
    for (const r of eligible) {
      await withTransaction(async (client) => {
        // Final verification inside transaction — any subscription record blocks deletion
        const check = await client.query(
          `SELECT t.id
           FROM tenants t
           WHERE t.id = $1
             AND t.lifecycle_status = 'archived'
             AND t.last_activity_at < now() - INTERVAL '90 days'
             AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.tenant_id = t.id)`,
          [r.id]
        );

        if (check.rows.length === 0) return;

        // Log before delete
        await client.query(
          `INSERT INTO deletion_audit_log
             (tenant_id, tenant_slug, tenant_email, action, reason, last_activity_at, days_inactive, dry_run)
           VALUES ($1, $2, $3, 'purged', 'Archived 30+ days, inactive 90+ days, no subscription', $4, $5, false)`,
          [r.id, r.slug, r.email, r.last_activity_at, r.days_inactive]
        );

        await client.query(`DELETE FROM tenants WHERE id = $1`, [r.id]);
      });
    }
  }

  return eligible;
}

export interface CleanupReport {
  warned: TenantLifecycleRow[];
  archived: TenantLifecycleRow[];
  purged: TenantLifecycleRow[];
  dryRun: boolean;
  ranAt: string;
}

// ── Platform settings ─────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  await initDb();
  const row = await queryOne<{ value: string }>(
    "SELECT value FROM platform_settings WHERE key = $1",
    [key]
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await initDb();
  await pool.query(
    `INSERT INTO platform_settings (key, value, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now()`,
    [key, value]
  );
}

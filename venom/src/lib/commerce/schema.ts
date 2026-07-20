import { query } from "@/lib/db";

/**
 * Webero Commerce — domain schema (Fáze 1).
 *
 * Deliberately SEPARATE from src/lib/db.ts:
 *  - db.ts stays the platform core (tenants, pages, sections, billing) used by
 *    every one of the 90+ website templates,
 *  - commerce tables are initialised lazily, only when a commerce code path is
 *    touched (onboarding of an e-shop tenant, commerce API, commerce admin).
 *
 * Principles (docs/WEBERO_COMMERCE_CLAUDE_BRIEF.md):
 *  - product data lives here, never in sections.settings JSON,
 *  - orders store immutable snapshots (prices, VAT, addresses, line items),
 *  - every stock/price/order change is auditable (stock_movements, order_events,
 *    platform audit_log for product mutations),
 *  - all tables carry tenant_id and every query MUST filter by it.
 *
 * Money is stored as integer haléře/cents (`*_cents`), consistent with
 * gopay_payments.amount_cents. VAT rates are percent integers (21, 12, 0).
 */

let commerceInitialized = false;

export async function initCommerceDb(): Promise<void> {
  if (commerceInitialized) return;

  // query() runs initDb() first, so tenants/modules already exist.
  await query(`
    -- Diakritika (unaccent) + typo-tolerance (pg_trgm) pro vyhledávání
    CREATE EXTENSION IF NOT EXISTS unaccent;
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    -- ── Shops: tenant-level commerce settings (1:1 with commerce tenant) ──────
    CREATE TABLE IF NOT EXISTS shops (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL DEFAULT '',
      currency TEXT NOT NULL DEFAULT 'CZK',
      locale TEXT NOT NULL DEFAULT 'cs',
      -- 'inclusive' = ceny v katalogu včetně DPH (český B2C default)
      vat_mode TEXT NOT NULL DEFAULT 'inclusive',
      default_tax_rate INTEGER NOT NULL DEFAULT 21,
      order_number_prefix TEXT NOT NULL DEFAULT 'OBJ',
      order_number_seq INTEGER NOT NULL DEFAULT 0,
      company JSONB NOT NULL DEFAULT '{}',        -- IČO, DIČ, sídlo, bankovní účet
      legal JSONB NOT NULL DEFAULT '{}',          -- odkazy na obchodní podmínky, reklamační řád, GDPR
      settings JSONB NOT NULL DEFAULT '{}',       -- volné rozšíření bez migrace
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Categories (tree via parent_id) ────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS product_categories (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      parent_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      is_visible BOOLEAN NOT NULL DEFAULT true,
      sort_order INTEGER NOT NULL DEFAULT 0,
      seo_title TEXT,
      seo_description TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, slug)
    );

    -- ── Products ───────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      brand TEXT,
      status TEXT NOT NULL DEFAULT 'draft',       -- draft | active | archived
      tax_rate INTEGER,                            -- NULL → shop default
      primary_category_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
      -- Option definitions, e.g. [{"name":"Barva","values":["Černá","Bílá"]}].
      -- Normalizace do product_options/values je plánovaná pozdější migrace.
      options JSONB NOT NULL DEFAULT '[]',
      flags JSONB NOT NULL DEFAULT '{}',           -- featured, new, sale…
      seo_title TEXT,
      seo_description TEXT,
      og_image TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, slug)
    );

    CREATE TABLE IF NOT EXISTS product_category_links (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
      UNIQUE(product_id, category_id)
    );

    -- ── Variants: every product has >= 1 variant (is_default) ─────────────────
    CREATE TABLE IF NOT EXISTS product_variants (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      sku TEXT,
      ean TEXT,
      title TEXT,                                  -- "Černá / L"; NULL pro default variantu
      option_values JSONB NOT NULL DEFAULT '{}',   -- {"Barva":"Černá","Velikost":"L"}
      price_cents INTEGER NOT NULL DEFAULT 0,
      compare_at_price_cents INTEGER,              -- přeškrtnutá cena
      cost_cents INTEGER,                          -- nákupní cena (marže)
      weight_grams INTEGER,
      stock_qty INTEGER NOT NULL DEFAULT 0,
      stock_policy TEXT NOT NULL DEFAULT 'deny',   -- deny | continue (prodej do mínusu)
      track_stock BOOLEAN NOT NULL DEFAULT true,
      is_default BOOLEAN NOT NULL DEFAULT false,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Images ────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
      url TEXT NOT NULL,
      alt TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Stock audit trail (single-location Fáze 1; multi-sklad = Fáze 7) ──────
    CREATE TABLE IF NOT EXISTS stock_movements (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
      delta INTEGER NOT NULL,
      qty_after INTEGER NOT NULL,
      reason TEXT NOT NULL,                        -- manual | order | import | correction | return
      order_id INTEGER,                            -- FK volně (orders vzniká níže)
      note TEXT,
      actor_email TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Customers ─────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      phone TEXT,
      company JSONB NOT NULL DEFAULT '{}',         -- název, IČO, DIČ (B2B checkout)
      marketing_consent BOOLEAN NOT NULL DEFAULT false,
      note TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, email)
    );

    CREATE TABLE IF NOT EXISTS customer_addresses (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      kind TEXT NOT NULL DEFAULT 'shipping',       -- shipping | billing
      name TEXT,
      street TEXT,
      city TEXT,
      zip TEXT,
      country TEXT NOT NULL DEFAULT 'CZ',
      phone TEXT,
      is_default BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Orders: immutable header with full snapshots ──────────────────────────
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      order_number TEXT NOT NULL,
      customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      email TEXT NOT NULL,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'pending',      -- pending|confirmed|processing|shipped|completed|cancelled
      payment_status TEXT NOT NULL DEFAULT 'pending', -- pending|authorized|paid|failed|cancelled|refunded|partially_refunded
      fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled', -- unfulfilled|partial|fulfilled
      currency TEXT NOT NULL DEFAULT 'CZK',
      subtotal_cents INTEGER NOT NULL DEFAULT 0,
      discount_cents INTEGER NOT NULL DEFAULT 0,
      shipping_cents INTEGER NOT NULL DEFAULT 0,
      tax_cents INTEGER NOT NULL DEFAULT 0,        -- DPH obsažená v total (inclusive mode)
      total_cents INTEGER NOT NULL DEFAULT 0,
      billing_address JSONB NOT NULL DEFAULT '{}', -- snapshot, nikdy FK
      shipping_address JSONB NOT NULL DEFAULT '{}',
      shipping_method TEXT,
      payment_method TEXT,                          -- gopay | bank_transfer | cod | manual
      customer_note TEXT,
      admin_note TEXT,
      meta JSONB NOT NULL DEFAULT '{}',
      placed_at TIMESTAMPTZ DEFAULT now(),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, order_number)
    );

    -- ── Order line items: price/title/SKU snapshot at purchase time ───────────
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      variant_title TEXT,
      sku TEXT,
      qty INTEGER NOT NULL CHECK (qty > 0),
      unit_price_cents INTEGER NOT NULL,
      tax_rate INTEGER NOT NULL DEFAULT 21,
      total_cents INTEGER NOT NULL,
      meta JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Order timeline (audit) ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS order_events (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      type TEXT NOT NULL,                          -- created | status_changed | payment_* | note | …
      message TEXT,
      data JSONB NOT NULL DEFAULT '{}',
      actor_email TEXT,                            -- NULL = systém/zákazník
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Carts (Fáze 4: persistentní košík přes cookie token) ─────────────────
    CREATE TABLE IF NOT EXISTS carts (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'open',         -- open | converted | abandoned
      order_id INTEGER,                             -- po konverzi
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
      qty INTEGER NOT NULL CHECK (qty > 0),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(cart_id, variant_id)
    );

    -- ── Shop payments (Fáze 4: ODDĚLENĚ od subscription billingu) ────────────
    CREATE TABLE IF NOT EXISTS commerce_payments (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,                       -- gopay | bank_transfer | cod
      provider_payment_id TEXT,                     -- GoPay id
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CZK',
      status TEXT NOT NULL DEFAULT 'pending',       -- pending|created|paid|failed|cancelled|refunded
      gw_url TEXT,
      raw_response JSONB,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- ── Slug redirect history (SEO: staré URL produktů/kategorií → 301) ──────
    CREATE TABLE IF NOT EXISTS commerce_slug_redirects (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      entity_type TEXT NOT NULL,                   -- product | category
      from_slug TEXT NOT NULL,
      to_slug TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, entity_type, from_slug)
    );

    -- ── Search log (našeptávač: nejhledanější fráze) ──────────────────────────
    CREATE TABLE IF NOT EXISTS shop_search_queries (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      query TEXT NOT NULL,
      hits INTEGER NOT NULL DEFAULT 1,
      last_searched_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, query)
    );

    -- ── Indexes ───────────────────────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_shop_search_queries_tenant ON shop_search_queries(tenant_id, hits DESC);
    CREATE INDEX IF NOT EXISTS idx_shops_tenant ON shops(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_product_categories_tenant ON product_categories(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON product_categories(parent_id);
    CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_products_tenant_status ON products(tenant_id, status);
    CREATE INDEX IF NOT EXISTS idx_product_variants_tenant ON product_variants(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_category_links_tenant ON product_category_links(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_product_category_links_category ON product_category_links(category_id);
    CREATE INDEX IF NOT EXISTS idx_stock_movements_variant ON stock_movements(variant_id);
    CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_created ON stock_movements(tenant_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders(tenant_id, status);
    CREATE INDEX IF NOT EXISTS idx_orders_tenant_placed ON orders(tenant_id, placed_at DESC);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id);
    CREATE INDEX IF NOT EXISTS idx_commerce_slug_redirects_tenant ON commerce_slug_redirects(tenant_id);
  `);

  // Fáze 4 — idempotentní dodatky pro DB vytvořené Fází 1
  await query(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS public_token TEXT;
    CREATE INDEX IF NOT EXISTS idx_carts_tenant ON carts(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_carts_token ON carts(token);
    CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
    CREATE INDEX IF NOT EXISTS idx_commerce_payments_order ON commerce_payments(order_id);
    CREATE INDEX IF NOT EXISTS idx_commerce_payments_provider_id ON commerce_payments(provider_payment_id);
  `);

  // SKU unique per tenant (partial index — NULL SKUs allowed repeatedly)
  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_sku_unique
      ON product_variants(tenant_id, sku) WHERE sku IS NOT NULL;
  `);

  // Fáze 5 — kupóny / slevové kódy
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_coupons (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'percentage',
      value INTEGER NOT NULL DEFAULT 0,
      min_order_cents INTEGER,
      max_uses INTEGER,
      used_count INTEGER NOT NULL DEFAULT 0,
      applies_to TEXT NOT NULL DEFAULT 'order',
      valid_from TIMESTAMPTZ,
      valid_until TIMESTAMPTZ,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(tenant_id, code)
    );
    CREATE INDEX IF NOT EXISTS idx_commerce_coupons_tenant ON commerce_coupons(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_commerce_coupons_code ON commerce_coupons(tenant_id, code);
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS commerce_newsletter (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      unsubscribed_at TIMESTAMPTZ,
      UNIQUE(tenant_id, email)
    );

    CREATE TABLE IF NOT EXISTS commerce_reviews (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      author_email TEXT,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      title TEXT,
      body TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_commerce_reviews_product ON commerce_reviews(product_id, status);

    CREATE TABLE IF NOT EXISTS commerce_wishlist (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      session_token TEXT NOT NULL,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(tenant_id, session_token, product_id)
    );
    CREATE INDEX IF NOT EXISTS idx_commerce_wishlist_session ON commerce_wishlist(tenant_id, session_token);

    CREATE TABLE IF NOT EXISTS commerce_email_queue (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      order_id INTEGER,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      html_body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      sent_at TIMESTAMPTZ,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_commerce_email_queue_pending ON commerce_email_queue(status) WHERE status = 'pending';

    CREATE TABLE IF NOT EXISTS commerce_stock_notifications (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      variant_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      notified BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(tenant_id, variant_id, email)
    );

    -- ── Invoices: Czech-compliant invoice system with numbering series ──────
    CREATE TABLE IF NOT EXISTS commerce_invoice_series (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      prefix TEXT NOT NULL DEFAULT 'FV',
      year INTEGER NOT NULL,
      last_number INTEGER NOT NULL DEFAULT 0,
      format TEXT NOT NULL DEFAULT '{prefix}{year}{number:04}',
      UNIQUE(tenant_id, prefix, year)
    );

    CREATE TABLE IF NOT EXISTS commerce_invoices (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      invoice_number TEXT NOT NULL,
      invoice_type TEXT NOT NULL DEFAULT 'invoice',
      issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      taxable_date DATE NOT NULL DEFAULT CURRENT_DATE,
      due_date DATE NOT NULL DEFAULT (CURRENT_DATE + 14),

      -- Supplier (seller)
      supplier_name TEXT NOT NULL,
      supplier_ico TEXT,
      supplier_dic TEXT,
      supplier_address TEXT NOT NULL,
      supplier_city TEXT NOT NULL,
      supplier_zip TEXT NOT NULL,
      supplier_country TEXT NOT NULL DEFAULT 'CZ',
      supplier_bank_account TEXT,
      supplier_iban TEXT,
      supplier_swift TEXT,
      supplier_email TEXT,
      supplier_phone TEXT,
      supplier_registration TEXT,

      -- Customer (buyer)
      customer_name TEXT NOT NULL,
      customer_ico TEXT,
      customer_dic TEXT,
      customer_address TEXT,
      customer_city TEXT,
      customer_zip TEXT,
      customer_country TEXT DEFAULT 'CZ',
      customer_email TEXT,
      customer_phone TEXT,

      -- Payment
      payment_method TEXT,
      variable_symbol TEXT,
      constant_symbol TEXT DEFAULT '0308',
      specific_symbol TEXT,

      -- Totals
      subtotal_cents INTEGER NOT NULL DEFAULT 0,
      tax_cents INTEGER NOT NULL DEFAULT 0,
      total_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'CZK',
      rounding_cents INTEGER NOT NULL DEFAULT 0,

      -- Metadata
      note TEXT,
      internal_note TEXT,
      status TEXT NOT NULL DEFAULT 'issued',
      cancelled_at TIMESTAMPTZ,
      storno_invoice_id INTEGER REFERENCES commerce_invoices(id),

      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(tenant_id, invoice_number)
    );

    CREATE TABLE IF NOT EXISTS commerce_invoice_items (
      id SERIAL PRIMARY KEY,
      invoice_id INTEGER NOT NULL REFERENCES commerce_invoices(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      qty NUMERIC(10,2) NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'ks',
      unit_price_cents INTEGER NOT NULL,
      tax_rate INTEGER NOT NULL DEFAULT 21,
      tax_cents INTEGER NOT NULL DEFAULT 0,
      total_cents INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0
    );
  `);

  // ── Phase 6: Product parameters (filterable attributes) ──────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_param_definitions (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'text',
      unit TEXT,
      filterable BOOLEAN NOT NULL DEFAULT true,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, slug)
    );
    CREATE TABLE IF NOT EXISTS commerce_product_params (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      param_id INTEGER NOT NULL REFERENCES commerce_param_definitions(id) ON DELETE CASCADE,
      value TEXT NOT NULL,
      numeric_value NUMERIC,
      UNIQUE(product_id, param_id)
    );
    CREATE INDEX IF NOT EXISTS idx_product_params_product ON commerce_product_params(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_params_param ON commerce_product_params(param_id, value);
  `);

  // ── Phase 6: Customer auth (password login + order history) ─────────────
  await query(`
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS verify_token TEXT;
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS reset_token TEXT;
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMPTZ;
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
  `);

  // ── Phase 6: Gift cards ─────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_gift_cards (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      initial_cents INTEGER NOT NULL,
      balance_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CZK',
      purchaser_email TEXT,
      recipient_email TEXT,
      recipient_name TEXT,
      message TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, code)
    );
    CREATE TABLE IF NOT EXISTS commerce_gift_card_transactions (
      id SERIAL PRIMARY KEY,
      gift_card_id INTEGER NOT NULL REFERENCES commerce_gift_cards(id) ON DELETE CASCADE,
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      amount_cents INTEGER NOT NULL,
      balance_after_cents INTEGER NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_gift_cards_tenant ON commerce_gift_cards(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON commerce_gift_cards(tenant_id, code);
  `);

  // ── Phase 6: Loyalty program ────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_loyalty_accounts (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      points INTEGER NOT NULL DEFAULT 0,
      total_earned INTEGER NOT NULL DEFAULT 0,
      total_spent INTEGER NOT NULL DEFAULT 0,
      tier TEXT NOT NULL DEFAULT 'bronze',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, customer_id)
    );
    CREATE TABLE IF NOT EXISTS commerce_loyalty_transactions (
      id SERIAL PRIMARY KEY,
      account_id INTEGER NOT NULL REFERENCES commerce_loyalty_accounts(id) ON DELETE CASCADE,
      points INTEGER NOT NULL,
      type TEXT NOT NULL,
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_tenant ON commerce_loyalty_accounts(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_account ON commerce_loyalty_transactions(account_id);
  `);

  // ── Phase 6: Subscriptions / recurring orders ───────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_subscriptions (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'active',
      interval_days INTEGER NOT NULL DEFAULT 30,
      next_order_at TIMESTAMPTZ NOT NULL,
      shipping_address JSONB NOT NULL DEFAULT '{}',
      shipping_method TEXT,
      payment_method TEXT,
      discount_percent INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS commerce_subscription_items (
      id SERIAL PRIMARY KEY,
      subscription_id INTEGER NOT NULL REFERENCES commerce_subscriptions(id) ON DELETE CASCADE,
      variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
      qty INTEGER NOT NULL DEFAULT 1,
      price_cents_override INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON commerce_subscriptions(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_next ON commerce_subscriptions(status, next_order_at) WHERE status = 'active';
  `);

  // ── Phase 6: Webhooks ───────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_webhooks (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      events TEXT[] NOT NULL DEFAULT '{}',
      secret TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      last_triggered_at TIMESTAMPTZ,
      last_status INTEGER,
      fail_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS commerce_webhook_logs (
      id SERIAL PRIMARY KEY,
      webhook_id INTEGER NOT NULL REFERENCES commerce_webhooks(id) ON DELETE CASCADE,
      event TEXT NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}',
      response_status INTEGER,
      response_body TEXT,
      duration_ms INTEGER,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_webhooks_tenant ON commerce_webhooks(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook ON commerce_webhook_logs(webhook_id);
  `);

  // ── Phase 6: Abandoned cart tracking ────────────────────────────────────
  await query(`
    ALTER TABLE carts ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE carts ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
    ALTER TABLE carts ADD COLUMN IF NOT EXISTS reminder_count INTEGER NOT NULL DEFAULT 0;
  `);

  // ── Modul chytre-vyhledavani: statistiky hledání ────────────────────────
  // hits = potvrzená hledání (Enter/klik), suggest_count = dotazy našeptávače,
  // results_count = počet výsledků při posledním hledání (0 = bez výsledků).
  await query(`
    ALTER TABLE shop_search_queries ADD COLUMN IF NOT EXISTS suggest_count INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE shop_search_queries ADD COLUMN IF NOT EXISTS results_count INTEGER;
  `);

  // ── Phase 6: A/B testing ────────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_ab_tests (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      variant_a JSONB NOT NULL DEFAULT '{}',
      variant_b JSONB NOT NULL DEFAULT '{}',
      traffic_split INTEGER NOT NULL DEFAULT 50,
      views_a INTEGER NOT NULL DEFAULT 0,
      views_b INTEGER NOT NULL DEFAULT 0,
      conversions_a INTEGER NOT NULL DEFAULT 0,
      conversions_b INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      started_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ,
      winner TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_ab_tests_tenant ON commerce_ab_tests(tenant_id);
  `);

  // ── Phase 6: Multi-language product translations ────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_translations (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      locale TEXT NOT NULL,
      field TEXT NOT NULL,
      value TEXT NOT NULL,
      UNIQUE(tenant_id, entity_type, entity_id, locale, field)
    );
    CREATE INDEX IF NOT EXISTS idx_translations_entity ON commerce_translations(tenant_id, entity_type, entity_id, locale);
  `);

  // Commerce modules registry — core included features are free (brief:
  // "nesmi uzivatele trestat za zakladni e-shopove funkce").
  await query(`
    INSERT INTO modules (key, name, version, pricing_tier, enabled_by_default) VALUES
      ('commerce-core', 'E-shop — jádro', '1.0.0', 'free', false),
      ('commerce-products', 'E-shop — produkty', '1.0.0', 'free', false),
      ('commerce-orders', 'E-shop — objednávky', '1.0.0', 'free', false),
      ('commerce-checkout', 'E-shop — pokladna', '1.0.0', 'free', false),
      ('commerce-payments', 'E-shop — platby', '1.0.0', 'free', false),
      ('commerce-shipping', 'E-shop — doprava', '1.0.0', 'free', false),
      ('commerce-feeds', 'E-shop — feedy', '1.0.0', 'free', false)
    ON CONFLICT (key) DO NOTHING
  `);

  commerceInitialized = true;
}

/** Module keys auto-enabled for every commerce tenant. */
export const COMMERCE_CORE_MODULES = [
  "commerce-core",
  "commerce-products",
  "commerce-orders",
  "commerce-checkout",
  "commerce-payments",
  "commerce-shipping",
  "commerce-feeds",
] as const;

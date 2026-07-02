"use strict";exports.id=8374,exports.ids=[8374],exports.modules={78374:(T,E,N)=>{N.a(T,async(T,L)=>{try{N.d(E,{Gg:()=>i,oT:()=>O,pI:()=>_,pk:()=>n});var e=N(9463),a=N(98040),t=T([a]);async function i(){let T=await (0,e.cookies)(),E=T.get("fak_session")?.value;if(!E)return null;let N=Math.floor(Date.now()/1e3),{rows:L}=await (0,a.IO)(`SELECT s.token, u.id, u.email, u.name
     FROM fak_sessions s
     JOIN fak_users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > $2`,[E,N]);return L[0]??null}async function O(){let T=await i();if(!T)throw Error("UNAUTHORIZED");return T}async function n(T){let{rows:E}=await (0,a.IO)("SELECT * FROM fak_companies WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1",[T]);return E[0]??null}async function _(T){let{rows:E}=await (0,a.IO)("SELECT * FROM fak_subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",[T]);return E[0]??{plan:"free",status:"active"}}a=(t.then?(await t)():t)[0],L()}catch(T){L(T)}})},98040:(T,E,N)=>{N.a(T,async(T,L)=>{try{N.d(E,{Dv:()=>i,IO:()=>t});var e=N(8678),a=T([e]);let O=new(e=(a.then?(await a)():a)[0]).Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1},max:3,idleTimeoutMillis:1e4,connectionTimeoutMillis:15e3});async function t(T,E){try{return await O.query(T,E)}catch(N){if(N?.code==="57P01"||/terminating|connection|ECONNRESET|timeout/i.test(N?.message||""))return await new Promise(T=>setTimeout(T,500)),await O.query(T,E);throw N}}async function i(){await O.query(`
    -- Users
    CREATE TABLE IF NOT EXISTS fak_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Sessions
    CREATE TABLE IF NOT EXISTS fak_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES fak_users(id) ON DELETE CASCADE,
      expires_at BIGINT NOT NULL
    );

    -- Subscriptions
    CREATE TABLE IF NOT EXISTS fak_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES fak_users(id) ON DELETE CASCADE,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      stripe_price_id TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
      current_period_start BIGINT,
      current_period_end BIGINT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );
    ALTER TABLE fak_subscriptions ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
    ALTER TABLE fak_subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;
    DO $$
    BEGIN
      IF to_regclass('public.fak_invoices') IS NOT NULL THEN
        ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS note_before_items TEXT;
        ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS footer_text TEXT;
        ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'bank';
        ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS order_number TEXT;
      END IF;
    END $$;

    -- Companies
    CREATE TABLE IF NOT EXISTS fak_companies (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES fak_users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      ico TEXT,
      dic TEXT,
      address TEXT,
      city TEXT,
      zip TEXT,
      country TEXT NOT NULL DEFAULT 'CZ',
      bank_account TEXT,
      iban TEXT,
      swift TEXT,
      logo_url TEXT,
      vat_status TEXT NOT NULL DEFAULT 'non_vat',
      default_currency TEXT NOT NULL DEFAULT 'CZK',
      default_due_days INTEGER NOT NULL DEFAULT 14,
      invoice_prefix TEXT NOT NULL DEFAULT 'FA',
      invoice_next INTEGER NOT NULL DEFAULT 1,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS vat_status TEXT NOT NULL DEFAULT 'non_vat';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_template TEXT NOT NULL DEFAULT 'modern';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_color TEXT NOT NULL DEFAULT '#4f46e5';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_footer TEXT;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_note_before TEXT;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS onboarded BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_padding INTEGER NOT NULL DEFAULT 4;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS features JSONB;

    -- Clients
    CREATE TABLE IF NOT EXISTS fak_clients (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      ico TEXT,
      dic TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      zip TEXT,
      country TEXT NOT NULL DEFAULT 'CZ',
      archived BOOLEAN NOT NULL DEFAULT false,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Invoices
    CREATE TABLE IF NOT EXISTS fak_invoices (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES fak_clients(id),
      number TEXT NOT NULL,
      variable_symbol TEXT,
      type TEXT NOT NULL DEFAULT 'invoice',
      status TEXT NOT NULL DEFAULT 'draft',
      currency TEXT NOT NULL DEFAULT 'CZK',
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      taxable_date TEXT,
      subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_total NUMERIC(12,2) NOT NULL DEFAULT 0,
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      note TEXT,
      note_before_items TEXT,
      footer_text TEXT,
      payment_method TEXT NOT NULL DEFAULT 'bank',
      order_number TEXT,
      public_token TEXT UNIQUE,
      viewed_at BIGINT,
      paid_at BIGINT,
      sent_at BIGINT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Invoice Items
    CREATE TABLE IF NOT EXISTS fak_invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES fak_invoices(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity NUMERIC(12,4) NOT NULL DEFAULT 1,
      unit TEXT,
      unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_rate INTEGER NOT NULL DEFAULT 0,
      total_without_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_with_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- Reminder Settings
    CREATE TABLE IF NOT EXISTS fak_reminder_settings (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL UNIQUE REFERENCES fak_companies(id) ON DELETE CASCADE,
      before_due_enabled BOOLEAN NOT NULL DEFAULT true,
      due_day_enabled BOOLEAN NOT NULL DEFAULT true,
      after_3_days_enabled BOOLEAN NOT NULL DEFAULT true,
      after_10_days_enabled BOOLEAN NOT NULL DEFAULT true,
      after_20_days_enabled BOOLEAN NOT NULL DEFAULT false,
      email_template_before_due TEXT NOT NULL DEFAULT 'Dobr\xfd den,

chtěli jsme v\xe1s upozornit, že faktura č. {{number}} je splatn\xe1 za 3 dny ({{dueDate}}).

Celkov\xe1 č\xe1stka: {{total}} {{currency}}

Děkujeme za včasnou platbu.',
      email_template_due_day TEXT NOT NULL DEFAULT 'Dobr\xfd den,

dnes je posledn\xed den splatnosti faktury č. {{number}}.

Celkov\xe1 č\xe1stka: {{total}} {{currency}}

Pros\xedme o uhrazen\xed faktury.',
      email_template_after_due TEXT NOT NULL DEFAULT 'Dobr\xfd den,

dovolujeme si upozornit, že faktura č. {{number}} je po splatnosti.

Celkov\xe1 č\xe1stka: {{total}} {{currency}}

Pros\xedme o neprodlen\xe9 uhrazen\xed faktury.'
    );

    -- Reminder Log
    CREATE TABLE IF NOT EXISTS fak_reminder_log (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES fak_invoices(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      sent_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      status TEXT NOT NULL DEFAULT 'sent'
    );

    CREATE TABLE IF NOT EXISTS fak_email_log (
      id TEXT PRIMARY KEY,
      company_id TEXT REFERENCES fak_companies(id) ON DELETE CASCADE,
      invoice_id TEXT REFERENCES fak_invoices(id) ON DELETE SET NULL,
      quote_id TEXT,
      type TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT,
      status TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'resend',
      provider_message_id TEXT,
      error TEXT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );
    CREATE INDEX IF NOT EXISTS fak_email_log_company_idx ON fak_email_log(company_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS fak_automation_runs (
      id TEXT PRIMARY KEY,
      company_id TEXT REFERENCES fak_companies(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      finished_at BIGINT,
      summary JSONB,
      error TEXT
    );
    CREATE INDEX IF NOT EXISTS fak_automation_runs_type_idx ON fak_automation_runs(type, started_at DESC);

    -- Recurring Invoices
    CREATE TABLE IF NOT EXISTS fak_recurring_invoices (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES fak_clients(id),
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      next_issue_date TEXT,
      end_date TEXT,
      period TEXT NOT NULL DEFAULT 'monthly',
      active BOOLEAN NOT NULL DEFAULT true,
      send_by_email BOOLEAN NOT NULL DEFAULT false,
      as_proforma BOOLEAN NOT NULL DEFAULT false,
      due_days INTEGER NOT NULL DEFAULT 14,
      currency TEXT NOT NULL DEFAULT 'CZK',
      note TEXT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    CREATE TABLE IF NOT EXISTS fak_recurring_invoice_items (
      id TEXT PRIMARY KEY,
      recurring_invoice_id TEXT NOT NULL REFERENCES fak_recurring_invoices(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity NUMERIC(12,4) NOT NULL DEFAULT 1,
      unit TEXT,
      unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_rate INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- Audit Log
    CREATE TABLE IF NOT EXISTS fak_audit_log (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      meta JSONB,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Bank Accounts (multiple per company)
    CREATE TABLE IF NOT EXISTS fak_bank_accounts (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      bank_account TEXT,
      iban TEXT,
      swift TEXT,
      currency TEXT NOT NULL DEFAULT 'CZK',
      is_default BOOLEAN NOT NULL DEFAULT false,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Bank API connections and imported movements
    CREATE TABLE IF NOT EXISTS fak_bank_connections (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      bank_account_id TEXT NOT NULL REFERENCES fak_bank_accounts(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      name TEXT NOT NULL,
      token_encrypted TEXT,
      last_transaction_id TEXT,
      last_sync_at BIGINT,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    CREATE TABLE IF NOT EXISTS fak_bank_transactions (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      bank_connection_id TEXT NOT NULL REFERENCES fak_bank_connections(id) ON DELETE CASCADE,
      provider_transaction_id TEXT NOT NULL,
      booking_date TEXT,
      amount NUMERIC(12,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CZK',
      account_number TEXT,
      bank_code TEXT,
      variable_symbol TEXT,
      message TEXT,
      raw JSONB,
      matched_invoice_id TEXT REFERENCES fak_invoices(id),
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      UNIQUE(bank_connection_id, provider_transaction_id)
    );
    CREATE INDEX IF NOT EXISTS fak_bank_transactions_company_idx ON fak_bank_transactions(company_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS fak_bank_transactions_vs_idx ON fak_bank_transactions(company_id, variable_symbol);

    -- Tags
    CREATE TABLE IF NOT EXISTS fak_tags (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#4f46e5',
      UNIQUE(company_id, name)
    );

    -- Invoice Tags (junction)
    CREATE TABLE IF NOT EXISTS fak_invoice_tags (
      invoice_id TEXT NOT NULL REFERENCES fak_invoices(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES fak_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (invoice_id, tag_id)
    );

    -- Expenses (N\xe1klady)
    CREATE TABLE IF NOT EXISTS fak_expenses (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      supplier_name TEXT,
      supplier_ico TEXT,
      number TEXT,
      variable_symbol TEXT,
      currency TEXT NOT NULL DEFAULT 'CZK',
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      taxable_date TEXT,
      subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_total NUMERIC(12,2) NOT NULL DEFAULT 0,
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'unpaid',
      payment_method TEXT NOT NULL DEFAULT 'bank',
      note TEXT,
      paid_at BIGINT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Expense Items
    CREATE TABLE IF NOT EXISTS fak_expense_items (
      id TEXT PRIMARY KEY,
      expense_id TEXT NOT NULL REFERENCES fak_expenses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity NUMERIC(12,4) NOT NULL DEFAULT 1,
      unit TEXT,
      unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_rate INTEGER NOT NULL DEFAULT 0,
      total_without_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_with_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- Quotes (Nab\xeddky)
    CREATE TABLE IF NOT EXISTS fak_quotes (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES fak_clients(id),
      number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      currency TEXT NOT NULL DEFAULT 'CZK',
      issue_date TEXT NOT NULL,
      valid_until TEXT,
      language TEXT NOT NULL DEFAULT 'cs',
      note TEXT,
      note_before_items TEXT,
      footer_text TEXT,
      subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_total NUMERIC(12,2) NOT NULL DEFAULT 0,
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      converted_invoice_id TEXT REFERENCES fak_invoices(id),
      public_token TEXT UNIQUE,
      viewed_at BIGINT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Quote Items
    CREATE TABLE IF NOT EXISTS fak_quote_items (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL REFERENCES fak_quotes(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity NUMERIC(12,4) NOT NULL DEFAULT 1,
      unit TEXT,
      unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_rate INTEGER NOT NULL DEFAULT 0,
      total_without_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_with_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- Invoice Templates (Šablony)
    CREATE TABLE IF NOT EXISTS fak_invoice_templates (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      client_id TEXT REFERENCES fak_clients(id),
      currency TEXT NOT NULL DEFAULT 'CZK',
      due_days INTEGER NOT NULL DEFAULT 14,
      language TEXT NOT NULL DEFAULT 'cs',
      note TEXT,
      note_before_items TEXT,
      footer_text TEXT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    CREATE TABLE IF NOT EXISTS fak_invoice_template_items (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL REFERENCES fak_invoice_templates(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity NUMERIC(12,4) NOT NULL DEFAULT 1,
      unit TEXT,
      unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_rate INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS fak_notifications (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      entity_type TEXT,
      entity_id TEXT,
      resolved BOOLEAN NOT NULL DEFAULT false,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Invoice Attachments
    CREATE TABLE IF NOT EXISTS fak_invoice_attachments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES fak_invoices(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- New company columns
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_number_year_format TEXT NOT NULL DEFAULT 'full';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_number_month BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_number_position TEXT NOT NULL DEFAULT 'end';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_number_volume INTEGER NOT NULL DEFAULT 10000;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_number_separator TEXT NOT NULL DEFAULT '-';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_spacing TEXT NOT NULL DEFAULT 'spacious';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS stamp_url TEXT;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS default_language TEXT NOT NULL DEFAULT 'cs';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS show_qr_payment BOOLEAN NOT NULL DEFAULT true;

    -- New invoice columns
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS note_before_items TEXT;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS footer_text TEXT;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'bank';
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS order_number TEXT;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'cs';
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS reverse_charge BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2);
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(5,2);
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS show_already_paid BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS invoice_template TEXT;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS invoice_color TEXT;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS bank_account_id TEXT REFERENCES fak_bank_accounts(id);
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS show_iban TEXT NOT NULL DEFAULT 'auto';

    -- Quote tags junction
    CREATE TABLE IF NOT EXISTS fak_quote_tags (
      quote_id TEXT NOT NULL REFERENCES fak_quotes(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES fak_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (quote_id, tag_id)
    );
  `)}L()}catch(T){L(T)}})}};
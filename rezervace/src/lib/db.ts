import { neon } from '@neondatabase/serverless'

// Lazy singleton – neon() is called only on first query, not at module load
let _sql: ReturnType<typeof neon> | null = null

function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not configured')
    _sql = neon(url)
  }
  return _sql
}

// Tagged-template sql helper with permissive return type for easy use
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (getSql() as any)(strings, ...values)
}

// Migrace NEPATŘÍ do cesty požadavku. Všech 33 DDL příkazů se dřív pouštělo při
// každém volání API; po zavedení memoizace za to platil aspoň každý studený
// start — naměřeno 13,5 s na prvním požadavku nové instance.
//
// V produkci proto schéma zakládáme jen na výslovné vyžádání (POST /api/db/init
// nebo DB_AUTO_MIGRATE=1). Ve vývoji zůstává automatika, aby se s novou databází
// nemuselo nic řešit. Memo drží rozpracovaný slib, takže souběžné požadavky
// čekají na tentýž průchod; při chybě se zahodí, ať jde zkusit znovu.
let _initPromise: Promise<void> | null = null

const AUTO_MIGRATE =
  process.env.DB_AUTO_MIGRATE === '1' || process.env.NODE_ENV !== 'production'

export async function initDb(force = false): Promise<void> {
  if (!force && !AUTO_MIGRATE) return
  if (!_initPromise) {
    _initPromise = runMigrations().catch((err) => {
      _initPromise = null
      throw err
    })
  }
  return _initPromise
}

async function runMigrations() {
  const s = getSql()

  await s`
    CREATE TABLE IF NOT EXISTS rez_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      avatar_color TEXT DEFAULT '#c084fc',
      bio TEXT DEFAULT '',
      timezone TEXT DEFAULT 'Europe/Prague',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await s`
    CREATE TABLE IF NOT EXISTS rez_services (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES rez_users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      duration_minutes INT NOT NULL DEFAULT 60,
      price NUMERIC(10,2) DEFAULT 0,
      currency TEXT DEFAULT 'CZK',
      color TEXT DEFAULT '#006bff',
      image_url TEXT DEFAULT '',
      is_active BOOLEAN DEFAULT true,
      sort_order INT DEFAULT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await s`
    CREATE TABLE IF NOT EXISTS rez_availability (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES rez_users(id) ON DELETE CASCADE,
      day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      start_time TIME NOT NULL DEFAULT '09:00',
      end_time TIME NOT NULL DEFAULT '17:00',
      is_active BOOLEAN DEFAULT true,
      UNIQUE(user_id, day_of_week)
    )
  `

  await s`
    CREATE TABLE IF NOT EXISTS rez_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service_id UUID NOT NULL REFERENCES rez_services(id),
      provider_id UUID NOT NULL REFERENCES rez_users(id),
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT DEFAULT '',
      client_notes TEXT DEFAULT '',
      booking_date DATE NOT NULL,
      start_time TIME NOT NULL,
      duration_minutes INT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      price NUMERIC(10,2) DEFAULT 0,
      currency TEXT DEFAULT 'CZK',
      payment_status TEXT DEFAULT 'pending',
      confirmation_token TEXT UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await s`
    CREATE TABLE IF NOT EXISTS rez_availability_overrides (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES rez_users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      is_available BOOLEAN NOT NULL DEFAULT false,
      start_time TIME,
      end_time TIME,
      note TEXT DEFAULT '',
      UNIQUE(user_id, date)
    )
  `

  await s`
    CREATE TABLE IF NOT EXISTS rez_staff (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES rez_users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6366f1',
      bio TEXT DEFAULT '',
      is_active BOOLEAN DEFAULT true,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await s`
    CREATE TABLE IF NOT EXISTS rez_staff_availability (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      staff_id UUID NOT NULL REFERENCES rez_staff(id) ON DELETE CASCADE,
      day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      start_time TIME NOT NULL DEFAULT '09:00',
      end_time TIME NOT NULL DEFAULT '17:00',
      is_active BOOLEAN DEFAULT true,
      UNIQUE(staff_id, day_of_week)
    )
  `

  await s`
    CREATE TABLE IF NOT EXISTS rez_staff_availability_overrides (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      staff_id UUID NOT NULL REFERENCES rez_staff(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      is_available BOOLEAN NOT NULL DEFAULT false,
      start_time TIME,
      end_time TIME,
      note TEXT DEFAULT '',
      UNIQUE(staff_id, date)
    )
  `

  // Poptávky / přihlášky — režimy widgetu bez pevného slotu (inquiry, course,
  // table, stay). Na rozdíl od rez_bookings tu není booking_date/start_time jako
  // povinnost: majitel poptávku potvrzuje ručně. Strukturovaná pole (party_size,
  // preferred_*, check_in/out) jsou nepovinná a plní se dle režimu.
  await s`
    CREATE TABLE IF NOT EXISTS rez_inquiries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID NOT NULL REFERENCES rez_users(id) ON DELETE CASCADE,
      service_id UUID REFERENCES rez_services(id) ON DELETE SET NULL,
      mode TEXT NOT NULL DEFAULT 'inquiry',
      subject TEXT DEFAULT '',
      client_name TEXT NOT NULL,
      client_email TEXT DEFAULT '',
      client_phone TEXT DEFAULT '',
      client_notes TEXT DEFAULT '',
      party_size INT,
      preferred_date DATE,
      preferred_time TEXT DEFAULT '',
      check_in DATE,
      check_out DATE,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Migrations for existing tables
  await s`ALTER TABLE rez_services ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT ''`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT ''`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS min_booking_hours INT DEFAULT 0`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS buffer_minutes INT DEFAULT 0`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES rez_staff(id)`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS staff_name TEXT DEFAULT ''`
  await s`ALTER TABLE rez_staff ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT ''`
  await s`ALTER TABLE rez_services ADD COLUMN IF NOT EXISTS is_addon BOOLEAN DEFAULT false`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS payment_cash BOOLEAN DEFAULT true`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS payment_transfer BOOLEAN DEFAULT false`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS bank_iban TEXT DEFAULT ''`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS bank_owner TEXT DEFAULT ''`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS payment_note TEXT DEFAULT ''`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT ''`
  // Povinnost kontaktních polí — řídí admin, respektuje veřejný formulář i widget
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS require_email BOOLEAN DEFAULT true`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS require_phone BOOLEAN DEFAULT false`
  // Párovací klíč pro připojení webu (widget na cizí doméně). Ověřuje vlastnictví
  // účtu při propojení a zároveň autorizuje serverová volání /api/connect/*, aby
  // majitel spravoval rezervace z administrace svého webu. Posílá ho výhradně
  // server webu — do prohlížeče návštěvníka se nikdy nedostane.
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS connection_key TEXT`
  await s`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_connection_key ON rez_users(connection_key) WHERE connection_key IS NOT NULL`

  // --- Rozšíření: platby předem / zálohy, SMS, iCal feed, jazyk ---
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS require_deposit BOOLEAN DEFAULT false`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS deposit_percent INT DEFAULT 0`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS sms_reminders BOOLEAN DEFAULT false`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS reminder_hours INT DEFAULT 24`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS ical_token TEXT`
  await s`ALTER TABLE rez_users ADD COLUMN IF NOT EXISTS default_locale TEXT DEFAULT 'cs'`
  await s`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_ical_token ON rez_users(ical_token) WHERE ical_token IS NOT NULL`

  // --- Rozšíření rezervací: záloha, platební brána, kupón, SMS, recurring, recenze, GDPR ---
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10,2) DEFAULT 0`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS stripe_session_id TEXT DEFAULT ''`
  // Obecný odkaz na platbu u brány (Stripe session id / GoPay payment id) + která brána
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT ''`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT ''`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS sms_reminder_sent BOOLEAN DEFAULT false`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS recurring_group_id UUID`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS review_token TEXT`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS review_request_sent BOOLEAN DEFAULT false`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS reactivation_sent BOOLEAN DEFAULT false`
  await s`ALTER TABLE rez_bookings ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ`

  // Slevové kódy poskytovatele
  await s`
    CREATE TABLE IF NOT EXISTS rez_coupons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES rez_users(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'percent',
      value NUMERIC(10,2) NOT NULL DEFAULT 0,
      max_uses INT DEFAULT NULL,
      used_count INT NOT NULL DEFAULT 0,
      valid_until DATE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, code)
    )
  `

  // Dárkové poukazy (kredit s kódem, postupné čerpání)
  await s`
    CREATE TABLE IF NOT EXISTS rez_vouchers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES rez_users(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      initial_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      remaining_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      currency TEXT DEFAULT 'CZK',
      recipient_name TEXT DEFAULT '',
      recipient_email TEXT DEFAULT '',
      purchaser_email TEXT DEFAULT '',
      note TEXT DEFAULT '',
      valid_until DATE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, code)
    )
  `

  // Recenze klientů (žádost odchází po dokončeném termínu, majitel publikuje)
  await s`
    CREATE TABLE IF NOT EXISTS rez_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID NOT NULL REFERENCES rez_users(id) ON DELETE CASCADE,
      booking_id UUID REFERENCES rez_bookings(id) ON DELETE SET NULL,
      client_name TEXT NOT NULL,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT DEFAULT '',
      is_published BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Čekací listina na plné termíny
  await s`
    CREATE TABLE IF NOT EXISTS rez_waitlist (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID NOT NULL REFERENCES rez_users(id) ON DELETE CASCADE,
      service_id UUID REFERENCES rez_services(id) ON DELETE SET NULL,
      staff_id UUID REFERENCES rez_staff(id) ON DELETE SET NULL,
      client_name TEXT NOT NULL,
      client_email TEXT DEFAULT '',
      client_phone TEXT DEFAULT '',
      desired_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting',
      notify_token TEXT UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
      notified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Opakované (stálé) termíny — pravidlo, ze kterého se generují rezervace dopředu
  await s`
    CREATE TABLE IF NOT EXISTS rez_recurring_series (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID NOT NULL REFERENCES rez_users(id) ON DELETE CASCADE,
      service_id UUID NOT NULL REFERENCES rez_services(id) ON DELETE CASCADE,
      staff_id UUID REFERENCES rez_staff(id) ON DELETE SET NULL,
      client_name TEXT NOT NULL,
      client_email TEXT DEFAULT '',
      client_phone TEXT DEFAULT '',
      day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      start_time TIME NOT NULL,
      interval_weeks INT NOT NULL DEFAULT 1,
      until_date DATE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Log odeslaných SMS (audit + prevence duplicit)
  await s`
    CREATE TABLE IF NOT EXISTS rez_sms_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID REFERENCES rez_users(id) ON DELETE SET NULL,
      booking_id UUID REFERENCES rez_bookings(id) ON DELETE SET NULL,
      phone TEXT NOT NULL,
      body TEXT NOT NULL,
      kind TEXT DEFAULT 'reminder',
      status TEXT DEFAULT 'sent',
      provider_ref TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Indexes
  await s`CREATE INDEX IF NOT EXISTS idx_bookings_provider ON rez_bookings(provider_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_bookings_date ON rez_bookings(booking_date)`
  await s`CREATE INDEX IF NOT EXISTS idx_services_user ON rez_services(user_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_availability_user ON rez_availability(user_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_staff_user ON rez_staff(user_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_staff_avail_staff ON rez_staff_availability(staff_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_inquiries_provider ON rez_inquiries(provider_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_inquiries_status ON rez_inquiries(status)`
  await s`CREATE INDEX IF NOT EXISTS idx_coupons_user ON rez_coupons(user_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_vouchers_user ON rez_vouchers(user_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_reviews_provider ON rez_reviews(provider_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_waitlist_provider ON rez_waitlist(provider_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_recurring_provider ON rez_recurring_series(provider_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_bookings_email ON rez_bookings(client_email)`

  // Prevence dvojité rezervace na úrovni DB (poslední pojistka proti race condition
  // mezi kontrolou konfliktu a INSERTem). Blokuje shodné (poskytovatel, pracovník,
  // datum, čas) mezi nezrušenými rezervacemi. staff_id může být NULL → COALESCE na
  // nulové UUID, aby index fungoval i bez pracovníka. Obaleno v try/catch: kdyby v
  // datech existovaly staré duplicity, index se nevytvoří, ale zbytek migrace projde.
  try {
    await s`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_slot_unique
      ON rez_bookings (
        provider_id,
        COALESCE(staff_id, '00000000-0000-0000-0000-000000000000'::uuid),
        booking_date,
        start_time
      )
      WHERE status != 'cancelled'
    `
  } catch (err) {
    console.warn('idx_bookings_slot_unique se nepodařilo vytvořit (nejspíš existující duplicity):', err)
  }
}

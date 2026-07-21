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

  // Indexes
  await s`CREATE INDEX IF NOT EXISTS idx_bookings_provider ON rez_bookings(provider_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_bookings_date ON rez_bookings(booking_date)`
  await s`CREATE INDEX IF NOT EXISTS idx_services_user ON rez_services(user_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_availability_user ON rez_availability(user_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_staff_user ON rez_staff(user_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_staff_avail_staff ON rez_staff_availability(staff_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_inquiries_provider ON rez_inquiries(provider_id)`
  await s`CREATE INDEX IF NOT EXISTS idx_inquiries_status ON rez_inquiries(status)`
}

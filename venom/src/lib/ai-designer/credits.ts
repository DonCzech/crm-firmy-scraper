/**
 * AI Designér — kreditní peněženka.
 *
 * Garance proti přečerpání:
 *  - `holdCredits` je jediná cesta, jak spotřebovat kredity, a je to JEDEN
 *    atomický UPDATE s podmínkou `balance >= amount` — souběžné požadavky se
 *    nikdy nedostanou pod nulu (CHECK constraint je druhá pojistka).
 *  - AI se volá až PO úspěšné rezervaci; při chybě se rezervace vrací.
 *  - Dobití je idempotentní přes unikátní index na (order_number, kind=topup):
 *    webhook i return route mohou dorazit vícekrát, kredit se připíše jednou.
 */
import { query, queryOne } from "@/lib/db";
import { WELCOME_CREDITS } from "./pricing";

export interface Wallet {
  balance: number;
  reserved: number;
}

export async function getWallet(tenantId: number): Promise<Wallet> {
  const row = await queryOne<{ balance: number; reserved: number }>(
    `INSERT INTO ai_credit_wallets (tenant_id, balance)
     VALUES ($1, $2)
     ON CONFLICT (tenant_id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id
     RETURNING balance, reserved`,
    [tenantId, WELCOME_CREDITS]
  );
  return { balance: row?.balance ?? 0, reserved: row?.reserved ?? 0 };
}

/**
 * Atomická rezervace kreditů. Vrací true jen pokud byl zůstatek dostatečný.
 * Race-safe: podmínka je součástí UPDATE, dva souběžné požadavky si nemohou
 * rezervovat tytéž kredity.
 */
export async function holdCredits(tenantId: number, amount: number, requestId: number): Promise<boolean> {
  if (!Number.isInteger(amount) || amount <= 0) return false;
  await getWallet(tenantId); // zajistí existenci řádku (včetně welcome kreditů)

  const rows = await query<{ tenant_id: number }>(
    `UPDATE ai_credit_wallets
        SET balance = balance - $2, reserved = reserved + $2, updated_at = now()
      WHERE tenant_id = $1 AND balance >= $2
      RETURNING tenant_id`,
    [tenantId, amount]
  );
  if (rows.length === 0) return false;

  await query(
    `INSERT INTO ai_credit_ledger (tenant_id, kind, amount, request_id, note)
     VALUES ($1, 'hold', $2, $3, 'Rezervace před AI požadavkem')`,
    [tenantId, -amount, requestId]
  );
  return true;
}

/** Úspěšné dokončení: rezervace se promění ve skutečnou útratu. */
export async function settleHold(tenantId: number, amount: number, requestId: number): Promise<void> {
  await query(
    `UPDATE ai_credit_wallets
        SET reserved = GREATEST(reserved - $2, 0), updated_at = now()
      WHERE tenant_id = $1`,
    [tenantId, amount]
  );
  await query(
    `INSERT INTO ai_credit_ledger (tenant_id, kind, amount, request_id, note)
     VALUES ($1, 'settle', 0, $2, 'AI požadavek dokončen')`,
    [tenantId, requestId]
  );
}

/** Neúspěch (chyba AI, validace, síť): plná vratka rezervace. */
export async function releaseHold(tenantId: number, amount: number, requestId: number, reason: string): Promise<void> {
  await query(
    `UPDATE ai_credit_wallets
        SET balance = balance + $2, reserved = GREATEST(reserved - $2, 0), updated_at = now()
      WHERE tenant_id = $1`,
    [tenantId, amount]
  );
  await query(
    `INSERT INTO ai_credit_ledger (tenant_id, kind, amount, request_id, note)
     VALUES ($1, 'release', $2, $3, $4)`,
    [tenantId, amount, requestId, `Vratka: ${reason}`.slice(0, 300)]
  );
}

/**
 * Idempotentní připsání kreditů po zaplacené GoPay platbě.
 * Vrací true, pokud byl kredit připsán TEĎ (false = už připsáno dříve).
 */
export async function creditTopup(tenantId: number, orderNumber: string, credits: number): Promise<boolean> {
  await getWallet(tenantId);

  const inserted = await query<{ id: number }>(
    `INSERT INTO ai_credit_ledger (tenant_id, kind, amount, order_number, note)
     VALUES ($1, 'topup', $2, $3, 'Dobití kreditů (GoPay)')
     ON CONFLICT (order_number) WHERE kind = 'topup' DO NOTHING
     RETURNING id`,
    [tenantId, credits, orderNumber]
  );
  if (inserted.length === 0) return false; // duplicitní webhook — už připsáno

  await query(
    `UPDATE ai_credit_wallets
        SET balance = balance + $2, updated_at = now()
      WHERE tenant_id = $1`,
    [tenantId, credits]
  );
  return true;
}

/**
 * Jednorázový bonus (např. startovní kredity AI Builderu). Idempotence přes
 * `note` — stejný bonus se témuž tenantovi nikdy nepřipíše dvakrát.
 */
export async function grantBonusCredits(tenantId: number, amount: number, note: string): Promise<boolean> {
  if (!Number.isInteger(amount) || amount <= 0) return false;
  await getWallet(tenantId);

  const inserted = await query<{ id: number }>(
    `INSERT INTO ai_credit_ledger (tenant_id, kind, amount, note)
     SELECT $1, 'admin_adjust', $2, $3
      WHERE NOT EXISTS (
        SELECT 1 FROM ai_credit_ledger
         WHERE tenant_id = $1 AND kind = 'admin_adjust' AND note = $3
      )
     RETURNING id`,
    [tenantId, amount, note]
  );
  if (inserted.length === 0) return false;

  await query(
    `UPDATE ai_credit_wallets
        SET balance = balance + $2, updated_at = now()
      WHERE tenant_id = $1`,
    [tenantId, amount]
  );
  return true;
}

export interface LedgerEntry {
  id: number;
  kind: string;
  amount: number;
  note: string | null;
  created_at: string;
}

export async function getLedger(tenantId: number, limit = 30): Promise<LedgerEntry[]> {
  return query<LedgerEntry>(
    `SELECT id, kind, amount, note, created_at
       FROM ai_credit_ledger
      WHERE tenant_id = $1
      ORDER BY created_at DESC, id DESC
      LIMIT $2`,
    [tenantId, limit]
  );
}

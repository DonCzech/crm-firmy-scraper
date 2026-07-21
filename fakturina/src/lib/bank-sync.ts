import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "crypto";
import { query } from "./db";

export type BankProvider = "fio" | "airbank";

export interface BankConnection {
  id: string;
  company_id: string;
  bank_account_id: string;
  provider: BankProvider;
  name: string;
  token_encrypted: string | null;
  last_transaction_id: string | null;
  last_sync_at: number | null;
}

export interface NormalizedBankTransaction {
  providerTransactionId: string;
  bookingDate: string | null;
  amount: number;
  currency: string;
  accountNumber: string | null;
  bankCode: string | null;
  variableSymbol: string | null;
  message: string | null;
  raw: unknown;
}

function tokenSecret() {
  const secret = process.env.BANK_TOKEN_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("BANK_TOKEN_SECRET není nastaven nebo je příliš krátký.");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptBankToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenSecret(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptBankToken(payload: string) {
  const [ivB64, tagB64, encryptedB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !encryptedB64) throw new Error("Neplatný formát bankovního tokenu.");
  const decipher = createDecipheriv("aes-256-gcm", tokenSecret(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function col(tx: Record<string, unknown>, key: string): string | null {
  const value = tx[key];
  if (value == null) return null;
  if (typeof value === "object" && "value" in value) {
    const nested = (value as { value?: unknown }).value;
    return nested == null ? null : String(nested).trim();
  }
  return String(value).trim();
}

function num(value: string | null) {
  if (!value) return 0;
  return Number(value.replace(/\s/g, "").replace(",", "."));
}

function normalizeVs(value: string | null) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits || null;
}

export function parseFioTransaction(tx: Record<string, unknown>): NormalizedBankTransaction | null {
  const providerTransactionId =
    col(tx, "column22") ||
    col(tx, "column17") ||
    col(tx, "id") ||
    [col(tx, "column0"), col(tx, "column1"), col(tx, "column5"), col(tx, "column16")].filter(Boolean).join("|");
  const amount = num(col(tx, "column1") || col(tx, "amount"));
  if (!providerTransactionId || Number.isNaN(amount)) return null;

  return {
    providerTransactionId,
    bookingDate: col(tx, "column0") || col(tx, "date"),
    amount,
    currency: (col(tx, "column14") || col(tx, "currency") || "CZK").toUpperCase(),
    accountNumber: col(tx, "column2") || col(tx, "accountNumber"),
    bankCode: col(tx, "column3") || col(tx, "bankCode"),
    variableSymbol: normalizeVs(col(tx, "column5") || col(tx, "variableSymbol")),
    message: col(tx, "column16") || col(tx, "column25") || col(tx, "message"),
    raw: tx,
  };
}

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchFioTransactions(token: string, from = dateDaysAgo(30), to = todayISO()) {
  const url = `https://www.fio.cz/ib_api/rest/periods/${encodeURIComponent(token)}/${from}/${to}/transactions.json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Fio API vrátilo HTTP ${res.status}.`);
  }
  const data = (await res.json()) as {
    accountStatement?: { transactionList?: { transaction?: Record<string, unknown>[] } };
  };
  const list = data.accountStatement?.transactionList?.transaction ?? [];
  return list.map(parseFioTransaction).filter((item): item is NormalizedBankTransaction => Boolean(item));
}

export async function matchIncomingPayment(companyId: string, tx: NormalizedBankTransaction) {
  if (tx.amount <= 0 || !tx.variableSymbol) return null;

  const { rows } = await query(
    `SELECT id, number
     FROM fak_invoices
     WHERE company_id = $1
       AND status IN ('sent', 'viewed', 'overdue')
       AND currency = $2
       AND ABS(total::numeric - $3::numeric) < 0.01
       AND (
         regexp_replace(COALESCE(variable_symbol, ''), '\\D', '', 'g') = $4
         OR regexp_replace(number, '\\D', '', 'g') = $4
       )`,
    [companyId, tx.currency, tx.amount, tx.variableSymbol]
  );

  if (rows.length !== 1) return null;
  const invoice = rows[0] as { id: string };
  const now = Math.floor(Date.now() / 1000);

  await query(
    "UPDATE fak_invoices SET status = 'paid', paid_at = $1, updated_at = $1 WHERE id = $2 AND company_id = $3",
    [now, invoice.id, companyId]
  );
  await query(
    `INSERT INTO fak_audit_log (id, company_id, user_id, action, entity_type, entity_id, meta)
     VALUES ($1, $2, $3, 'invoice.paid_bank_match', 'invoice', $4, $5)`,
    [
      randomUUID(),
      companyId,
      "system",
      invoice.id,
      JSON.stringify({
        providerTransactionId: tx.providerTransactionId,
        amount: tx.amount,
        currency: tx.currency,
        variableSymbol: tx.variableSymbol,
      }),
    ]
  );

  return invoice.id;
}

export async function syncBankConnection(connection: BankConnection) {
  if (connection.provider === "airbank") {
    throw new Error("Air Bank PSD2 vyžaduje registrovanou aplikaci, certifikáty a OAuth souhlas klienta. Provider je připravený, ale bez těchto údajů nelze stahovat transakce.");
  }
  if (!connection.token_encrypted) throw new Error("Bankovní spojení nemá uložený API token.");

  const token = decryptBankToken(connection.token_encrypted);
  const from = connection.last_sync_at
    ? new Date(connection.last_sync_at * 1000 - 3 * 86400 * 1000).toISOString().slice(0, 10)
    : dateDaysAgo(30);
  const transactions = await fetchFioTransactions(token, from, todayISO());
  let inserted = 0;
  let matched = 0;
  let lastTransactionId = connection.last_transaction_id;

  for (const tx of transactions) {
    const result = await query(
      `INSERT INTO fak_bank_transactions
         (id, company_id, bank_connection_id, provider_transaction_id, booking_date, amount,
          currency, account_number, bank_code, variable_symbol, message, raw, matched_invoice_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NULL)
       ON CONFLICT (bank_connection_id, provider_transaction_id) DO NOTHING
       RETURNING (xmax = 0) AS inserted`,
      [
        randomUUID(),
        connection.company_id,
        connection.id,
        tx.providerTransactionId,
        tx.bookingDate,
        tx.amount,
        tx.currency,
        tx.accountNumber,
        tx.bankCode,
        tx.variableSymbol,
        tx.message,
        JSON.stringify(tx.raw),
      ]
    );
    if (result.rows[0]?.inserted) {
      inserted += 1;
      const matchedInvoiceId = await matchIncomingPayment(connection.company_id, tx);
      if (matchedInvoiceId) {
        matched += 1;
        await query(
          `UPDATE fak_bank_transactions SET matched_invoice_id = $1
           WHERE bank_connection_id = $2 AND provider_transaction_id = $3`,
          [matchedInvoiceId, connection.id, tx.providerTransactionId]
        );
      }
    }
    lastTransactionId = tx.providerTransactionId;
  }

  await query(
    "UPDATE fak_bank_connections SET last_sync_at = $1, last_transaction_id = $2, updated_at = $1 WHERE id = $3",
    [Math.floor(Date.now() / 1000), lastTransactionId, connection.id]
  );

  return { fetched: transactions.length, inserted, matched };
}

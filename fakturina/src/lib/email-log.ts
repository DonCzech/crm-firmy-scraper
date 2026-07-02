import { randomUUID } from "crypto";
import { query } from "./db";

export async function emailLog(opts: {
  companyId?: string | null;
  invoiceId?: string | null;
  quoteId?: string | null;
  type: "invoice" | "quote" | "reminder";
  recipient: string;
  subject?: string | null;
  status: "sent" | "error";
  providerMessageId?: string | null;
  error?: string | null;
}) {
  try {
    await query(
      `INSERT INTO fak_email_log
         (id, company_id, invoice_id, quote_id, type, recipient, subject, status,
          provider, provider_message_id, error)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'resend',$9,$10)`,
      [
        randomUUID(),
        opts.companyId ?? null,
        opts.invoiceId ?? null,
        opts.quoteId ?? null,
        opts.type,
        opts.recipient,
        opts.subject ?? null,
        opts.status,
        opts.providerMessageId ?? null,
        opts.error ?? null,
      ]
    );
  } catch {
    // Email logging must never block the user-facing send action.
  }
}

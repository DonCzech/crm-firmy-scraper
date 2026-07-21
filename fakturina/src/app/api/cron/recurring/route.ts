import { randomBytes, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { hasValidCronSecret } from "@/lib/security";
import { sendInvoiceEmail, invoiceEmailSubject } from "@/lib/email";
import { emailLog } from "@/lib/email-log";

export const dynamic = "force-dynamic";

function nextDate(date: string, period: string) {
  const value = new Date(`${date}T12:00:00Z`);
  if (period === "weekly") value.setUTCDate(value.getUTCDate() + 7);
  else if (period === "monthly") value.setUTCMonth(value.getUTCMonth() + 1);
  else if (period === "quarterly") value.setUTCMonth(value.getUTCMonth() + 3);
  else value.setUTCFullYear(value.getUTCFullYear() + 1);
  return value.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Cron není nakonfigurován" }, { status: 503 });
  }
  if (!hasValidCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const due = await query(
    `SELECT id FROM fak_recurring_invoices
     WHERE active = true AND next_issue_date <= $1
       AND (end_date IS NULL OR next_issue_date <= end_date)
     ORDER BY next_issue_date ASC LIMIT 100`,
    [today]
  );
  const results: Array<{ recurringId: string; invoiceId?: string; status: string; error?: string }> = [];

  for (const candidate of due.rows) {
    try {
      const result = await withTransaction(async (client) => {
        const locked = await client.query(
          `SELECT r.*, c.invoice_prefix, c.invoice_next, c.invoice_number_year_format,
                  c.invoice_number_month, c.invoice_number_position, c.invoice_number_volume,
                  c.invoice_number_separator, c.vat_status, c.name AS company_name,
                  cl.name AS client_name, cl.email AS client_email
           FROM fak_recurring_invoices r
           JOIN fak_companies c ON c.id = r.company_id
           LEFT JOIN fak_clients cl ON cl.id = r.client_id AND cl.company_id = r.company_id
           WHERE r.id = $1 AND r.active = true AND r.next_issue_date <= $2
           FOR UPDATE OF r, c SKIP LOCKED`,
          [candidate.id, today]
        );
        const recurring = locked.rows[0];
        if (!recurring) return null;
        const itemRows = await client.query(
          "SELECT * FROM fak_recurring_invoice_items WHERE recurring_invoice_id = $1 ORDER BY sort_order",
          [recurring.id]
        );
        if (itemRows.rows.length === 0) throw new Error("Opakovaná faktura nemá položky");

        const allocation = await client.query(
          "UPDATE fak_companies SET invoice_next = invoice_next + 1 WHERE id = $1 RETURNING invoice_next - 1 AS allocated",
          [recurring.company_id]
        );
        const number = generateInvoiceNumber({
          invoice_prefix: recurring.invoice_prefix ?? "",
          invoice_number_year_format: recurring.invoice_number_year_format ?? "full",
          invoice_number_month: recurring.invoice_number_month ?? false,
          invoice_number_position: recurring.invoice_number_position ?? "end",
          invoice_number_volume: recurring.invoice_number_volume ?? 10000,
          invoice_number_separator: recurring.invoice_number_separator ?? "-",
          invoice_next: Number(allocation.rows[0].allocated),
        }, new Date(`${recurring.next_issue_date}T00:00:00Z`));

        const issueDate = recurring.next_issue_date;
        const dueAt = new Date(`${issueDate}T12:00:00Z`);
        dueAt.setUTCDate(dueAt.getUTCDate() + Number(recurring.due_days));
        const dueDate = dueAt.toISOString().slice(0, 10);
        const vatPayer = recurring.vat_status === "vat_payer";
        const items = itemRows.rows.map((item) => {
          const quantity = Number(item.quantity);
          const unitPrice = Number(item.unit_price);
          const net = Math.round(quantity * unitPrice * 100) / 100;
          const vat = vatPayer ? Math.round(net * Number(item.vat_rate)) / 100 : 0;
          return { ...item, quantity, unitPrice, net, vat, gross: Math.round((net + vat) * 100) / 100 };
        });
        const subtotal = Math.round(items.reduce((sum, item) => sum + item.net, 0) * 100) / 100;
        const vatTotal = Math.round(items.reduce((sum, item) => sum + item.vat, 0) * 100) / 100;
        const total = Math.round((subtotal + vatTotal) * 100) / 100;
        const invoiceId = randomUUID();
        const publicToken = randomBytes(24).toString("hex");

        await client.query(
          `INSERT INTO fak_invoices
             (id, company_id, client_id, number, variable_symbol, type, status, currency,
              issue_date, due_date, subtotal, vat_total, total, note, public_token)
           VALUES ($1,$2,$3,$4,$5,$6,'draft',$7,$8,$9,$10,$11,$12,$13,$14)`,
          [invoiceId, recurring.company_id, recurring.client_id, number, number.replace(/\D/g, ""),
           recurring.as_proforma ? "proforma" : "invoice", recurring.currency, issueDate, dueDate,
           subtotal, vatTotal, total, recurring.note, publicToken]
        );
        for (const item of items) {
          await client.query(
            `INSERT INTO fak_invoice_items
               (id, invoice_id, name, quantity, unit, unit_price, vat_rate,
                total_without_vat, total_vat, total_with_vat, sort_order)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [randomUUID(), invoiceId, item.name, item.quantity, item.unit, item.unitPrice,
             item.vat_rate, item.net, item.vat, item.gross, item.sort_order]
          );
        }
        const following = nextDate(issueDate, recurring.period);
        const remainsActive = !recurring.end_date || following <= recurring.end_date;
        await client.query(
          "UPDATE fak_recurring_invoices SET next_issue_date = $1, active = $2 WHERE id = $3",
          [following, remainsActive, recurring.id]
        );
        await client.query(
          `INSERT INTO fak_audit_log (id, company_id, user_id, action, entity_type, entity_id, meta)
           VALUES ($1,$2,'system','invoice.created_recurring','invoice',$3,$4)`,
          [randomUUID(), recurring.company_id, invoiceId, JSON.stringify({ recurringId: recurring.id })]
        );
        return {
          invoiceId,
          requestedEmail: Boolean(recurring.send_by_email),
          emailData: recurring.client_email ? {
            to: recurring.client_email as string,
            clientName: (recurring.client_name ?? recurring.client_email) as string,
            invoiceNumber: number,
            total,
            currency: recurring.currency as string,
            dueDate,
            publicToken,
            supplierName: recurring.company_name as string,
          } : null,
          companyId: recurring.company_id as string,
        };
      });
      if (result) {
        let status = "created";
        if (result.requestedEmail) {
          if (!result.emailData) {
            status = "created_email_missing";
          } else {
            try {
              const messageId = await sendInvoiceEmail(result.emailData);
              await emailLog({
                companyId: result.companyId,
                invoiceId: result.invoiceId,
                type: "invoice",
                recipient: result.emailData.to,
                subject: invoiceEmailSubject(result.emailData),
                status: "sent",
                providerMessageId: messageId,
              });
              await query(
                "UPDATE fak_invoices SET status = 'sent', sent_at = $1 WHERE id = $2 AND company_id = $3",
                [Math.floor(Date.now() / 1000), result.invoiceId, result.companyId]
              );
              status = "created_sent";
            } catch (error) {
              await emailLog({
                companyId: result.companyId,
                invoiceId: result.invoiceId,
                type: "invoice",
                recipient: result.emailData.to,
                subject: invoiceEmailSubject(result.emailData),
                status: "error",
                error: error instanceof Error ? error.message : "Odeslání selhalo",
              });
              status = "created_email_error";
            }
          }
        }
        results.push({
          recurringId: candidate.id,
          invoiceId: result.invoiceId,
          status,
        });
      }
    } catch (error) {
      results.push({ recurringId: candidate.id, status: "error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  return NextResponse.json({ ok: !results.some((item) => item.status === "error"), processed: results.length, results });
}

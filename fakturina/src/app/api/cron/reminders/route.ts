import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query, initDb } from "@/lib/db";
import { reminderEmailSubject, sendReminderEmail } from "@/lib/email";
import { emailLog } from "@/lib/email-log";
import { hasValidCronSecret } from "@/lib/security";

export const dynamic = "force-dynamic";

// Typ upomínky → počet dní relativně k datu splatnosti (záporné = před, 0 = v den, kladné = po)
const REMINDER_TYPES = [
  { type: "before_due",   daysOffset: -3, settingKey: "before_due_enabled"  },
  { type: "due_day",      daysOffset:  0, settingKey: "due_day_enabled"      },
  { type: "after_3",      daysOffset:  3, settingKey: "after_3_days_enabled" },
  { type: "after_10",     daysOffset: 10, settingKey: "after_10_days_enabled"},
  { type: "after_20",     daysOffset: 20, settingKey: "after_20_days_enabled"},
] as const;

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  // Security: bearer token or Vercel cron header
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Cron není nakonfigurován" }, { status: 503 });
  }
  if (!hasValidCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initDb();
  const today = todayISO();
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const results: { invoiceId: string; type: string; status: string }[] = [];
  const runId = randomUUID();
  const startedAt = Math.floor(Date.now() / 1000);

  await query(
    `INSERT INTO fak_automation_runs (id, type, status, started_at, summary)
     VALUES ($1, 'reminders', $2, $3, $4)`,
    [runId, dryRun ? "dry_run" : "running", startedAt, JSON.stringify({ date: today, dryRun })]
  );

  // Načti všechny aktivní faktury (odeslané/zobrazené/po splatnosti) s emailem klienta
  const { rows: invoices } = await query(
    `SELECT
       i.id, i.number, i.due_date, i.total, i.currency, i.public_token, i.company_id,
       co.vat_status,
       cl.name as client_name, cl.email as client_email,
       co.name as supplier_name
     FROM fak_invoices i
     JOIN fak_companies co ON co.id = i.company_id
     LEFT JOIN fak_clients cl ON cl.id = i.client_id
     WHERE i.status IN ('sent', 'viewed', 'overdue')
       AND i.due_date IS NOT NULL
       AND cl.email IS NOT NULL
       AND cl.email != ''`,
    []
  );

  for (const invoice of invoices) {
    // Načti nastavení upomínek pro tuto firmu
    const { rows: settingsRows } = await query(
      "SELECT * FROM fak_reminder_settings WHERE company_id = $1",
      [invoice.company_id]
    );
    const settings = settingsRows[0];
    if (!settings) continue;

    // Načti šablony e-mailů
    const templateBefore = settings.email_template_before_due;
    const templateDue = settings.email_template_due_day;
    const templateAfter = settings.email_template_after_due;

    for (const reminder of REMINDER_TYPES) {
      // Je tato upomínka povolena?
      if (!settings[reminder.settingKey]) continue;

      // Má se dnes odeslat?
      const triggerDate = addDays(invoice.due_date, reminder.daysOffset);
      if (triggerDate !== today) continue;

      // Nebyla tato upomínka pro tuto fakturu již odeslána?
      const { rows: logged } = await query(
        "SELECT id FROM fak_reminder_log WHERE invoice_id = $1 AND type = $2",
        [invoice.id, reminder.type]
      );
      if (logged.length > 0) continue;

      // Vyber správnou šablonu
      let template = templateAfter;
      if (reminder.daysOffset < 0) template = templateBefore;
      else if (reminder.daysOffset === 0) template = templateDue;

      const daysOverdue = reminder.daysOffset > 0 ? reminder.daysOffset : undefined;

      try {
        if (dryRun) {
          results.push({ invoiceId: invoice.id, type: reminder.type, status: "dry_run" });
          continue;
        }

        const reminderLogId = randomUUID();
        const claimed = await query(
          `INSERT INTO fak_reminder_log (id, invoice_id, type, sent_at, status)
           VALUES ($1, $2, $3, $4, 'sending')
           ON CONFLICT (invoice_id, type) DO NOTHING RETURNING id`,
          [reminderLogId, invoice.id, reminder.type, Math.floor(Date.now() / 1000)]
        );
        if (!claimed.rows[0]) continue;

        const emailData = {
          to: invoice.client_email,
          clientName: invoice.client_name ?? "Zákazník",
          invoiceNumber: invoice.number,
          total: parseFloat(invoice.total),
          currency: invoice.currency ?? "CZK",
          dueDate: invoice.due_date,
          publicToken: invoice.public_token,
          supplierName: invoice.supplier_name,
          template,
          daysOverdue,
        };

        const messageId = await sendReminderEmail(emailData);
        await emailLog({
          companyId: invoice.company_id,
          invoiceId: invoice.id,
          type: "reminder",
          recipient: invoice.client_email,
          subject: reminderEmailSubject(emailData),
          status: "sent",
          providerMessageId: messageId,
        });

        await query("UPDATE fak_reminder_log SET status = 'sent' WHERE id = $1", [reminderLogId]);

        results.push({ invoiceId: invoice.id, type: reminder.type, status: "sent" });
      } catch (err) {
        console.error(`Reminder failed for invoice ${invoice.id} type ${reminder.type}:`, err);
        await emailLog({
          companyId: invoice.company_id,
          invoiceId: invoice.id,
          type: "reminder",
          recipient: invoice.client_email,
          subject: `Upomínka faktury ${invoice.number}`,
          status: "error",
          error: err instanceof Error ? err.message : "Odeslání upomínky selhalo",
        });
        results.push({ invoiceId: invoice.id, type: reminder.type, status: "error" });
        await query(
          "DELETE FROM fak_reminder_log WHERE invoice_id = $1 AND type = $2 AND status = 'sending'",
          [invoice.id, reminder.type]
        ).catch(() => undefined);
      }
    }
  }

  await query(
    `UPDATE fak_automation_runs
     SET status = $1, finished_at = $2, summary = $3
     WHERE id = $4`,
    [
      dryRun ? "dry_run" : results.some((item) => item.status === "error") ? "partial_error" : "success",
      Math.floor(Date.now() / 1000),
      JSON.stringify({ date: today, dryRun, processed: results.length, results }),
      runId,
    ]
  );

  return NextResponse.json({
    ok: true,
    dryRun,
    date: today,
    processed: results.length,
    results,
  });
}

import { query, queryOne } from "@/lib/db";
import { sendEmail } from "@/lib/email";

/**
 * Modul „Hromadné e-maily“ — kampaně nad reálnými segmenty zákazníků.
 * Odeslání zapisuje příjemce do commerce_email_queue (outbox s auditem)
 * a doručuje přes sendEmail (Resend; bez API klíče se e-mail jen zaloguje).
 */

export interface EmailCampaign {
  id: number;
  name: string;
  subject: string;
  html_body: string;
  segment: string;
  status: "draft" | "sent";
  recipients_count: number;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  created_at: string;
}

export const CAMPAIGN_SEGMENTS: { key: string; label: string; description: string }[] = [
  { key: "newsletter", label: "Odběratelé newsletteru", description: "Aktivní odběratelé z patičky obchodu" },
  { key: "customers-all", label: "Všichni zákazníci", description: "Každý, kdo někdy objednal" },
  { key: "customers-active", label: "Aktivní zákazníci", description: "Objednávka za posledních 90 dní" },
  { key: "customers-inactive", label: "Neaktivní zákazníci", description: "Nakoupili dříve, ale 90+ dní nic" },
  { key: "vip", label: "VIP zákazníci", description: "Celková útrata 10 000 Kč a více" },
];

export async function initEmailCampaignsDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_email_campaigns (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      html_body TEXT NOT NULL,
      segment TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      recipients_count INTEGER NOT NULL DEFAULT 0,
      sent_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE commerce_email_queue ADD COLUMN IF NOT EXISTS campaign_id INTEGER;
  `);
}

/** Reálné e-maily segmentu z objednávek / newsletteru (deduplikované, lowercase). */
export async function resolveSegment(tenantId: number, segment: string): Promise<string[]> {
  const sql: Record<string, string> = {
    newsletter: `SELECT DISTINCT lower(email) AS email FROM commerce_newsletter
                 WHERE tenant_id = $1 AND unsubscribed_at IS NULL`,
    "customers-all": `SELECT DISTINCT lower(email) AS email FROM orders WHERE tenant_id = $1`,
    "customers-active": `SELECT DISTINCT lower(email) AS email FROM orders
                         WHERE tenant_id = $1 AND created_at > now() - interval '90 days'`,
    "customers-inactive": `SELECT lower(email) AS email FROM orders WHERE tenant_id = $1
                           GROUP BY lower(email)
                           HAVING MAX(created_at) <= now() - interval '90 days'`,
    vip: `SELECT lower(email) AS email FROM orders
          WHERE tenant_id = $1 AND payment_status = 'paid'
          GROUP BY lower(email) HAVING SUM(total_cents) >= 1000000`,
  };
  const q = sql[segment];
  if (!q) return [];
  const rows = await query<{ email: string }>(q, [tenantId]);
  return rows.map((r) => r.email).filter(Boolean);
}

export async function listCampaigns(tenantId: number): Promise<EmailCampaign[]> {
  await initEmailCampaignsDb();
  return query<EmailCampaign>(
    `SELECT id, name, subject, html_body, segment, status, recipients_count, sent_count, failed_count, sent_at, created_at
     FROM commerce_email_campaigns WHERE tenant_id = $1 ORDER BY id DESC`,
    [tenantId]
  );
}

export async function createCampaign(
  tenantId: number,
  input: { name: string; subject: string; html_body: string; segment: string }
): Promise<EmailCampaign> {
  await initEmailCampaignsDb();
  const row = await queryOne<EmailCampaign>(
    `INSERT INTO commerce_email_campaigns (tenant_id, name, subject, html_body, segment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, subject, html_body, segment, status, recipients_count, sent_count, failed_count, sent_at, created_at`,
    [tenantId, input.name, input.subject, input.html_body, input.segment]
  );
  return row as EmailCampaign;
}

export async function deleteCampaign(tenantId: number, id: number): Promise<void> {
  await initEmailCampaignsDb();
  await query(`DELETE FROM commerce_email_campaigns WHERE tenant_id = $1 AND id = $2 AND status = 'draft'`, [tenantId, id]);
}

function campaignHtml(bodyHtml: string, shopName: string): string {
  return `<!doctype html><html lang="cs"><body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#fff;border-radius:14px;padding:28px;border:1px solid #e5e5e5">
      <p style="margin:0 0 16px;font-size:18px;font-weight:800;color:#111">${shopName}</p>
      <div style="font-size:14.5px;line-height:1.65;color:#333">${bodyHtml}</div>
    </div>
    <p style="text-align:center;font-size:11px;color:#999;margin-top:14px">
      Tento e-mail jste obdrželi jako zákazník obchodu ${shopName}. Odhlásit se můžete v patičce obchodu.
    </p>
  </div></body></html>`;
}

/** Odešle kampaň: zapíše outbox (commerce_email_queue) a doručí přes Resend. */
export async function sendCampaign(
  tenantId: number,
  campaignId: number,
  shopName: string
): Promise<{ recipients: number; sent: number; failed: number } | { error: string }> {
  await initEmailCampaignsDb();
  const campaign = await queryOne<EmailCampaign>(
    `SELECT id, name, subject, html_body, segment, status, recipients_count, sent_count, failed_count, sent_at, created_at
     FROM commerce_email_campaigns WHERE tenant_id = $1 AND id = $2`,
    [tenantId, campaignId]
  );
  if (!campaign) return { error: "Kampaň nenalezena" };
  if (campaign.status === "sent") return { error: "Kampaň už byla odeslána" };

  const recipients = await resolveSegment(tenantId, campaign.segment);
  if (!recipients.length) return { error: "Segment neobsahuje žádné příjemce" };

  const html = campaignHtml(campaign.html_body, shopName);
  let sent = 0;
  let failed = 0;

  for (const email of recipients) {
    try {
      await sendEmail({ to: email, subject: campaign.subject, html });
      await query(
        `INSERT INTO commerce_email_queue (tenant_id, campaign_id, to_email, subject, html_body, status, sent_at)
         VALUES ($1, $2, $3, $4, $5, 'sent', now())`,
        [tenantId, campaignId, email, campaign.subject, html]
      );
      sent++;
    } catch (e) {
      await query(
        `INSERT INTO commerce_email_queue (tenant_id, campaign_id, to_email, subject, html_body, status, error)
         VALUES ($1, $2, $3, $4, $5, 'failed', $6)`,
        [tenantId, campaignId, email, campaign.subject, html, e instanceof Error ? e.message : String(e)]
      ).catch(() => undefined);
      failed++;
    }
  }

  await query(
    `UPDATE commerce_email_campaigns
     SET status = 'sent', recipients_count = $3, sent_count = $4, failed_count = $5, sent_at = now(), updated_at = now()
     WHERE tenant_id = $1 AND id = $2`,
    [tenantId, campaignId, recipients.length, sent, failed]
  );
  return { recipients: recipients.length, sent, failed };
}

/** Outbox kampaně (posledních N řádků fronty). */
export async function getCampaignOutbox(tenantId: number, campaignId: number, limit = 100) {
  await initEmailCampaignsDb();
  return query<{ id: number; to_email: string; subject: string; status: string; sent_at: string | null; error: string | null }>(
    `SELECT id, to_email, subject, status, sent_at, error
     FROM commerce_email_queue WHERE tenant_id = $1 AND campaign_id = $2
     ORDER BY id DESC LIMIT $3`,
    [tenantId, campaignId, limit]
  );
}

/** Náhled velikostí všech segmentů (pro admin UI). */
export async function getSegmentCounts(tenantId: number): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const s of CAMPAIGN_SEGMENTS) {
    const emails = await resolveSegment(tenantId, s.key);
    out[s.key] = emails.length;
  }
  return out;
}

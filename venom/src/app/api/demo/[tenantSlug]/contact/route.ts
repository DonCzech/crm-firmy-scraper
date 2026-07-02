import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantBySlug, query } from "@/lib/db";
import { sendEmail } from "@/lib/email";

const BodySchema = z.object({
  name: z.string().max(200).optional(),
  email: z.string().email().max(300),
  phone: z.string().max(50).optional(),
  message: z.string().max(5000).min(1),
  website: z.string().max(0).optional(), // honeypot — must be empty
});

// 3 submissions per IP per hour
const contactRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = contactRateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    contactRateLimit.set(ip, { count: 1, resetAt: now + 60 * 60_000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

interface RouteParams {
  params: Promise<{ tenantSlug: string }>;
}

function contactNotificationHtml(opts: {
  senderName: string;
  fromName?: string;
  fromEmail: string;
  fromPhone?: string;
  message: string;
  footerText: string;
}): string {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Inter,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="background:#0f172a;padding:28px 36px;">
          <p style="margin:0;color:#94a3b8;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">Webero · ${escape(opts.senderName)}</p>
          <h1 style="margin:8px 0 0;color:#f1f5f9;font-size:22px;font-weight:700;">Nová zpráva z webu</h1>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                <p style="margin:0 0 2px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Jméno</p>
                <p style="margin:0;font-size:15px;color:#0f172a;font-weight:500;">${escape(opts.fromName || "—")}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                <p style="margin:0 0 2px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">E-mail</p>
                <p style="margin:0;font-size:15px;color:#2563eb;"><a href="mailto:${escape(opts.fromEmail)}" style="color:#2563eb;">${escape(opts.fromEmail)}</a></p>
              </td>
            </tr>
            ${opts.fromPhone ? `<tr>
              <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                <p style="margin:0 0 2px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Telefon</p>
                <p style="margin:0;font-size:15px;color:#0f172a;">${escape(opts.fromPhone)}</p>
              </td>
            </tr>` : ""}
            <tr>
              <td style="padding:10px 0;">
                <p style="margin:0 0 8px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Zpráva</p>
                <div style="background:#f8fafc;border-left:3px solid #2563eb;border-radius:4px;padding:14px 16px;">
                  <p style="margin:0;font-size:15px;color:#334155;line-height:1.7;white-space:pre-wrap;">${escape(opts.message)}</p>
                </div>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td style="border-radius:8px;background:#2563eb;">
                <a href="mailto:${escape(opts.fromEmail)}" style="display:inline-block;padding:12px 22px;color:#fff;font-size:14px;font-weight:600;text-decoration:none;">Odpovědět →</a>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:16px 36px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">${opts.footerText || "Odesláno přes Webero kontaktní formulář"}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { tenantSlug } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return Response.json({ error: "Příliš mnoho zpráv. Zkuste to za hodinu." }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Neplatná data formuláře." }, { status: 400 });
  }

  // Honeypot check
  if (parsed.data.website && parsed.data.website.length > 0) {
    // Silently succeed for bots
    return Response.json({ ok: true });
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") {
    return Response.json({ error: "Tenant nenalezen." }, { status: 404 });
  }

  await query(
    `INSERT INTO contact_submissions (tenant_id, name, email, phone, message, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [tenant.id, parsed.data.name ?? null, parsed.data.email, parsed.data.phone ?? null, parsed.data.message, ip]
  );

  // Notify tenant via email (fire-and-forget)
  const recipientEmail = (tenant.email_settings as Record<string, string> | null)?.from_email || tenant.email;
  const senderName = (tenant.email_settings as Record<string, string> | null)?.from_name || tenant.business_name || tenant.slug;
  const footerText = (tenant.email_settings as Record<string, string> | null)?.footer_text || "";

  sendEmail({
    to: recipientEmail,
    subject: `Nová zpráva z kontaktního formuláře — ${senderName}`,
    html: contactNotificationHtml({
      senderName,
      fromName: parsed.data.name,
      fromEmail: parsed.data.email,
      fromPhone: parsed.data.phone,
      message: parsed.data.message,
      footerText,
    }),
  }).catch((e) => console.error("[contact] email failed:", e));

  return Response.json({ ok: true });
}

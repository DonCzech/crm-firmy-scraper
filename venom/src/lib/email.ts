const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Webero <noreply@webero.co>";

export interface EmailAttachment {
  filename: string;
  /** Obsah souboru v base64 (Resend formát). */
  content: string;
}

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail(opts: SendOptions): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log(`[email] No RESEND_API_KEY — would send to ${opts.to}: ${opts.subject}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.attachments?.length ? { attachments: opts.attachments } : {}),
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[email] Resend error ${res.status}:`, body);
  }
}

export function welcomeEmailHtml(opts: {
  name: string;
  email: string;
  slug: string;
  appUrl: string;
}): string {
  const editorUrl = `${opts.appUrl}/demo/${opts.slug}/studio`;
  const dashUrl = `${opts.appUrl}/account/dashboard`;

  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Inter,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:40px 48px 36px;">
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="width:40px;height:40px;background:rgba(255,255,255,0.15);border-radius:10px;text-align:center;vertical-align:middle;">
                <span style="color:#fff;font-weight:800;font-size:18px;">W</span>
              </td>
              <td style="padding-left:12px;color:#fff;font-size:20px;font-weight:700;vertical-align:middle;">Webero</td>
            </tr>
          </table>
          <p style="margin:24px 0 0;color:rgba(255,255,255,0.55);font-size:13px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">Vítejte</p>
          <h1 style="margin:8px 0 0;color:#fff;font-size:28px;font-weight:800;line-height:1.2;">Váš web je připravený,<br>${opts.name ? opts.name.split(" ")[0] : "vítejte"}!</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 48px;">
          <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.7;">
            Váš zkušební web na <strong>Webero</strong> byl úspěšně vytvořen. Máte 14 dní zdarma s přístupem ke všem funkcím.
          </p>
          <p style="margin:0 0 8px;color:#6b7280;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Přihlašovací údaje</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
            <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>E-mail:</strong> ${opts.email}</p>
            <p style="margin:0;font-size:14px;color:#374151;"><strong>Heslo:</strong> vaše zadané heslo při registraci</p>
          </div>
          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
            <tr>
              <td style="border-radius:10px;background:#2563eb;">
                <a href="${editorUrl}" style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:700;text-decoration:none;">Otevřít editor →</a>
              </td>
              <td style="padding-left:12px;">
                <a href="${dashUrl}" style="display:inline-block;padding:14px 24px;color:#374151;font-size:14px;font-weight:600;text-decoration:none;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">Moje projekty</a>
              </td>
            </tr>
          </table>
          <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
            Potřebujete pomoc? Napište nám na <a href="mailto:podpora@webero.co" style="color:#2563eb;">podpora@webero.co</a>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 48px;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 Webero s.r.o. · <a href="${opts.appUrl}" style="color:#9ca3af;">webero.co</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  slug: string;
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://webero.co";
  await sendEmail({
    to: opts.to,
    subject: "Vítejte ve Webero — váš web je připravený!",
    html: welcomeEmailHtml({ name: opts.name, email: opts.to, slug: opts.slug, appUrl }),
  });
}

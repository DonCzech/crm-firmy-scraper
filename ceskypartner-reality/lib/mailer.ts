import { createTransport } from "nodemailer";
import { prisma } from "./prisma";

type MailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

/**
 * Odešle e-mail přes SMTP z admin Nastavení. Nikdy nevyhazuje — poptávka se
 * musí uložit i když e-mail selže; chyba se jen zaloguje.
 */
export async function sendMailSafe(input: MailInput): Promise<boolean> {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass"] } },
    });
    const cfg: Record<string, string> = {};
    rows.forEach((s) => { cfg[s.key] = s.value; });
    if (!cfg.smtp_host || !cfg.smtp_user || !cfg.smtp_pass) return false;

    const transport = createTransport({
      host: cfg.smtp_host,
      port: Number(cfg.smtp_port || 587),
      secure: Number(cfg.smtp_port || 587) === 465,
      auth: { user: cfg.smtp_user, pass: cfg.smtp_pass },
    });

    await transport.sendMail({
      from: `"Český Partner" <${cfg.smtp_user}>`,
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return true;
  } catch (e: any) {
    console.error("sendMailSafe:", e.message);
    return false;
  }
}

/** Jednotná e-mailová šablona — tmavá hlavička s logem, obsah, patička. */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="cs"><body style="margin:0;padding:0;background:#EDEAE3;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FAF9F6;">
      <tr><td style="background:#14181A;padding:22px 32px;">
        <span style="color:#FAF9F6;font-size:15px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">Český&nbsp;Partner</span><br>
        <span style="color:#A9885A;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Realitní kancelář</span>
      </td></tr>
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#14181A;">${title}</h1>
        <div style="font-size:14px;line-height:1.7;color:#3a3f42;">${bodyHtml}</div>
      </td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid #e3e0d8;font-size:12px;color:#6E6A63;">
        Český Partner s.r.o. · ceskypartner.cz · Tento e-mail byl odeslán automaticky.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
